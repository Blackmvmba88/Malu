
import React, { useState } from 'react';
import { AnnouncerStyle, AnnouncerGender } from './services/geminiService';
import { MAX_CHARS } from './services/securityUtils';
import { useGeminiAudio } from './hooks/useGeminiAudio'; // New optimized hook

import SpotlightBackground from './components/SpotlightBackground';
import AudioVisualizer from './components/AudioVisualizer';
import GenerationProgress from './components/GenerationProgress';
import HistoryFeed from './components/HistoryFeed';

import { Play, RefreshCw, Volume2, Sparkles, Briefcase, PartyPopper, Crown, Gauge, VolumeX, LogIn, Palette, User, UserCircle2, ShieldCheck, Lock, AlertCircle, Fingerprint, Lightbulb, LightbulbOff, Mic, Download, Github } from 'lucide-react';

// Types
type ThemeColor = 'gold' | 'blue' | 'red' | 'purple' | 'emerald';

const App: React.FC = () => {
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginStep, setLoginStep] = useState<'idle' | 'verifying' | 'secure_handshake' | 'success'>('idle');
  const [loginProvider, setLoginProvider] = useState<'biometric' | 'github' | null>(null);
  const [user, setUser] = useState<{name: string, photo: string, role: string} | null>(null);

  // App Settings
  const [style, setStyle] = useState<AnnouncerStyle>('epic');
  const [gender, setGender] = useState<AnnouncerGender>('male');
  const [theme, setTheme] = useState<ThemeColor>('gold');
  const [spotlightMode, setSpotlightMode] = useState<'static' | 'dynamic'>('static'); // Default static as requested
  
  // Audio Controls
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);

  // Logic Hook
  const {
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
  } = useGeminiAudio();

  // --- HANDLERS ---
  const onGenerateClick = () => {
    handleGenerate(style, gender, user?.name || "Usuario");
  };

  const onPlayClick = () => {
    handlePlay(volume, speed);
  };

  const handleLogin = (provider: 'biometric' | 'github') => {
    setLoginProvider(provider);
    setLoginStep('verifying');
    
    // Simulate Auth Flow
    setTimeout(() => {
      setLoginStep('secure_handshake');
      setTimeout(() => {
        setLoginStep('success');
        setTimeout(() => {
           // Different profile based on provider
           if (provider === 'github') {
             setUser({
                name: "Dev_Iyari",
                role: "FULL STACK",
                photo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
             });
             setTheme('blue'); // GitHub developers usually prefer cool tones
           } else {
             setUser({
                name: "Iyari Cancino",
                role: "ADMIN",
                photo: "https://lh3.googleusercontent.com/a/default-user=s96-c" 
             });
           }
          setIsLoggedIn(true);
        }, 800);
      }, 1500);
    }, 1500);
  };

  // Theme Helper
  const getThemeStyles = (selectedTheme: ThemeColor) => {
    const base = {
      gold: {
        primary: 'bg-amber-500', hover: 'hover:bg-amber-400', text: 'text-amber-400', 
        textHigh: 'text-amber-500', border: 'border-amber-500', shadow: 'rgba(245,158,11,0.6)', 
        visualizer: 'bg-amber-500', inputRing: 'focus:ring-amber-500'
      },
      blue: {
        primary: 'bg-sky-500', hover: 'hover:bg-sky-400', text: 'text-sky-400', 
        textHigh: 'text-sky-500', border: 'border-sky-500', shadow: 'rgba(56,189,248,0.6)', 
        visualizer: 'bg-sky-500', inputRing: 'focus:ring-sky-500'
      },
      red: {
        primary: 'bg-rose-500', hover: 'hover:bg-rose-400', text: 'text-rose-400', 
        textHigh: 'text-rose-500', border: 'border-rose-500', shadow: 'rgba(244,63,94,0.6)', 
        visualizer: 'bg-rose-500', inputRing: 'focus:ring-rose-500'
      },
      purple: {
        primary: 'bg-violet-500', hover: 'hover:bg-violet-400', text: 'text-violet-400', 
        textHigh: 'text-violet-500', border: 'border-violet-500', shadow: 'rgba(139,92,246,0.6)', 
        visualizer: 'bg-violet-500', inputRing: 'focus:ring-violet-500'
      },
      emerald: {
        primary: 'bg-emerald-500', hover: 'hover:bg-emerald-400', text: 'text-emerald-400', 
        textHigh: 'text-emerald-500', border: 'border-emerald-500', shadow: 'rgba(16,185,129,0.6)', 
        visualizer: 'bg-emerald-500', inputRing: 'focus:ring-emerald-500'
      }
    };
    return base[selectedTheme];
  };

  const t = getThemeStyles(theme);

  // --- RENDER LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black font-sans">
        <SpotlightBackground themeColor="gold" mode="static" /> {/* Force static for login */}
        
        <div className="relative z-10 p-8 w-full max-w-md">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Security Scan Line */}
            {loginStep !== 'idle' && (
               <div className={`absolute top-0 left-0 w-full h-1 ${loginProvider === 'github' ? 'bg-purple-500 shadow-[0_0_15px_#a855f7]' : 'bg-amber-500 shadow-[0_0_15px_#f59e0b]'} animate-[scan_2s_linear_infinite]`} />
            )}

            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] transition-all duration-500 ${
                loginStep === 'idle' ? 'bg-gradient-to-br from-gray-800 to-black border border-gray-700' :
                loginStep === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
                loginProvider === 'github' ? 'bg-gray-800 text-white border-gray-600' :
                'bg-amber-500/20 border border-amber-500 text-amber-500'
            }`}>
              {loginStep === 'idle' && <Lock className="w-10 h-10 text-gray-400" />}
              {loginStep === 'verifying' && <RefreshCw className="w-12 h-12 animate-spin" />}
              {loginStep === 'secure_handshake' && (loginProvider === 'github' ? <Github className="w-10 h-10 animate-pulse" /> : <Fingerprint className="w-12 h-12 animate-pulse" />)}
              {loginStep === 'success' && <ShieldCheck className="w-12 h-12" />}
            </div>
            
            <h1 className="text-3xl font-display font-black text-white mb-2">Voz de Gala AI</h1>
            <p className="text-gray-400 mb-8 font-mono text-sm">
                {loginStep === 'idle' ? "SELECCIONE MÉTODO DE ACCESO" : 
                 loginStep === 'verifying' ? "CONECTANDO..." :
                 loginStep === 'secure_handshake' ? "AUTORIZANDO..." : "ACCESO CONCEDIDO"}
            </p>
            
            <div className="w-full space-y-3">
                <button 
                  onClick={() => handleLogin('biometric')}
                  disabled={loginStep !== 'idle'}
                  className={`w-full font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 ${loginStep === 'idle' ? 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]' : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'}`}
                >
                   <Fingerprint className="w-5 h-5" />
                   {loginStep === 'idle' ? 'Acceso Biométrico' : 'Procesando...'}
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-600 text-xs uppercase">o programador</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                </div>

                <button 
                  onClick={() => handleLogin('github')}
                  disabled={loginStep !== 'idle'}
                  className={`w-full font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 border border-gray-700 ${loginStep === 'idle' ? 'bg-[#24292e] text-white hover:bg-[#2f363d] hover:border-gray-500 hover:scale-[1.02]' : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'}`}
                >
                   <Github className="w-5 h-5" />
                   {loginStep === 'idle' ? 'Iniciar con GitHub' : 'GitHub Auth...'}
                </button>
            </div>
            
            <div className="mt-8 flex flex-col gap-1 items-center">
               <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                 <ShieldCheck className="w-3 h-3" />
                 <span>Secure OAuth 2.0 Protocol</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN APP ---
  const isGenerating = progressStatus !== 'idle' && progressStatus !== 'ready';

  return (
    <div className="min-h-screen w-full relative flex flex-col font-sans transition-colors duration-700 overflow-x-hidden bg-black">
      <SpotlightBackground themeColor={theme} mode={spotlightMode} />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <ShieldCheck className={`w-5 h-5 ${t.text}`} />
          <span className="font-display font-bold text-white tracking-wider hidden sm:block text-xs sm:text-sm">
             SECURE ENVIRONMENT <span className="text-gray-500">|</span> v2.1.0
          </span>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Spotlight Toggle */}
            <button 
                onClick={() => setSpotlightMode(m => m === 'static' ? 'dynamic' : 'static')}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                title="Alternar movimiento de luces"
            >
                {spotlightMode === 'static' ? <LightbulbOff className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
            </button>

            {/* Theme Selector */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                <Palette className="w-4 h-4 text-gray-400 ml-2 mr-1" />
                {(['gold', 'blue', 'red', 'purple', 'emerald'] as ThemeColor[]).map((c) => (
                <button
                    key={c}
                    onClick={() => setTheme(c)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        c === 'gold' ? 'bg-amber-500' : c === 'blue' ? 'bg-sky-500' : c === 'red' ? 'bg-rose-500' : c === 'purple' ? 'bg-violet-500' : 'bg-emerald-500'
                    } ${theme === c ? 'scale-125 ring-2 ring-white' : 'opacity-40 hover:opacity-100'}`}
                />
                ))}
            </div>

            {/* User */}
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10">
                <div className="flex flex-col items-end mr-1">
                    <span className="text-xs font-medium text-gray-200 hidden sm:block">{user?.name}</span>
                    <div className="flex items-center gap-1">
                        <span className={`text-[8px] px-1 rounded ${t.primary} text-black font-bold`}>{user?.role}</span>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/20 overflow-hidden flex items-center justify-center text-xs font-bold text-white">
                     {user?.photo && user.photo.includes('http') ? (
                         <img src={user.photo} alt="user" className="w-full h-full object-cover" />
                     ) : (
                         user?.name.substring(0,2).toUpperCase()
                     )}
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center p-4 sm:p-8 relative z-10 mt-16 w-full max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
                <span className={`w-2 h-2 rounded-full ${t.primary} animate-pulse`}></span>
                <span className={`text-[10px] uppercase tracking-widest font-bold ${t.text}`}>Consola V2.1</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 text-shadow-glow uppercase leading-tight">
                {style === 'epic' ? 'Gran Evento' : style === 'professional' ? 'Modo Pro' : 'Modo Real'}
            </h1>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 w-full max-w-3xl">
            {/* Style Switch */}
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex flex-1 min-w-[280px] sm:min-w-[320px]">
                <button onClick={() => setStyle('epic')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${style === 'epic' ? `${t.primary} text-black shadow-lg` : 'text-gray-400 hover:text-white'}`}>
                    <PartyPopper className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Épico</span><span className="sm:hidden">Épic</span>
                </button>
                <button onClick={() => setStyle('professional')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${style === 'professional' ? `${t.primary} text-white shadow-lg` : 'text-gray-400 hover:text-white'}`}>
                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" /> Pro
                </button>
                <button onClick={() => setStyle('real')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider transition-all ${style === 'real' ? `${t.primary} text-white shadow-lg` : 'text-gray-400 hover:text-white'}`}>
                    <Mic className="w-3 h-3 sm:w-4 sm:h-4" /> Real
                </button>
            </div>
            {/* Gender Switch */}
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex flex-0 min-w-[180px]">
                <button onClick={() => setGender('male')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${gender === 'male' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <User className="w-4 h-4" /> <span className="hidden sm:inline">Hombre</span><span className="sm:hidden">H</span>
                </button>
                <button onClick={() => setGender('female')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${gender === 'female' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    <UserCircle2 className="w-4 h-4" /> <span className="hidden sm:inline">Mujer</span><span className="sm:hidden">M</span>
                </button>
            </div>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-3xl bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wide flex items-center gap-2">
                    <Lock className="w-3 h-3 text-gray-500" /> Entrada de Texto
                </label>
                <span className={`text-xs font-mono ${inputText.length > MAX_CHARS ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                    {inputText.length} / {MAX_CHARS} chars
                </span>
            </div>
            
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={style === 'epic' ? "Escribe aquí: 'El campeón entra al ring...'" : "Escribe aquí: 'Bienvenidos a la conferencia anual...'"}
                className={`w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${t.inputRing} transition-all resize-none h-32`}
                maxLength={MAX_CHARS + 10} 
            />

            <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Sanitized</span>
                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> AI Powered</span>
                </div>
                
                <button
                    onClick={onGenerateClick}
                    disabled={isGenerating || cooldown > 0 || inputText.length === 0}
                    className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 flex items-center gap-2 ${
                        isGenerating || cooldown > 0 || inputText.length === 0
                        ? 'bg-gray-800 cursor-not-allowed opacity-50' 
                        : `${t.primary} ${t.hover} hover:scale-105 active:scale-95`
                    }`}
                >
                    {isGenerating ? (
                        <><RefreshCw className="w-5 h-5 animate-spin" /> PROCESANDO</>
                    ) : cooldown > 0 ? (
                        <><Gauge className="w-5 h-5" /> ESPERA {cooldown}s</>
                    ) : (
                        <><Sparkles className="w-5 h-5" /> GENERAR AUDIO</>
                    )}
                </button>
            </div>
        </div>

        {/* Progress HUD */}
        <GenerationProgress status={progressStatus} themeColor={theme} />
        
        {/* Error Message */}
        {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 animate-pulse">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
            </div>
        )}

        {/* Result Area */}
        {generatedScript && !isGenerating && (
            <div className="w-full max-w-3xl mt-8 animate-fade-in-up">
                <div className={`p-1 rounded-2xl bg-gradient-to-r ${t.primary} to-transparent`}>
                    <div className="bg-gray-900 rounded-xl p-6 border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className={`text-lg font-bold ${t.textHigh} mb-1 flex items-center gap-2`}>
                                    <Mic className="w-4 h-4" /> Guion Generado
                                </h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Listo para locución</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleDownload} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors" title="Descargar WAV">
                                    <Download className="w-5 h-5" />
                                </button>
                                <button onClick={onPlayClick} className={`p-2 ${t.primary} rounded-lg text-white shadow-lg hover:opacity-90 transition-colors`}>
                                    {isPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-xl sm:text-2xl font-display font-medium text-white leading-relaxed mb-6 p-4 bg-black/30 rounded-lg border border-white/5 shadow-inner">
                            "{generatedScript}"
                        </p>
                        
                        {/* Audio Mix Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                                    <span>Volumen</span>
                                    <span>{Math.round(volume * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="2" step="0.1" 
                                    value={volume} 
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-${theme === 'gold' ? 'amber' : theme === 'blue' ? 'sky' : theme === 'red' ? 'rose' : theme === 'purple' ? 'violet' : 'emerald'}-500`}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-400 uppercase font-bold">
                                    <span>Velocidad</span>
                                    <span>{speed}x</span>
                                </div>
                                <input 
                                    type="range" min="0.5" max="2" step="0.1" 
                                    value={speed} 
                                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-${theme === 'gold' ? 'amber' : theme === 'blue' ? 'sky' : theme === 'red' ? 'rose' : theme === 'purple' ? 'violet' : 'emerald'}-500`}
                                />
                            </div>
                        </div>

                        <AudioVisualizer isPlaying={isPlaying} colorClass={t.visualizer} />
                    </div>
                </div>
            </div>
        )}

        {/* History Feed */}
        <HistoryFeed 
            themeColor={theme} 
            onLoadItem={setInputText} 
            lastGeneratedId={lastGeneratedId}
        />

      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-black/80 backdrop-blur-md border-t border-white/5 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <Crown className={`w-5 h-5 ${t.text}`} />
                    <span className="font-display font-bold text-white text-lg">Voz de Gala AI</span>
                </div>
                <p className="text-xs text-gray-500">Powered by Google Gemini 2.5 & Web Audio API</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Desarrollado con precisión por</p>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                    <span className={`h-px w-8 ${t.primary}`}></span>
                    <span className="font-display font-bold text-white text-sm tracking-widest uppercase">Iyari Cancino Gomez</span>
                    <span className={`h-px w-8 ${t.primary}`}></span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
