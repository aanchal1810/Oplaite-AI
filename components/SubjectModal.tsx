
import React, { useState } from 'react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  isLight: boolean;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({ isOpen, onClose, onCreate, isLight }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md p-8 neo-brutal rounded-[2.5rem] bg-[var(--app-bg)] animate-in zoom-in duration-300`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">Initialize Module</h3>
          <button onClick={onClose} className="text-2xl font-black hover:scale-125 transition-transform">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase opacity-50 mb-2 tracking-widest">Subject Identifier</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ADVANCED NEURAL BIOLOGY"
              className="w-full p-5 neo-brutal-sm rounded-2xl bg-transparent font-black uppercase tracking-tight focus:outline-none focus:ring-4 focus:ring-purple-400 transition-all"
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              type="submit" 
              className="w-full py-5 btn-main text-xl font-black uppercase rounded-2xl"
            >
              Construct Subject
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full py-3 font-black uppercase text-xs opacity-50 hover:opacity-100 transition-opacity"
            >
              Abort Protocol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
