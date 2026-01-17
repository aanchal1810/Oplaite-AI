import React from 'react';
import { Subject } from '../types';

interface SubjectViewProps {
  activeSubject: Subject;
  onBack: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectUnit: (id: string) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({ activeSubject, onBack, onFileUpload, onSelectUnit }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <button onClick={onBack} className="font-black text-sm uppercase opacity-50 mb-2 hover:opacity-100">← Back to Neural Hub</button>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-tight">{activeSubject.name}</h2>
        </div>
        <div className="w-full md:w-auto relative group">
          <button className="w-full md:w-auto btn-turquoise px-10 py-5 text-xl font-black uppercase rounded-[1.5rem] relative overflow-hidden">
            <input type="file" onChange={onFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            + INTEGRATE DATA
          </button>
        </div>
      </div>

      <div className="grid gap-6 pb-10">
        {activeSubject.units.map(unit => (
          <div 
            key={unit.id} 
            onClick={() => onSelectUnit(unit.id)} 
            className="p-8 neo-brutal rounded-[2rem] cursor-pointer hover:-translate-x-2 transition-all flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--app-bg)]"
          >
            <div className="flex-1 w-full">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">{unit.name}</h3>
              <div className="mt-4 h-8 w-full bg-slate-100 dark:bg-white/10 rounded-full border-4 border-[var(--brutal-border)] overflow-hidden relative">
                 <div className="h-full bg-green-400 transition-all duration-500" style={{width: `${unit.progress}%`}}></div>
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase text-black">{unit.progress}% COMPLETED</div>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="neo-brutal-sm px-6 py-3 rounded-xl text-center min-w-[120px] bg-[var(--app-bg)]">
                    <p className="text-[10px] font-black uppercase opacity-50">Stored Score</p>
                    <p className="text-2xl font-black">{unit.score}</p>
                </div>
                <div className="neo-brutal-sm px-8 py-3 rounded-xl text-center min-w-[120px] bg-[var(--app-bg)]">
                    <p className="text-[10px] font-black uppercase opacity-50">Neural Plan</p>
                    <p className="text-2xl font-black">→</p>
                </div>
            </div>
          </div>
        ))}
        {activeSubject.units.length === 0 && (
          <div className="py-20 text-center opacity-40 italic font-black text-2xl uppercase tracking-tighter">Awaiting module integration. Please upload material.</div>
        )}
      </div>
    </div>
  );
};