
import React, { useState, useEffect } from 'react';
import { getSavedArchiveCount } from '../services/localService';

interface SetupScreenProps {
  onStart: (topic: string, useLocal?: boolean) => void;
  onShowReport: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onShowReport }) => {
  const [topic, setTopic] = useState('');
  
  const commonTopics = [
    'מבשרי הציונות וחיבת ציון',
    'הרצל והתנועה הציונית',
    'העלייה הראשונה והיישוב הישן',
    'העלייה השנייה והלאומיות הערבית'
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-6 flex flex-col items-center animate-slide-up">
      
      {/* Header with Mystery Image */}
      <div className="relative w-full h-64 md:h-80 mb-12 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1533073356968-74847af6ec92?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale contrast-125" 
          alt="Shadowy Archive"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        <div className="absolute bottom-10 left-0 right-0 text-center px-4">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-none glow-text glitch-text">
            TIME <span className="text-emerald-500">AGENT</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="h-[1px] w-12 bg-emerald-500/30"></span>
            <p className="text-sm md:text-lg text-emerald-500 font-black uppercase tracking-[0.4em]">מסוף שחזור נתונים מוצפן</p>
            <span className="h-[1px] w-12 bg-emerald-500/30"></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Side: Classified Info Panel */}
        <div className="lg:col-span-4 glass-panel p-8 rounded-[2.5rem] border-r-4 border-red-600/40 hidden lg:block">
          <h3 className="text-red-500 font-black mb-4 uppercase text-xs tracking-widest">סטטוס משימה // TOP SECRET</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">
            "ההיסטוריה אינה רצף ליניארי כפי שחשבנו. ציר הזמן של הבגרות נמצא תחת מתקפה של 'שיבושי שכחה'. עלייך להיכנס לארכיונים, לפענח את הצפנים ולהחזיר את היציבות לציונות."
          </p>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="text-[10px] text-emerald-500 font-black mb-2 uppercase">משתמשת מזוהה</div>
            <div className="text-white font-mono text-sm font-bold">AGENT_DAUGHTER_01</div>
          </div>
        </div>

        {/* Right Side: Control Console */}
        <div className="lg:col-span-8 w-full glass-panel p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative text-right border-t border-white/10" dir="rtl">
          <label className="block text-slate-300 font-black text-xl mb-6 uppercase tracking-wider">
            בחרי פרק היסטורי לשחזור:
          </label>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="הקלידי נושא או בחרי מהרשימה..."
            className="w-full bg-black/60 border-2 border-white/10 rounded-2xl px-6 py-5 text-2xl text-white focus:border-emerald-500 focus:outline-none transition-all mb-8 text-center font-bold placeholder:opacity-20 shadow-inner"
          />

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {commonTopics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`px-6 py-4 rounded-2xl text-base md:text-lg font-bold transition-all border-2 ${topic === t ? 'bg-emerald-600/20 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-slate-400 border-transparent hover:border-white/10'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => topic.trim() && onStart(topic, true)}
              disabled={!topic.trim()}
              className="group bg-slate-100 hover:bg-white text-black font-black py-8 rounded-[2rem] text-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-10 flex flex-col items-center justify-center gap-2"
            >
              הפעל ארכיון יציב
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-mono group-hover:opacity-60">משחק ללא צורך בחיבור</span>
            </button>

            <button
              onClick={() => topic.trim() && onStart(topic, false)}
              disabled={!topic.trim()}
              className="group bg-emerald-600 hover:bg-emerald-500 text-white font-black py-8 rounded-[2rem] text-2xl transition-all active:scale-[0.98] disabled:opacity-10 flex flex-col items-center justify-center gap-2 border-b-8 border-emerald-900 shadow-2xl"
            >
              סינכרון AI חי
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-mono group-hover:opacity-60">יצירת חדר חדש ע"י בינה מלאכותית</span>
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
            <button onClick={onShowReport} className="text-slate-400 hover:text-emerald-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              דוח סטטוס ארכיונים
            </button>
            <div className="flex gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">מערכת מוכנה לשחזור</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
