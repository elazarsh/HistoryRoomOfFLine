
import React, { useState, useEffect, useRef } from 'react';
import SetupScreen from './components/SetupScreen';
import LoadingScreen from './components/LoadingScreen';
import GameView from './components/GameView';
import CompletionScreen from './components/CompletionScreen';
import ReportScreen from './components/ReportScreen';
import { GameState, EscapeRoomData, UserProgress } from './types';
import { generateHistoryEscapeRoom } from './services/geminiService';
import { getLocalEscapeRoom, mergeToLocalArchive } from './services/localService';

// Updated music: More mysterious and atmospheric
const BACKGROUND_MUSIC = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(GameState.SETUP);
  const [data, setData] = useState<EscapeRoomData | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [isBooted, setIsBooted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) { setHasKey(false); }
    };
    checkKey();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const initSystem = () => {
    if (!audioRef.current) {
      const audio = new Audio(BACKGROUND_MUSIC);
      audio.loop = true;
      audio.volume = 0.08; // Significantly lower volume
      audioRef.current = audio;
      audio.play().catch(e => console.warn("Audio autoplay blocked.", e));
    }
    setIsBooted(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      const newMute = !isMuted;
      setIsMuted(newMute);
      audioRef.current.muted = newMute;
    }
  };

  const handleStart = async (topic: string, useLocal = false) => {
    setState(GameState.LOADING);
    setError(null);
    
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }

    if (!useLocal && !hasKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        setError("נדרשת הרשאה לשימוש ב-AI. אנא בחרי מפתח API תקין.");
        setState(GameState.SETUP);
        return;
      }
    }

    try {
      if (useLocal) {
        const localData = getLocalEscapeRoom(topic);
        if (localData) {
          setTimeout(() => { setData(localData); setState(GameState.PLAYING); }, 1500);
        } else {
          setError("הנושא '" + topic + "' לא נמצא בארכיון המקומי. נסי להשתמש ב-AI MODE.");
          setState(GameState.SETUP);
        }
      } else {
        const generatedData = await generateHistoryEscapeRoom(topic, 7);
        if (!generatedData || !generatedData.puzzles || generatedData.puzzles.length === 0) {
          throw new Error("הבינה המלאכותית לא הצליחה לייצר חידות תקינות לנושא זה.");
        }
        mergeToLocalArchive(generatedData);
        setData(generatedData);
        setState(GameState.PLAYING);
      }
    } catch (err: any) {
      let msg = "שיבוש בתקשורת: ";
      if (err.message?.includes("API key")) msg = "מפתח ה-API לא תקין או פג תוקף.";
      else if (err.message?.includes("quota")) msg = "חרגת ממכסת השימוש ב-AI. נסי שוב מאוחר יותר.";
      else msg += (err.message || "שגיאה לא ידועה.");
      
      setError(msg);
      setState(GameState.SETUP);
    }
  };

  if (!isBooted) {
    return (
      <div className="fixed inset-0 bg-[#02040a] flex flex-col items-center justify-center p-8 z-[2000]" dir="rtl">
        <div className="max-w-md w-full glass-panel p-10 rounded-[3rem] border border-emerald-500/20 text-center animate-slide-up shadow-[0_0_100px_rgba(16,185,129,0.1)]">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl mx-auto mb-8 flex items-center justify-center border border-emerald-500 shadow-lg shadow-emerald-500/20">
            <svg className="w-10 h-10 text-emerald-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-6 tracking-tighter glow-text">TIME AGENT</h1>
          <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">המערכת מוכנה לשחזור היסטורי. <br/>הסימולטור יופעל ברגע שתיכנס.</p>
          <button 
            onClick={initSystem}
            className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-2xl transition-all shadow-xl active:scale-95 border-b-4 border-emerald-800 cyber-button"
          >
            כניסה למערכת
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <header className="px-6 py-4 md:px-12 md:py-6 flex justify-between items-center glass-panel sticky top-0 z-50 border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white glow-text">Time <span className="text-emerald-500">Agent</span></h1>
        </div>
        
        <button onClick={toggleMute} className={`p-3 rounded-xl border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'}`}>
          {isMuted ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center">
        {error && (
          <div className="max-w-xl mx-auto mt-8 p-6 bg-red-950/60 border-2 border-red-600/40 rounded-2xl text-red-100 font-bold text-xl text-center shadow-2xl animate-shake flex flex-col gap-4">
            <div className="flex items-center justify-center gap-3">
               <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span>שגיאת מסוף</span>
            </div>
            {error}
            <button onClick={() => setError(null)} className="text-sm uppercase tracking-widest text-red-400 hover:text-white underline">סגור הודעה</button>
          </div>
        )}
        {state === GameState.SETUP && <SetupScreen onStart={handleStart} onShowReport={() => setState(GameState.REPORT)} />}
        {state === GameState.REPORT && <ReportScreen onBack={() => setState(GameState.SETUP)} />}
        {state === GameState.LOADING && <LoadingScreen />}
        {state === GameState.PLAYING && data && <GameView data={data} onFinish={(p) => { setUserProgress(p); setState(GameState.FINISHED); }} />}
        {state === GameState.FINISHED && data && userProgress && <CompletionScreen data={data} progress={userProgress} onRestart={() => setState(GameState.SETUP)} />}
      </section>
    </div>
  );
};

export default App;
