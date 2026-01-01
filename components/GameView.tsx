
import React, { useState, useEffect, useCallback } from 'react';
import { EscapeRoomData, UserProgress, Puzzle } from '../types';

interface GameViewProps {
  data: EscapeRoomData;
  onFinish: (progress: UserProgress) => void;
}

const HEBREW_LETTERS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
];

const MYSTERY_IMAGES = [
  "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=1200", 
  "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?auto=format&fit=crop&q=80&w=1200", 
  "https://images.unsplash.com/photo-1516246843873-9d12356b6fab?auto=format&fit=crop&q=80&w=1200", 
  "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200", 
  "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?auto=format&fit=crop&q=80&w=1200", 
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1200", 
  "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1200"
];

const GameView: React.FC<GameViewProps> = ({ data, onFinish }) => {
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFailureLock, setShowFailureLock] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); 
  const [displayDesc, setDisplayDesc] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [orderItems, setOrderItems] = useState<{id: number, text: string}[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [roomAttempts, setRoomAttempts] = useState(0);

  const [progress, setProgress] = useState<UserProgress>({
    currentRoom: 0,
    score: 0,
    attempts: 0,
    startTime: Date.now()
  });

  const currentPuzzle = data.puzzles[currentRoomIdx];
  const roomImage = MYSTERY_IMAGES[currentRoomIdx % MYSTERY_IMAGES.length];

  const renderRedacted = (text: string) => {
    return text.split(' ').map((word, i) => {
      if (word.length > 5 && Math.random() > 0.8) {
        return <span key={i} className="redacted" title="מידע מסווג">{word}</span>;
      }
      return word + ' ';
    });
  };

  const checkAnswer = useCallback(() => {
    let correct = false;
    const normalize = (s: string) => s.trim().toLowerCase().replace(/["']/g, '');

    if (currentPuzzle.type === 'MULTIPLE_CHOICE') {
      correct = selectedOption === currentPuzzle.correctAnswer;
    } else if (currentPuzzle.type === 'CODE_ENTRY') {
      correct = normalize(codeInput) === normalize(currentPuzzle.correctCode || '');
    } else if (currentPuzzle.type === 'ORDERING') {
      correct = JSON.stringify(orderItems.map(it => it.id)) === JSON.stringify(currentPuzzle.correctSequence);
    } else if (currentPuzzle.type === 'MATCHING') {
      correct = Object.keys(matches).length === currentPuzzle.matchingPairs?.length &&
                Object.entries(matches).every(([l, r]) => currentPuzzle.matchingPairs?.find(p => p.left === l)?.right === r);
    }

    if (correct) {
      setShowFeedback(true);
      setProgress(p => ({ ...p, score: p.score + (100 / data.totalRooms), currentRoom: currentRoomIdx + 1, attempts: p.attempts + 1 }));
    } else {
      const nextAttempts = roomAttempts + 1;
      setRoomAttempts(nextAttempts);
      setIsWrong(true);
      setProgress(p => ({ ...p, attempts: p.attempts + 1 }));
      
      if (nextAttempts >= 4) {
        setShowFailureLock(true);
      }
      
      setTimeout(() => setIsWrong(false), 500);
    }
  }, [currentPuzzle, selectedOption, codeInput, orderItems, matches, roomAttempts, currentRoomIdx, data.totalRooms]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showIntro || showFeedback || showFailureLock) return;
      
      if (currentPuzzle.type === 'CODE_ENTRY') {
        if (e.key === 'Backspace') {
          setCodeInput(prev => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          checkAnswer();
        } else if (HEBREW_LETTERS.includes(e.key)) {
          setCodeInput(prev => prev + e.key);
        } else if (/^[a-zA-Z0-9\s]$/.test(e.key)) {
           setCodeInput(prev => prev + e.key);
        }
      } else if (currentPuzzle.type === 'MULTIPLE_CHOICE') {
        const num = parseInt(e.key);
        if (num >= 1 && num <= (currentPuzzle.options?.length || 0)) {
          setSelectedOption(num - 1);
        } else if (e.key === 'Enter' && selectedOption !== null) {
          checkAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPuzzle, selectedOption, showIntro, showFeedback, showFailureLock, codeInput, checkAnswer]);

  useEffect(() => {
    if (!currentPuzzle) return;
    
    setIsGlitching(true);
    setDisplayDesc('');
    setCodeInput('');
    setSelectedOption(null);
    setMatches({});
    setRoomAttempts(0);
    
    setTimeout(() => setIsGlitching(false), 400);

    let i = 0;
    const interval = setInterval(() => {
      setDisplayDesc(currentPuzzle.description.substring(0, i));
      i++;
      if (i > currentPuzzle.description.length) clearInterval(interval);
    }, 10);

    if (currentPuzzle.type === 'ORDERING' && currentPuzzle.itemsToOrder) {
      setOrderItems(currentPuzzle.itemsToOrder.map((text, i) => ({ id: i, text })).sort(() => Math.random() - 0.5));
    }

    return () => clearInterval(interval);
  }, [currentRoomIdx]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const getAnswerString = () => {
    if (currentPuzzle.type === 'MULTIPLE_CHOICE' && currentPuzzle.options) {
      return currentPuzzle.options[currentPuzzle.correctAnswer ?? 0];
    }
    if (currentPuzzle.type === 'CODE_ENTRY') {
      return currentPuzzle.correctCode;
    }
    if (currentPuzzle.type === 'ORDERING' && currentPuzzle.itemsToOrder) {
      return currentPuzzle.correctSequence?.map(idx => currentPuzzle.itemsToOrder?.[idx]).join(' -> ');
    }
    if (currentPuzzle.type === 'MATCHING') {
      return currentPuzzle.matchingPairs?.map(p => `${p.left}: ${p.right}`).join(', ');
    }
    return "לא זמין";
  };

  const nextRoom = () => {
    if (currentRoomIdx + 1 < data.puzzles.length) {
      setCurrentRoomIdx(currentRoomIdx + 1);
      setShowFeedback(false);
      setShowFailureLock(false);
    } else {
      onFinish(progress);
    }
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 text-right" dir="rtl">
        <div className="max-w-3xl w-full glass-panel p-12 rounded-[4rem] border-r-[12px] border-emerald-500 shadow-2xl animate-slide-up">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter glow-text">{data.topic}</h2>
          <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed italic mb-16 font-medium">"{data.narrative}"</p>
          <button 
            onClick={() => setShowIntro(false)}
            className="w-full py-8 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-3xl text-3xl transition-all shadow-2xl border-b-8 border-emerald-900 cyber-button"
          >
            אישור כניסה לארכיון
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex-1 flex flex-col p-4 md:p-8 lg:px-16 relative min-h-screen ${isGlitching ? 'glitch opacity-50' : ''}`}>
      
      {/* Torn Paper Background Image */}
      <div className="absolute inset-0 z-[-1] overflow-hidden p-4 md:p-12 pointer-events-none">
        <div 
          className="w-full h-full torn-paper paper-shadow grayscale contrast-125 opacity-20 transition-all duration-1000"
          style={{ backgroundImage: `url(${roomImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8 z-10">
        
        {/* Top HUD */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
          <div className="col-span-2 md:col-span-1 text-right">
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest block mb-1">משימה פעילה</span>
            <span className="text-2xl font-black text-white glow-text truncate block">{data.topic}</span>
          </div>
          <div className="text-center border-r border-white/10 hidden md:block">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">חדר / יעד</span>
            <div className="text-3xl font-black text-white">{currentRoomIdx + 1} / {data.totalRooms}</div>
          </div>
          <div className="text-center md:border-r border-white/10">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">ניסיונות בחדר</span>
            <div className={`text-3xl font-black font-mono ${roomAttempts >= 3 ? 'text-red-500' : 'text-emerald-500'}`}>
              {roomAttempts} / 4
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 flex-1 items-center justify-center py-4">
          
          <div className="w-full max-w-5xl glass-panel p-8 md:p-16 rounded-[4rem] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] relative border-t border-white/10 bg-slate-900/40 min-h-[600px]">
            <div className="absolute top-8 left-12 bg-red-600/20 text-red-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20">Secret // {currentRoomIdx + 1}</div>
            
            <div className="mb-12 text-center">
               <div className="text-[10px] text-emerald-500 font-black mb-4 tracking-[0.4em] uppercase opacity-60">נתוני שטח שנאספו</div>
               <div className="text-xl md:text-2xl text-slate-100 leading-relaxed font-medium mb-10 max-w-3xl mx-auto italic">
                {renderRedacted(displayDesc)}
                <span className="inline-block w-1 h-5 bg-emerald-500 animate-pulse ml-1"></span>
              </div>
               <h3 className="text-4xl md:text-6xl font-black text-white mb-8 glow-text leading-[1.1]">{currentPuzzle.question}</h3>
               <div className="h-1.5 w-32 bg-emerald-500 mx-auto rounded-full shadow-[0_0_25px_rgba(16,185,129,0.8)]"></div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center mb-12">
              {currentPuzzle.type === 'MULTIPLE_CHOICE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
                  {currentPuzzle.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`p-6 md:p-10 rounded-3xl border-2 text-right transition-all flex justify-between items-center group active:scale-[0.98] ${
                        selectedOption === i ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-lg' : 'border-white/5 text-slate-400 hover:border-emerald-500/40'
                      }`}
                    >
                      <span className="text-2xl md:text-3xl font-bold">{opt}</span>
                      <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${selectedOption === i ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                        {i + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {currentPuzzle.type === 'CODE_ENTRY' && (
                <div className="flex flex-col items-center gap-10">
                  <div className="relative w-full max-w-2xl">
                    <input
                      type="text"
                      autoFocus
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="הקלידי כאן או השתמשי במקלדת..."
                      className={`w-full bg-black/60 border-b-8 py-10 text-center text-5xl md:text-8xl font-black outline-none tracking-[0.2em] shadow-inner rounded-t-3xl placeholder:text-xl placeholder:tracking-normal placeholder:opacity-20 transition-all ${isWrong ? 'border-red-600 text-red-500 animate-shake' : 'border-emerald-500/20 text-emerald-500'}`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-6 md:grid-cols-11 gap-2 bg-white/5 p-4 rounded-3xl border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                    {HEBREW_LETTERS.map(char => (
                      <button key={char} onClick={() => setCodeInput(p => p + char)} className="w-10 h-10 md:w-14 md:h-14 bg-slate-900 border border-white/5 rounded-xl font-black text-xl hover:bg-emerald-600 transition-all active:scale-90">{char}</button>
                    ))}
                    <button onClick={() => setCodeInput(p => p.slice(0, -1))} className="col-span-3 h-14 bg-red-900/20 text-red-500 rounded-xl font-black text-lg border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">מחיקה</button>
                  </div>
                </div>
              )}

              {currentPuzzle.type === 'ORDERING' && (
                <div className="space-y-4 w-full max-w-2xl mx-auto">
                  {orderItems.map((item, i) => (
                    <div key={item.id} className="bg-slate-900/80 p-6 rounded-3xl flex justify-between items-center border-2 border-white/5 hover:border-emerald-500/30 transition-all shadow-xl">
                      <div className="flex gap-3">
                        <button onClick={() => { const n=[...orderItems]; [n[i],n[i-1]]=[n[i-1],n[i]]; setOrderItems(n); }} disabled={i===0} className="w-12 h-12 bg-emerald-500/10 rounded-xl hover:bg-emerald-600 text-2xl disabled:opacity-0 transition-all">↑</button>
                        <button onClick={() => { const n=[...orderItems]; [n[i],n[i+1]]=[n[i+1],n[i]]; setOrderItems(n); }} disabled={i===orderItems.length-1} className="w-12 h-12 bg-emerald-500/10 rounded-xl hover:bg-emerald-600 text-2xl disabled:opacity-0 transition-all">↓</button>
                      </div>
                      <span className="text-2xl font-bold text-slate-100 pr-6">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {currentPuzzle.type === 'MATCHING' && (
                <div className="grid grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                  <div className="space-y-3">
                    {currentPuzzle.matchingPairs?.map(p => (
                      <button key={p.left} onClick={() => setSelectedLeft(p.left)} className={`w-full p-6 md:p-8 rounded-2xl border-2 text-right font-bold text-2xl transition-all ${matches[p.left] ? 'opacity-20 pointer-events-none' : selectedLeft === p.left ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-white/5 hover:border-emerald-500/30'}`}>{p.left}</button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {currentPuzzle.matchingPairs?.map(p => (
                      <button key={p.right} disabled={!selectedLeft} onClick={() => { if(selectedLeft) { setMatches(m => ({...m, [selectedLeft]: p.right})); setSelectedLeft(null); }}} className={`w-full p-6 md:p-8 rounded-2xl border-2 text-right font-bold text-2xl transition-all ${Object.values(matches).includes(p.right) ? 'opacity-20 pointer-events-none' : 'border-white/5 hover:border-emerald-500'}`}>{p.right}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-8">
               <div className="bg-emerald-500/10 p-8 rounded-[2.5rem] border border-emerald-500/20 text-center">
                  <div className="text-[10px] text-emerald-500 font-black mb-2 tracking-[0.5em] uppercase">הערת סוכן שטח</div>
                  <p className="text-2xl italic text-emerald-100 font-bold">"{currentPuzzle.clue}"</p>
               </div>
               <button onClick={checkAnswer} className={`w-full py-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[3rem] text-5xl transition-all shadow-[0_20px_60px_rgba(16,185,129,0.3)] active:scale-95 border-b-8 border-emerald-900 cyber-button ${isWrong ? 'bg-red-600 border-red-800 animate-shake' : ''}`}>
                 {isWrong ? 'שידור נכשל - נסי שנית' : 'שדר צופן פענוח'}
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Feedback Overlay */}
      {showFeedback && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 text-right" dir="rtl">
          <div className="max-w-3xl w-full glass-panel p-16 md:p-24 rounded-[5rem] border-t-[20px] border-emerald-500 shadow-2xl text-center animate-slide-up">
            <h3 className="text-7xl md:text-9xl font-black text-white mb-10 tracking-tighter glow-text glitch-text">הצלחה</h3>
            <div className="bg-white/5 p-12 rounded-[3.5rem] mb-14 border border-white/5 shadow-inner">
              <p className="text-3xl md:text-5xl text-slate-100 leading-tight font-bold italic">"{currentPuzzle.explanation}"</p>
            </div>
            <button onClick={nextRoom} className="w-full py-8 bg-emerald-600 text-white font-black rounded-[2.5rem] text-4xl shadow-2xl hover:bg-emerald-500 transition-all border-b-8 border-emerald-900">המשך למשימה הבאה</button>
          </div>
        </div>
      )}

      {/* Failure Lock Overlay (4 mistakes) */}
      {showFailureLock && (
        <div className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 text-right" dir="rtl">
          <div className="max-w-4xl w-full glass-panel p-12 md:p-20 rounded-[5rem] border-t-[20px] border-red-600 shadow-2xl text-center animate-pulse">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-white/20">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-6xl md:text-8xl font-black text-red-600 mb-6 tracking-tighter uppercase italic">קריסת מערכת</h3>
            <p className="text-2xl text-slate-400 mb-10 font-bold">ציר הזמן התערער לאחר 4 ניסיונות כושלים. מבצע "שחזור נתונים בכפייה" הופעל.</p>
            <div className="bg-red-600/10 p-12 rounded-[3.5rem] mb-14 border border-red-600/30 text-center">
              <div className="text-sm text-red-500 font-black uppercase tracking-widest mb-4">נתונים ששוחזרו: התשובה הנכונה</div>
              <p className="text-4xl md:text-6xl text-white font-black tracking-tight">{getAnswerString()}</p>
              <div className="mt-8 pt-8 border-t border-red-600/20 text-slate-300 text-2xl font-medium leading-relaxed italic">
                "{currentPuzzle.explanation}"
              </div>
            </div>
            <button onClick={nextRoom} className="w-full py-8 bg-slate-100 text-black font-black rounded-[2.5rem] text-4xl shadow-2xl hover:bg-white transition-all border-b-8 border-slate-400">המשך בכל זאת</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameView;
