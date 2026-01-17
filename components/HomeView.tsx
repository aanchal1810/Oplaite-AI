import React from 'react';
import { Unit } from '../types';

interface HomeViewProps {
  units: Unit[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectUnit: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ units, onFileUpload, onSelectUnit }) => {
  return (
    <div className="animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-tight" style={{ color: 'var(--app-text)' }}>
            Knowledge <span className="italic" style={{ color: '#AFEEEE' }}>Vault.</span>
          </h2>
          <p className="text-xs font-black uppercase opacity-60 tracking-widest" style={{ color: 'var(--app-text)' }}>Active Notes: {units.length}</p>
        </div>
        <div className="w-full md:w-auto relative">
          <button 
            type="button"
            className="w-full md:w-auto btn-main px-12 py-6 text-2xl font-black uppercase rounded-[2rem] hover:scale-105 transition-all cursor-pointer relative z-20 group flex items-center justify-center"
          >
            <input 
              type="file" 
              onChange={onFileUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer z-30" 
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
            />
            <span className="group-hover:rotate-90 inline-block transition-transform duration-300 mr-2">+</span> 
            Add Notes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {units.map(unit => (
          <div 
            key={unit.id} 
            className="p-8 neo-brutal rounded-[2.5rem] flex flex-col justify-start group bg-[var(--app-bg)] relative z-10 overflow-hidden" 
          >
            <div className="relative z-10 w-full mb-2">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none break-words overflow-hidden" 
                  style={{ overflowWrap: 'anywhere', color: 'var(--app-text)' }}>
                {unit.name}
              </h3>
              <div className="mt-4 h-6 w-full bg-slate-100 dark:bg-white/10 rounded-full border-4 border-[var(--brutal-border)] overflow-hidden relative">
                 <div className="h-full bg-green-400 transition-all duration-500" style={{width: `${unit.progress}%`}}></div>
                 <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase" 
                      style={{ color: 'var(--app-text)' }}>
                   {unit.progress}% COMPLETED
                 </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-4">
              <button 
                onClick={() => onSelectUnit(unit.id)}
                className="w-full py-4 btn-main text-lg font-black uppercase rounded-2xl flex items-center justify-center gap-2 group/btn"
              >
                Adaptive Plan 
                <span className="group-hover/btn:translate-x-2 transition-transform">→</span>
              </button>
            </div>
          </div>
        ))}
        
        {units.length === 0 && (
          <div className="col-span-full py-32 text-center neo-brutal rounded-[3rem] border-dashed bg-black/5 dark:bg-white/5">
             <p className="italic font-black text-3xl opacity-30 uppercase tracking-tighter" style={{ color: 'var(--app-text)' }}>Vault Empty: Integrate Learning Data</p>
          </div>
        )}
      </div>
    </div>
  );
};