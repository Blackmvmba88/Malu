import React, { useEffect, useState } from 'react';
import { BrainCircuit, PenTool, Mic2, Speaker, CheckCircle2, Radio, Activity } from 'lucide-react';

interface GenerationProgressProps {
  status: 'idle' | 'analyzing' | 'rewriting' | 'synthesizing' | 'mastering' | 'ready';
  themeColor: string;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ status, themeColor }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Map status to step index
  useEffect(() => {
    switch (status) {
      case 'analyzing': setActiveStep(1); break;
      case 'rewriting': setActiveStep(2); break;
      case 'synthesizing': setActiveStep(3); break;
      case 'mastering': setActiveStep(4); break;
      case 'ready': setActiveStep(5); break;
      default: setActiveStep(0);
    }
  }, [status]);

  const steps = [
    { id: 1, label: "Análisis Semántico", icon: BrainCircuit, desc: "Desencriptando intención..." },
    { id: 2, label: "Motor Creativo", icon: PenTool, desc: "Reescribiendo guion..." },
    { id: 3, label: "Síntesis Neural", icon: Mic2, desc: "Generando voz AI..." },
    { id: 4, label: "Masterización", icon: Activity, desc: "Ajustando frecuencias..." },
  ];

  const getThemeColor = () => {
    switch(themeColor) {
        case 'blue': return 'text-sky-400 border-sky-500 bg-sky-500';
        case 'red': return 'text-rose-400 border-rose-500 bg-rose-500';
        case 'purple': return 'text-violet-400 border-violet-500 bg-violet-500';
        case 'emerald': return 'text-emerald-400 border-emerald-500 bg-emerald-500';
        default: return 'text-amber-400 border-amber-500 bg-amber-500';
    }
  };
  
  const themeClass = getThemeColor();
  const activeColor = themeClass.split(' ')[0]; // text-color
  const borderColor = themeClass.split(' ')[1]; // border-color
  const bgColor = themeClass.split(' ')[2]; // bg-color

  if (status === 'idle' || status === 'ready') return null;

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl relative overflow-hidden">
      {/* Scanline Effect */}
      <div className={`absolute top-0 left-0 w-full h-1 ${bgColor} shadow-[0_0_20px_currentColor] animate-[scan_2s_linear_infinite] opacity-50`} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${activeColor} animate-pulse`} />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Procesando Solicitud</span>
        </div>
        <span className="text-xs font-mono text-gray-500">{Math.round((activeStep / 4) * 100)}%</span>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;
          const Icon = step.icon;

          return (
            <div 
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                    isActive ? 'bg-white/5 border-l-2 ' + borderColor : 'opacity-40'
                }`}
            >
              <div className={`p-2 rounded-full ${isActive || isCompleted ? 'bg-white/10' : 'bg-transparent'}`}>
                {isCompleted ? (
                    <CheckCircle2 className={`w-5 h-5 ${activeColor}`} />
                ) : (
                    <Icon className={`w-5 h-5 ${isActive ? `${activeColor} animate-pulse` : 'text-gray-500'}`} />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center">
                    <h4 className={`text-sm font-bold ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                        {step.label}
                    </h4>
                    {isActive && (
                        <span className={`text-[10px] uppercase tracking-wider ${activeColor} animate-pulse`}>
                            En Progreso...
                        </span>
                    )}
                </div>
                {isActive && (
                    <p className="text-xs text-gray-400 mt-1">{step.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenerationProgress;
