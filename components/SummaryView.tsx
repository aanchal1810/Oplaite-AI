import React from 'react';

interface SummaryViewProps {
  lastScore: number;
  isLight: boolean;
  onGoToHub: () => void;
  onNextCycle: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ lastScore, isLight, onGoToHub, onNextCycle }) => {
  return (
    <div className="w-full min-h-full py-10 md:py-20 animate-in zoom-in flex items-start md:items-center justify-center overflow-y-auto no-scrollbar">
      <div className={`w-full max-w-2xl p-8 md:p-14 neo-brutal rounded-[3rem] md:rounded-[4rem] text-center bg-[var(--app-bg)]`}>
          <h2 className="text-5xl md:text-[9rem] font-black uppercase italic tracking-tighter mb-8 break-words leading-none" 
              style={{ overflowWrap: 'anywhere', color: 'var(--app-text)' }}>
            {lastScore >= 50 ? 'COMPLETED' : 'POOR SYNC'}
          </h2>
          
          <div className="mb-10 p-6 md:p-10 rounded-2xl md:rounded-3xl border-4 border-[var(--brutal-border)] font-black text-base md:text-2xl leading-relaxed text-black" 
               style={{ backgroundColor: lastScore < 50 ? '#FFB3BA' : '#B2F2BB' }}>
              {lastScore < 50 
                  ? "Neural integration failed. Re-mastery cycle mandatory." 
                  : "Pathways fortified. Knowledge integrated into core memory."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-10">
              <div className="neo-brutal-sm p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center bg-[var(--app-bg)]">
                  <p className="text-[10px] md:text-xs font-black uppercase mb-1 md:mb-2 opacity-50 tracking-widest" style={{ color: 'var(--app-text)' }}>Precision</p>
                  <p className="text-5xl md:text-7xl font-black break-words" 
                     style={{ color: lastScore < 50 ? '#FF7A8B' : '#6DD88E' }}>
                    {Math.round(lastScore)}%
                  </p>
              </div>
              <div className={`neo-brutal-sm p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center bg-[var(--app-bg)]`}>
                  <p className="text-[10px] md:text-xs font-black uppercase mb-1 md:mb-2 opacity-50 tracking-widest" style={{ color: 'var(--app-text)' }}>Yield</p>
                  <p className="text-5xl md:text-7xl font-black text-yellow-500">+{Math.round(lastScore * 5)}</p>
              </div>
          </div>

          <div className="flex flex-col gap-5">
              <button onClick={onGoToHub} className={`w-full py-5 md:py-6 font-black text-xl md:text-2xl uppercase btn-main rounded-[2rem]`}>HUB ROADMAP</button>
              <button onClick={onNextCycle} className={`w-full py-6 md:py-8 font-black text-2xl md:text-3xl uppercase btn-main rounded-[2.5rem]`}>NEXT CYCLE →</button>
          </div>
      </div>
    </div>
  );
};