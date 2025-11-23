import React from 'react';

interface SpotlightBackgroundProps {
  themeColor: string;
}

const SpotlightBackground: React.FC<SpotlightBackgroundProps> = ({ themeColor }) => {
  // Map theme names to Tailwind color classes for gradients
  const getGradientColors = () => {
    switch (themeColor) {
      case 'blue': return 'from-sky-400/20 via-sky-500/5';
      case 'red': return 'from-rose-400/20 via-rose-500/5';
      case 'purple': return 'from-violet-400/20 via-violet-500/5';
      case 'emerald': return 'from-emerald-400/20 via-emerald-500/5';
      case 'gold':
      default: return 'from-amber-400/20 via-amber-500/5';
    }
  };
  
  const getBottomHaze = () => {
    switch (themeColor) {
      case 'blue': return 'from-sky-900/20';
      case 'red': return 'from-rose-900/20';
      case 'purple': return 'from-violet-900/20';
      case 'emerald': return 'from-emerald-900/20';
      case 'gold':
      default: return 'from-yellow-900/20';
    }
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-1000">
      {/* Left Spotlight */}
      <div className="absolute top-[-20%] left-[10%] w-[200px] h-[150vh] bg-gradient-to-b from-white/20 via-white/5 to-transparent transform -rotate-[25deg] blur-3xl animate-spotlight origin-top" />
      
      {/* Right Spotlight (Colored) */}
      <div className={`absolute top-[-20%] right-[10%] w-[200px] h-[150vh] bg-gradient-to-b ${getGradientColors()} to-transparent transform rotate-[25deg] blur-3xl animate-spotlight origin-top`} style={{ animationDelay: '-5s' }} />
      
      {/* Bottom Haze */}
      <div className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t ${getBottomHaze()} to-transparent blur-2xl transition-colors duration-1000`} />
      
      {/* Particles/Dust (Simulated with simple dots) */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
    </div>
  );
};

export default SpotlightBackground;