
import React from 'react';

interface TimerViewProps {
  topic: string;
  description: string;
  timer: number;
  totalDuration: number;
  isActive: boolean;
  onToggleActive: () => void;
  onTakeTest: () => void;
  isLight: boolean;
  formatTime: (seconds: number) => string;
}

export const TimerView: React.FC<TimerViewProps> = ({ 
  topic, description, timer, totalDuration, isActive, onToggleActive, onTakeTest, isLight, formatTime 
}) => {
  return (
    <div className="max-w-xl mx-auto text-center py-6 md:py-10 animate-in zoom-in h-full overflow-y-auto no-scrollbar">
      <div className={`inline-block px-8 py-2 text-xs font-black uppercase mb-8 neo-brutal rounded-xl ${isLight ? 'bg-black text-white' : 'bg-white text-black'}`}>NEURAL CYCLE: {topic}</div>
      <div className="relative w-[260px] h-[260px] md:w-[400px] md:h-[400px] mx-auto mb-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" className="fill-none stroke-slate-200 dark:stroke-white/10" strokeWidth="12" />
              <circle cx="100" cy="100" r="90" className={`fill-none transition-all duration-1000 ease-linear ${isLight ? 'stroke-black' : 'stroke-white'}`} strokeWidth="12" strokeDasharray="565.48" strokeDashoffset={565.48 * (1 - timer / (totalDuration * 60))} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
              <span className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter leading-none">{formatTime(timer)}</span>
          </div>
      </div>
      <div className={`p-8 neo-brutal rounded-[2.5rem] mb-10 bg-[var(--app-bg)] ${isLight ? 'status-neutral' : ''}`}>
          <p className="text-xl md:text-2xl font-black italic leading-tight">"{description}"</p>
      </div>
      <div className="flex justify-center gap-6 md:gap-8 pb-10">
        <button onClick={onToggleActive} className="w-20 h-20 md:w-28 md:h-28 btn-main flex items-center justify-center text-4xl rounded-[1.5rem] md:rounded-[2rem]"> {isActive ? '⏸' : '▶️'} </button>
        <button onClick={onTakeTest} className="btn-main btn-cta px-10 md:px-14 py-6 md:py-8 text-2xl md:text-3xl font-black uppercase rounded-[1.5rem] md:rounded-[2.5rem]">RECALL TEST</button>
      </div>
    </div>
  );
};
