import React from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  colorClass: string; // Expecting a full tailwind class like 'bg-amber-500'
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, colorClass }) => {
  return (
    <div className="flex justify-center items-end gap-2 h-24 mt-8">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`w-4 rounded-t-md transition-all duration-100 ease-in-out ${colorClass} ${
            isPlaying ? 'animate-pulse' : 'h-2 opacity-30'
          }`}
          style={{
            height: isPlaying ? `${Math.random() * 80 + 20}%` : '10%',
            animationDuration: `${0.3 + i * 0.1}s`,
            animationDelay: `-${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;