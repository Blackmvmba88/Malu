
import { useState, useRef, useEffect } from 'react';
import { rewriteTextForEvent, generateAnnouncerAudio, AnnouncerStyle, AnnouncerGender } from '../services/geminiService';
import { processGeminiAudio, playBuffer, exportAudioAsWav, concatenateAudioBuffers } from '../services/audioUtils';
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

// Helper to split text into safe batches
const splitTextIntoBatches = (text: string, maxBatchSize: number = 400): string[] => {
  // Regex: Split by periods, exclamation, questions or newlines, keeping the delimiter.
  const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
  const sentences = text.match(sentenceRegex) || [text];
  
  const batches: string[] = [];
  let currentBatch = "";
  
  for (const sentence of sentences) {
    if ((currentBatch.length + sentence.length) > maxBatchSize) {
      if (currentBatch.trim().length > 0) batches.push(currentBatch.trim());
      currentBatch = sentence;
    } else {
      currentBatch += sentence;
    }
  }
  if (currentBatch.trim().length > 0) batches.push(currentBatch.trim());
  
  // Fallback: If a single sentence is still huge, force split it
  return batches.flatMap(b => b.length > maxBatchSize ? (b.match(new RegExp(`.{1,${maxBatchSize}}`, 'g')) || []) : [b]);
};

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
      // Analyze
      setProgressStatus('analyzing');
      await new Promise(r => setTimeout(r, 500)); // Short UI delay

      // BATCH PROCESSING LOGIC
      const batches = splitTextIntoBatches(inputText, 400);
      const rewrittenSegments: string[] = [];
      const audioBuffers: AudioBuffer[] = [];

      // Step 2: Rewrite Loop
      setProgressStatus('rewriting');
      for (const batch of batches) {
         // Rewriting each batch independently
         const segmentScript = await rewriteTextForEvent(batch, style);
         rewrittenSegments.push(segmentScript);
      }
      
      const fullScript = rewrittenSegments.join(" ");
      setGeneratedScript(fullScript);

      // Step 3: Synthesis Loop
      setProgressStatus('synthesizing');
      
      if (!audioContextRef.current) throw new Error("Audio Context not initialized");

      for (const segment of rewrittenSegments) {
        const base64Audio = await generateAnnouncerAudio(segment, style, gender);
        if (base64Audio) {
            const buffer = await processGeminiAudio(base64Audio, audioContextRef.current);
            audioBuffers.push(buffer);
        }
      }

      if (audioBuffers.length === 0) {
        throw new Error("No se pudo generar audio.");
      }

      // Step 4: Mastering (Concatenation)
      setProgressStatus('mastering');
      const finalBuffer = concatenateAudioBuffers(audioBuffers, audioContextRef.current);
      audioBufferRef.current = finalBuffer;
      
      // Step 5: Ready
      setProgressStatus('ready');
      
      // Save to History
      const item = saveToHistory(inputText, fullScript, style, gender, userName);
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
