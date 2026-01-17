import React from 'react';
import { Unit } from '../types';

interface PlanningViewProps {
  activeUnit: Unit;
  activeSubjectName: string;
  onBack: () => void;
  onStartSegment: (index: number) => void;
  isLight: boolean;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ activeUnit, activeSubjectName, onBack, onStartSegment, isLight }) => {
  return (
    <div className="animate-in slide-in-from-right-8 duration-500 pb-24 px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col items-start w-full">
            <button 
              onClick={onBack} 
              className="font-black text-xl uppercase opacity-60 mb-6 hover:opacity-100 transition-opacity flex items-center gap-2 group"
              style={{ color: 'var(--app-text)' }}
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> BACK
            </button>
            <div className="space-y-2 w-full">
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--app-text)' }}>INTELLIGENCE REPORT</p>
              <h2 className="text-3xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9]" style={{ color: 'var(--app-text)', overflowWrap: 'anywhere' }}>
                Roadmap:<br/>
                <span className="block mt-2" style={{ color: 'var(--app-text)' }}>{activeUnit.name}</span>
              </h2>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
              <div className="neo-brutal-sm p-4 md:p-6 flex-1 md:min-w-[180px] text-center rounded-[1.5rem] md:rounded-[2rem] bg-[var(--app-bg)] flex flex-col justify-center">
                  <p className="text-[10px] md:text-xs font-black uppercase mb-1 opacity-50 tracking-widest" style={{ color: 'var(--app-text)' }}>Total Study Time</p>
                  <p className="text-4xl md:text-6xl font-black tabular-nums" style={{ color: 'var(--app-text)' }}>{activeUnit.plan.segments.reduce((acc, s) => acc + s.estimatedDuration, 0)}m</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeUnit.plan.segments.map((segment, idx) => (
          <div key={segment.id} className={`group p-6 md:p-10 neo-brutal rounded-[2.5rem] md:rounded-[3rem] flex flex-col hover:-translate-y-2 transition-all bg-[var(--app-bg)] relative overflow-hidden`}>
            <div className="flex justify-between items-center mb-6 md:mb-8">
               <div className="flex flex-col">
                  <p className="text-[10px] md:text-xs font-black uppercase opacity-40 mb-1" style={{ color: 'var(--app-text)' }}>Priority Rank</p>
                  <span className={`text-xl md:text-3xl font-black uppercase italic leading-none ${segment.importance > 7 ? 'text-red-500' : 'text-blue-500'}`}>
                    {segment.importance}<span className="text-sm opacity-50">/10</span>
                  </span>
               </div>
               
               {segment.status === 'completed' && (
                 <div className="bg-green-400 text-black px-4 md:px-5 py-1.5 md:py-2 text-[10px] font-black rounded-full border-4 border-[var(--brutal-border)] uppercase tracking-widest">Completed</div>
               )}
            </div>

            <div className="mb-6 md:mb-8">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-3 md:mb-4 italic leading-tight group-hover:text-pink-500 transition-colors" style={{ color: 'var(--app-text)' }}>
                {segment.topic}
              </h3>
              
              {segment.status === 'redo' && (
                <div className="bg-red-400 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase mb-4 inline-flex items-center gap-2 border-4 border-black animate-pulse">
                  ⚠️ POOR PERFORMANCE
                </div>
              )}
              
              <p className="font-bold text-sm md:text-sm opacity-70 leading-relaxed line-clamp-4" style={{ color: 'var(--app-text)' }}>
                {segment.description}
              </p>
            </div>

            <div className="mt-auto pt-6 md:pt-8 border-t-4 border-[var(--brutal-border)] flex flex-col gap-4 md:gap-6">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                   <p className="text-[10px] font-black uppercase opacity-40" style={{ color: 'var(--app-text)' }}>Cycle Duration</p>
                   <span className="text-lg md:text-xl font-black uppercase italic tracking-widest" style={{ color: 'var(--app-text)' }}>{segment.estimatedDuration} MINUTES</span>
                 </div>
              </div>

              {segment.status !== 'completed' && (
                <button 
                  onClick={() => onStartSegment(idx)} 
                  className={`w-full py-4 md:py-5 text-lg md:text-xl font-black rounded-xl md:rounded-2xl neo-brutal-sm uppercase transition-all active:scale-95 ${
                    segment.status === 'redo' 
                      ? 'bg-red-500 text-white' 
                      : 'btn-main'
                  }`}
                >
                  {segment.status === 'redo' ? 'RE-INITIATE' : 'ENGAGE PROTOCOL'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};