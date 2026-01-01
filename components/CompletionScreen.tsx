
import React from 'react';
import { EscapeRoomData, UserProgress } from '../types';

interface CompletionScreenProps {
  data: EscapeRoomData;
  progress: UserProgress;
  onRestart: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ data, progress, onRestart }) => {
  const score = Math.round(progress.score);
  
  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <div className="bg-slate-900 border-4 border-indigo-500/40 rounded-[60px] p-16 text-center shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>

        <div className="w-32 h-32 bg-green-600 rounded-[40px] flex items-center justify-center mx-auto mb-12 shadow-[0_0_60px_rgba(22,163,74,0.5)] animate-bounce border-4 border-green-400/50">
          <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-7xl font-black mb-6 text-white tracking-tighter crt-glow">MISSION ACCOMPLISHED</h1>
        <p className="text-2xl text-indigo-400 font-mono mb-16 uppercase tracking-[0.5em] font-black">Temporal Stability Restored</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-black/50 p-10 rounded-[40px] border-2 border-slate-800 shadow-inner">
            <span className="text-slate-500 block mb-4 text-sm font-black uppercase tracking-[0.2em]">Efficiency Rating</span>
            <span className="text-6xl font-black text-white">{score}%</span>
          </div>
          <div className="bg-black/50 p-10 rounded-[40px] border-2 border-slate-800 shadow-inner">
            <span className="text-slate-500 block mb-4 text-sm font-black uppercase tracking-[0.2em]">Attempts Logged</span>
            <span className="text-6xl font-black text-white">{progress.attempts}</span>
          </div>
          <div className="bg-black/50 p-10 rounded-[40px] border-2 border-slate-800 shadow-inner">
            <span className="text-slate-500 block mb-4 text-sm font-black uppercase tracking-[0.2em]">Time In Field</span>
            <span className="text-6xl font-black text-white">
              {Math.floor((Date.now() - progress.startTime) / 60000)}m
            </span>
          </div>
        </div>

        {data.sources.length > 0 && (
          <div className="bg-black/30 p-12 rounded-[50px] border-2 border-white/5 mb-16 text-right shadow-2xl">
            <h3 className="text-2xl font-black text-indigo-400 mb-10 flex items-center justify-end gap-5 border-b-2 border-indigo-500/20 pb-4 uppercase tracking-widest">
              <span>GROUNDING_DATA_SOURCES // למידה נוספת</span>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {data.sources.map((source, i) => (
                <li key={i}>
                  <a 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-indigo-400 transition-all flex items-center gap-5 group p-4 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/10"
                  >
                    <span className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                    <span className="text-xl font-bold underline decoration-indigo-500/30 underline-offset-8">{source.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onRestart}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-24 py-8 rounded-[40px] text-4xl transition-all shadow-[0_20px_80px_rgba(79,70,229,0.5)] active:scale-95 uppercase tracking-tighter"
        >
          NEW_ASSIGNMENT // התחלה מחדש
        </button>
      </div>
    </div>
  );
};

export default CompletionScreen;
