
import { useState, useRef, useEffect } from 'react';
import { rewriteTextForEvent, generateAnnouncerAudio, AnnouncerStyle, AnnouncerGender } from '../services/geminiService';
import { processGeminiAudio, playBuffer, exportAudioAsWav } from '../services/audioUtils';
import { validateInput, checkRateLimit, MAX_CHARS } from '../services/securityUtils';
import { saveToHistory } from '../services/storageService';

interface UseGeminiAudioReturn {
  inputText: string;
  setInputText: (text: string) => void;
  generatedScript: string;
  progressStatus: 'idle' | 'analyzing' | 'rewriting' | 'synthesizing' | 'mastering' | 'ready';
  isPlaying: boolean;
  error: string | null;
  cooldown: number;
  handleGenerate: (style: AnnouncerStyle, gender: AnnouncerGender, userName: string) => Promise<void>;
  handlePlay: (volume: number, speed: number) => void;
  handleDownload: () => void;
  lastGeneratedId: string;
}

export const useGeminiAudio = (): UseGeminiAudioReturn => {
  const [inputText, setInputText] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [progressStatus, setProgressStatus] = useState<'idle' | 'analyzing' | 'rewriting' | 'synthesizing' | 'mastering' | 'ready'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [lastGeneratedId, setLastGeneratedId] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Init Audio Context
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleGenerate = async (style: AnnouncerStyle, gender: AnnouncerGender, userName: string) => {
    // 1. Validate
    const validation = validateInput(inputText);
    if (!validation.isValid) {
      setError(validation.error || "Error de validación");
      return;
    }
    if (!checkRateLimit()) {
      setError(`Por seguridad, espera unos segundos antes de generar otro audio.`);
      return;
    }
    if (!process.env.API_KEY) {
        setError("Error de configuración: API Key faltante.");
        return;
    }

    // 2. Start Process
    setError(null);
    setGeneratedScript('');
    audioBufferRef.current = null;
    
    try {
      // Step 1: Semantic Analysis (Simulation delay for UX)
      setProgressStatus('analyzing');
      await new Promise(r => setTimeout(r, 1200));

      // Step 2: Rewrite
      setProgressStatus('rewriting');
      const script = await rewriteTextForEvent(inputText, style);
      setGeneratedScript(script);

      // Step 3: Synthesis
      setProgressStatus('synthesizing');
      const base64Audio = await generateAnnouncerAudio(script, style, gender);
      
      if (!base64Audio || !audioContextRef.current) {
        throw new Error("Fallo en la síntesis de audio.");
      }

      // Step 4: Mastering (Decoding)
      setProgressStatus('mastering');
      const buffer = await processGeminiAudio(base64Audio, audioContextRef.current);
      audioBufferRef.current = buffer;
      
      // Step 5: Ready
      setProgressStatus('ready');
      
      // Save to History
      const item = saveToHistory(inputText, script, style, gender, userName);
      setLastGeneratedId(item.id);

      // Cooldown timer
      setCooldown(5);
      const timer = setInterval(() => {
          setCooldown(prev => {
              if (prev <= 1) {
                  clearInterval(timer);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);

      // Auto-play initial
      handlePlay(1.0, 1.0);

    } catch (err) {
      console.error(err);
      setError("Error en el procesamiento. Intente nuevamente.");
      setProgressStatus('idle');
    }
  };

  const handlePlay = (volume: number, speed: number) => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) { /* ignore */ }
    }

    setIsPlaying(true);
    activeSourceRef.current = playBuffer(
      audioBufferRef.current,
      audioContextRef.current,
      volume,
      speed,
      () => setIsPlaying(false)
    );
  };

  const handleDownload = () => {
    if (!audioBufferRef.current) return;
    // Create a filename based on date or script content
    const filename = `voz_gala_${Date.now()}`;
    exportAudioAsWav(audioBufferRef.current, filename);
  };

  return {
    inputText,
    setInputText,
    generatedScript,
    progressStatus,
    isPlaying,
    error,
    cooldown,
    handleGenerate,
    handlePlay,
    handleDownload,
    lastGeneratedId
  };
};
