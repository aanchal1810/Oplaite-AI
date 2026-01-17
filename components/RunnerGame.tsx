import React, { useEffect, useRef, useState, useCallback } from 'react';
import { QuizQuestion } from '../types';

interface RunnerGameProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  theme: 'light' | 'dark';
  playerColor: string;
  onColorChange: (color: string) => void;
}

const RunnerGame: React.FC<RunnerGameProps> = ({ questions, onComplete, theme, playerColor, onColorChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'finished'>('instructions');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', text: string } | null>(null);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const stateRef = useRef({
    lane: 1,
    currentIdx: 0,
    score: 0,
    obstacleY: -3500, 
    speed: 2.1,      
    bgOffset: 0,
    isTransitioning: false,
    isReading: false,
    touchStartX: 0,
    touchStartY: 0
  });

  const darkerPastels = [
    '#F06292', '#E57373', '#FDD835', '#81C784', '#9575CD', '#64B5F6', '#FB8C00', '#CFD8DC', '#212121'
  ];

  useEffect(() => {
    if (gameState !== 'playing') return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    if (gameAreaRef.current) observer.observe(gameAreaRef.current);
    return () => observer.disconnect();
  }, [gameState]);

  const speakQuestion = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    
    utterance.onstart = () => {
      stateRef.current.isReading = true;
      stateRef.current.obstacleY = -3500;
      setCurrentCharIndex(0);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentCharIndex(event.charIndex);
      }
    };

    utterance.onend = () => {
      stateRef.current.isReading = false;
      setCurrentCharIndex(-1);
      setTimeout(() => { 
        stateRef.current.obstacleY = -800; 
      }, 1000);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (currentCharIndex !== -1 && scrollRef.current) {
      const activeWord = wordsRef.current.find(span => 
        span && span.dataset.start && parseInt(span.dataset.start) === currentCharIndex
      );
      if (activeWord) {
        const container = scrollRef.current;
        const targetScroll = activeWord.offsetTop - (container.clientHeight / 2) + (activeWord.clientHeight / 2);
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  }, [currentCharIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') stateRef.current.lane = Math.max(0, stateRef.current.lane - 1);
      if (e.key === 'ArrowRight') stateRef.current.lane = Math.min(2, stateRef.current.lane + 1);
    };

    const handleTouchStart = (e: TouchEvent) => {
      stateRef.current.touchStartX = e.touches[0].clientX;
      stateRef.current.touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - stateRef.current.touchStartX;
      const dy = e.changedTouches[0].clientY - stateRef.current.touchStartY;
      if (Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) stateRef.current.lane = Math.min(2, stateRef.current.lane + 1);
        else stateRef.current.lane = Math.max(0, stateRef.current.lane - 1);
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.speechSynthesis.cancel();
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && questions[currentIdx]) {
      speakQuestion(questions[currentIdx].question);
    }
  }, [gameState, currentIdx, questions, speakQuestion]);

  useEffect(() => {
    if (gameState !== 'playing' || dimensions.width === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    const draw = () => {
      const { lane, currentIdx: idx, obstacleY, speed, bgOffset, isReading: reading } = stateRef.current;
      const currentQ = questions[idx];
      if (!currentQ) {
        setGameState('finished');
        onComplete(stateRef.current.score);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const laneWidth = canvas.width / 3;
      const isDark = theme === 'dark';
      // Use hex code for canvas border to ensure dark mode gray is applied correctly
      const borderColor = isDark ? '#888888' : '#000000';
      const roadColor = isDark ? '#080808' : '#ffffff';
      
      ctx.fillStyle = roadColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      for (let i = 1; i <= 2; i++) {
        const x = i * laneWidth;
        ctx.beginPath(); ctx.setLineDash([15, 15]); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      ctx.setLineDash([]); 

      stateRef.current.bgOffset = (bgOffset + speed) % 150;
      ctx.strokeStyle = isDark ? '#222' : '#f0f0f0';
      ctx.lineWidth = 1;
      for (let i = -150; i < canvas.height; i += 150) {
        const y = i + stateRef.current.bgOffset;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      const playerX = lane * laneWidth + laneWidth / 2;
      const playerY = canvas.height * 0.82; 
      
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)';
      ctx.beginPath(); ctx.ellipse(playerX, playerY + 35, 35, 10, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = playerColor; 
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(playerX - 35, playerY - 55, 70, 85, 8); ctx.fill(); ctx.stroke();
      
      // Eyes strictly white in dark mode and strictly black in light mode as requested
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.beginPath(); ctx.arc(playerX - 15, playerY - 20, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(playerX + 15, playerY - 20, 5, 0, Math.PI * 2); ctx.fill();
      
      ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
      ctx.beginPath(); ctx.arc(playerX, playerY - 5, 8, 0, Math.PI); ctx.stroke();

      if (!reading) { stateRef.current.obstacleY += speed; }

      currentQ.options.forEach((opt, oIdx) => {
        const padX = 10; 
        const x = oIdx * laneWidth + padX;
        const w = laneWidth - (padX * 2);
        const y = stateRef.current.obstacleY;
        
        if (reading && y < 0) return;

        ctx.font = '900 16px Reddit Sans';
        const wordsArr = opt.split(' ');
        const lines: string[] = [];
        let curLine = '';
        wordsArr.forEach(word => {
            const testLine = curLine + word + ' ';
            if (ctx.measureText(testLine).width > w - 20) {
                lines.push(curLine.trim());
                curLine = word + ' ';
            } else { curLine = testLine; }
        });
        lines.push(curLine.trim());

        const tileH = Math.max(140, lines.length * 24 + 60);

        ctx.fillStyle = borderColor;
        ctx.beginPath(); ctx.roundRect(x + 8, y + 8, w, tileH, 8); ctx.fill();
        
        ctx.fillStyle = oIdx === 0 ? '#D1C4E9' : oIdx === 1 ? '#FFD1DC' : '#B2F2BB';
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(x, y, w, tileH, 8); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        lines.forEach((l, i) => {
            ctx.fillText(l, x + w / 2, y + 50 + (i * 24));
        });
      });

      if (!reading && stateRef.current.obstacleY > playerY - 220 && stateRef.current.obstacleY < playerY + 40) {
        if (!stateRef.current.isTransitioning) {
          stateRef.current.isTransitioning = true;
          if (stateRef.current.lane === currentQ.correctIndex) {
            stateRef.current.score += 1;
            setScore(stateRef.current.score);
            setFeedback({ type: 'correct', text: 'COMPLETED' });
          } else { setFeedback({ type: 'wrong', text: 'FAILED' }); }
          
          setTimeout(() => {
            stateRef.current.obstacleY = -3500;
            stateRef.current.currentIdx += 1;
            stateRef.current.isTransitioning = false;
            setCurrentIdx(stateRef.current.currentIdx);
            setFeedback(null);
          }, 800);
        }
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [gameState, questions, theme, playerColor, dimensions]);

  if (gameState === 'instructions') {
    return (
      <div className="h-full w-full flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden z-[1000] fixed inset-0">
        <div className={`p-8 md:p-10 neo-brutal rounded-[2rem] text-center max-w-lg w-full ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
          <h2 className={`text-4xl md:text-5xl font-black mb-10 uppercase italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Recall Active</h2>
          <div className="text-left space-y-6 mb-12">
            <p className={`font-bold text-xl md:text-2xl flex items-center gap-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              <span className={`w-12 h-12 flex-none flex items-center justify-center rounded-xl border-4 ${theme === 'light' ? 'bg-black text-white border-black' : 'bg-white text-black'}`}>1</span>
              Synthesize audio data streams.
            </p>
            <p className={`font-bold text-xl md:text-2xl flex items-center gap-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              <span className={`w-12 h-12 flex-none flex items-center justify-center rounded-xl border-4 ${theme === 'light' ? 'bg-black text-white border-black' : 'bg-white text-black'}`}>2</span>
              Switch lanes to verify knowledge.
            </p>
          </div>
          <div className="mb-10 pt-8 border-t-4 border-[var(--brutal-border)]">
             <div className="flex gap-4 justify-center flex-wrap">
                {darkerPastels.map(c => (
                    <button 
                        key={c} 
                        onClick={() => onColorChange(c)} 
                        className={`w-10 h-10 rounded-full border-4 transition-all ${playerColor === c ? 'scale-125 border-black dark:border-white ring-4 ring-offset-4 ring-offset-white' : 'border-transparent opacity-70 hover:opacity-100'}`} 
                        style={{backgroundColor: c}}
                    />
                ))}
             </div>
          </div>
          <button onClick={() => setGameState('playing')} className="w-full py-6 font-black text-3xl uppercase btn-main rounded-[1.5rem]">Engage</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx]?.question || "";
  let runningCharCount = 0;
  const wordsWithIndices = currentQuestion.split(' ').map((word) => {
    const startIdx = runningCharCount;
    runningCharCount += word.length + 1; 
    return { text: word, start: startIdx };
  });

  return (
    <div className="fixed inset-0 top-20 flex flex-col lg:flex-row bg-white dark:bg-black overflow-hidden select-none touch-none h-[calc(100vh-80px)]">
      {/* Question Panel: strictly white bg in light mode, strictly 10% height on mobile. Strictly black text for light mode as per absolute requirements. */}
      <div className={`flex-none h-[10%] lg:h-full lg:w-1/3 p-4 lg:p-14 border-b-8 lg:border-b-0 lg:border-r-8 border-[var(--brutal-border)] flex flex-col items-center z-50 transition-all ${theme === 'dark' ? 'bg-[#1a1125]' : 'bg-white'}`}>
        <div className={`text-[10px] font-black uppercase mb-4 tracking-widest hidden lg:block ${theme === 'dark' ? 'text-pink-300 opacity-50' : 'text-pink-900 opacity-50'}`}>Recall Stream</div>
        <div ref={scrollRef} className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth flex flex-wrap content-start justify-center gap-x-3 gap-y-2 relative">
          <div className="w-full h-[20%]" /> 
          {wordsWithIndices.map((word, i) => {
            const isActive = currentCharIndex !== -1 && word.start <= currentCharIndex && (i === wordsWithIndices.length - 1 || wordsWithIndices[i+1].start > currentCharIndex);
            return (
              <span 
                key={i}
                ref={el => { wordsRef.current[i] = el; }}
                data-start={word.start}
                className={`text-xl md:text-2xl lg:text-5xl font-black uppercase tracking-tighter transition-all duration-300 ${
                  isActive 
                  ? 'text-pink-500 dark:text-pink-400 opacity-100 scale-110' 
                  : (theme === 'dark' ? 'text-white opacity-10' : 'text-black opacity-100')
                }`}
              >
                {word.text}
              </span>
            );
          })}
          <div className="w-full h-[20%]" />
        </div>
      </div>
      <div ref={gameAreaRef} className="flex-1 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full block" />
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[200] p-4">
            <div className="neo-brutal p-8 md:p-14 rotate-[-4deg] animate-in zoom-in bg-white dark:bg-zinc-900">
              <span className={`text-5xl md:text-8xl font-black uppercase italic ${feedback.type === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                {feedback.text}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunnerGame;