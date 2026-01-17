import React from 'react';

const OpaliteLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 380 338" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.53101 111.959L14.531 3.95898L107.531 52.459L188.031 35.959L275.031 52.459L364.531 3.95898L377.031 111.959L347.031 246.959L320.531 297.959L188.031 334.459L55.031 297.959L33.031 246.959L2.53101 111.959Z" stroke="currentColor" strokeWidth="12"/>
    <path d="M13.531 4.95898L72.031 149.459M72.031 149.459L107.531 54.459M72.031 149.459L32.031 242.459M72.031 149.459L153.531 228.459M153.531 228.459H225.531M153.531 228.459L191.031 259.959M153.531 228.459L55.031 300.959M225.531 228.459L191.031 259.959M225.531 228.459L309.531 149.459M225.531 228.459L318.531 295.459M191.031 259.959V287.959M191.031 287.959L210.031 295.459L225.531 281.459M191.031 287.959L170.031 295.459L153.531 281.459M309.531 149.459L274.031 54.459M309.531 149.459L365.031 4.95898M309.531 149.459L349.031 242.459" stroke="currentColor" strokeWidth="12"/>
  </svg>
);

export const LoadingScreen = ({ isLight }: { isLight: boolean }) => (
  <div className="fixed inset-0 bg-[var(--app-bg)] flex flex-col items-center justify-center z-[100] transition-colors duration-500 overflow-hidden">
    {/* Fun Floating Elements */}
    <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-pink-300 rounded-full animate-float opacity-30"></div>
    <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-blue-300 rounded-full animate-float [animation-delay:-1s] opacity-30"></div>
    <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-yellow-300 rounded-full animate-float [animation-delay:-2s] opacity-30"></div>
    <div className="absolute bottom-1/3 left-1/3 w-14 h-14 bg-green-300 rounded-full animate-float [animation-delay:-3s] opacity-30"></div>
    
    <div className="relative mb-12">
        <OpaliteLogo className={`w-36 h-36 md:w-52 md:h-52 ${isLight ? 'text-black' : 'text-white'} animate-logo-sync`} />
        <div className={`absolute inset-0 blur-3xl -z-10 animate-pulse ${isLight ? 'bg-purple-200/50' : 'bg-white/10'}`}></div>
    </div>
    <div className="text-center px-4 relative z-10">
        <p className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">Opalite is Preparing</p>
        <div className="flex gap-4 justify-center">
            <div className={`w-6 h-6 border-4 ${isLight ? 'border-black' : 'border-white'} animate-bounce [animation-delay:-0.3s]`}></div>
            <div className={`w-6 h-6 border-4 ${isLight ? 'border-black' : 'border-white'} animate-bounce [animation-delay:-0.15s]`}></div>
            <div className={`w-6 h-6 border-4 ${isLight ? 'border-black' : 'border-white'} animate-bounce`}></div>
        </div>
        <p className="mt-8 text-xs font-black uppercase opacity-40 tracking-widest">Constructing Neural Roadmap...</p>
    </div>
  </div>
);