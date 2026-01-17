import React, { useState, useEffect, useRef } from 'react';
import { AppState, Unit, StudySegment, QuizQuestion, MaterialData, StudyPlan } from './types';
import { analyzeMaterial, generateQuiz, adjustPlan } from './services/geminiService';
import { saveState, loadState } from './services/storage';
import RunnerGame from './components/RunnerGame';
import { LoadingScreen } from './components/LoadingScreen';
import { HomeView } from './components/HomeView';
import { PlanningView } from './components/PlanningView';
import { TimerView } from './components/TimerView';
import { SummaryView } from './components/SummaryView';

// Redundant aistudio declaration removed to avoid conflict with the environment's pre-defined AIStudio type.

const OpaliteLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 380 338" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.53101 111.959L14.531 3.95898L107.531 52.459L188.031 35.959L275.031 52.459L364.531 3.95898L377.031 111.959L347.031 246.959L320.531 297.959L188.031 334.459L55.031 297.959L33.031 246.959L2.53101 111.959Z" stroke="currentColor" strokeWidth="12"/>
    <path d="M13.531 4.95898L72.031 149.459M72.031 149.459L107.531 54.459M72.031 149.459L32.031 242.459M72.031 149.459L153.531 228.459M153.531 228.459H225.531M153.531 228.459L191.031 259.959M153.531 228.459L55.031 300.959M225.531 228.459L191.031 259.959M225.531 228.459L309.531 149.459M225.531 228.459L318.531 295.459M191.031 259.959V287.959M191.031 287.959L210.031 295.459L225.531 281.459M191.031 287.959L170.031 295.459L153.531 281.459M309.531 149.459L274.031 54.459M309.531 149.459L365.031 4.95898M309.531 149.459L349.031 242.459" stroke="currentColor" strokeWidth="12"/>
  </svg>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'home', theme: 'light', units: [], currentUnitId: null,
    currentSegmentIndex: 0, lastQuizScore: 0, playerColor: '#F06292'
  });

  const [isLoading, setIsLoading] = useState(true);
  const isHydrated = useRef(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    loadState().then((saved) => {
      if (saved) {
        setState({ ...saved, view: 'home' });
      }
      isHydrated.current = true;
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isHydrated.current) {
      saveState(state);
      document.body.className = state.theme === 'light' ? 'light' : 'dark';
    }
  }, [state]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isTimerActive) {
      setIsTimerActive(false);
      handleFocusComplete();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const toggleTheme = () => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Safety fallback: Check for aistudio API key selection if in that environment
    try {
      if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
      }
    } catch (e) {
      console.warn("API Key selection utility unavailable or failed", e);
    }

    setIsLoading(true);
    const mimeType = file.type || 'text/plain';
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const data = e.target?.result as string;
      const material: MaterialData = { data, mimeType };
      try {
        const plan = await analyzeMaterial(material);
        const newUnit: Unit = {
          id: Date.now().toString(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          material,
          plan, score: 0, progress: 0, createdAt: Date.now()
        };
        setState(prev => ({
          ...prev, 
          currentUnitId: newUnit.id,
          units: [newUnit, ...prev.units],
          view: 'planning'
        }));
      } catch (err: any) { 
        console.error("Critical Analysis Error:", err);
        const errMsg = err.message || "Unknown error";
        if (errMsg.includes("Requested entity was not found")) {
            alert("API Configuration issue detected. Please re-select your API key.");
            if ((window as any).aistudio) await (window as any).aistudio.openSelectKey();
        } else {
            alert(`Analysis failed: ${errMsg}`); 
        }
      }
      finally { setIsLoading(false); }
    };

    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file); 
    }
  };

  const activeUnit = state.units.find(u => u.id === state.currentUnitId);
  const totalGlobalScore = state.units.reduce((acc, u) => acc + u.score, 0);

  const startSegment = (index: number) => {
    if (!activeUnit) return;
    setState(prev => ({ ...prev, currentSegmentIndex: index, view: 'timer' }));
    setTimer(activeUnit.plan.segments[index].estimatedDuration * 60);
    setIsTimerActive(true);
  };

  const handleFocusComplete = async () => {
    if (!activeUnit) return;
    setIsLoading(true);
    const segment = activeUnit.plan.segments[state.currentSegmentIndex];
    try {
      const questions = await generateQuiz(segment.topic, activeUnit.material);
      setQuizQuestions(questions);
      setState(prev => ({ ...prev, view: 'game' }));
    } catch (err: any) { 
        console.error("Recall Protocol Error:", err);
        alert("Recall session could not be initialized."); 
    }
    finally { setIsLoading(false); }
  };

  const handleGameComplete = async (correctCount: number) => {
    if (!activeUnit) return;
    const percentage = (correctCount / (quizQuestions.length || 1)) * 100;
    const isRedo = percentage < 50;
    const newPlan = await adjustPlan(activeUnit.plan, state.currentSegmentIndex, percentage);
    const updatedPlan: StudyPlan = {
      ...newPlan,
      segments: newPlan.segments.map((s, idx) => 
        idx === state.currentSegmentIndex ? { ...s, status: isRedo ? 'redo' : 'completed' } as StudySegment : s
      )
    };
    const completedCount = updatedPlan.segments.filter(s => s.status === 'completed').length;
    const progress = Math.round((completedCount / updatedPlan.segments.length) * 100);

    setState(prev => ({
      ...prev, lastQuizScore: percentage, view: 'summary',
      units: prev.units.map(u => u.id === prev.currentUnitId ? {
          ...u, plan: updatedPlan, score: u.score + (correctCount * 10), progress: progress
        } : u)
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLight = state.theme === 'light';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-300">
      <header className={`flex-none h-20 px-4 md:px-10 py-4 border-b-8 border-[var(--brutal-border)] flex justify-between items-center transition-all ${isLight ? 'bg-[var(--nav-bg)]' : 'bg-[#151515]'} z-50`}>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setState(p => ({...p, view: 'home', currentUnitId: null}))}>
          <OpaliteLogo className={`w-10 h-10 md:w-12 md:h-12 ${isLight ? 'text-black' : 'text-white'}`} />
          <h1 className={`text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-none ${isLight ? 'text-black' : 'text-white'}`}>OPALITE AI</h1>
        </div>
        <div className="flex gap-4 items-center">
            <button onClick={toggleTheme} className={`w-10 h-10 md:w-12 md:h-12 btn-theme-toggle flex items-center justify-center rounded-[1rem] text-xl`}>
              {isLight ? '🌙' : '☀️'}
            </button>
            <div className={`neo-brutal-sm px-4 md:px-6 py-1.5 rounded-[1rem] bg-[var(--app-bg)] flex items-center h-10 md:h-12`}>
                <span className={`text-xs md:text-sm font-black uppercase tabular-nums`}>XP: {totalGlobalScore}</span>
            </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden h-full">
        {isLoading && <LoadingScreen isLight={isLight} />}
        <div className={`w-full h-full overflow-y-auto no-scrollbar ${state.view === 'game' ? 'p-0 overflow-hidden' : 'px-4 md:px-8 py-10'}`}>
          {!isLoading && state.view === 'home' && (
            <HomeView 
              units={state.units} 
              onFileUpload={handleFileUpload}
              onSelectUnit={(id) => setState(p => ({...p, view: 'planning', currentUnitId: id}))} 
            />
          )}

          {!isLoading && state.view === 'planning' && activeUnit && (
            <PlanningView 
              activeUnit={activeUnit}
              activeSubjectName={""} 
              onBack={() => setState(p => ({...p, view: 'home', currentUnitId: null}))}
              onStartSegment={startSegment}
              isLight={isLight}
            />
          )}

          {!isLoading && state.view === 'timer' && activeUnit && (
            <TimerView 
              topic={activeUnit.plan.segments[state.currentSegmentIndex].topic}
              description={activeUnit.plan.segments[state.currentSegmentIndex].description}
              timer={timer}
              totalDuration={activeUnit.plan.segments[state.currentSegmentIndex].estimatedDuration}
              isActive={isTimerActive}
              onToggleActive={() => setIsTimerActive(!isTimerActive)}
              onTakeTest={handleFocusComplete}
              isLight={isLight}
              formatTime={formatTime}
            />
          )}

          {!isLoading && state.view === 'game' && (
            <RunnerGame 
              questions={quizQuestions} 
              onComplete={handleGameComplete} 
              theme={state.theme} 
              playerColor={state.playerColor} 
              onColorChange={(c) => setState(p => ({...p, playerColor: c}))} 
            />
          )}

          {!isLoading && state.view === 'summary' && (
            <SummaryView 
              lastScore={state.lastQuizScore}
              isLight={isLight}
              onGoToHub={() => setState(p => ({ ...p, view: 'planning' }))}
              onNextCycle={() => {
                if (activeUnit && state.currentSegmentIndex + 1 < activeUnit.plan.segments.length) startSegment(state.currentSegmentIndex + 1);
                else setState(p => ({ ...p, view: 'home' }));
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
