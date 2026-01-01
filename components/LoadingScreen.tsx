
import React, { useEffect, useState } from 'react';

const messages = [
  "מעיין בחומרי הלימוד של משרד החינוך...",
  "מייצר ויזואליה היסטורית בתיק החקירה...",
  "בונה את חדרי הזמן ההיסטוריים...",
  "מסנכרן את ציר הזמן הדיגיטלי...",
  "מטמין רמזים בין דפי ההיסטוריה...",
  "מתכונן למסע בזמן...",
  "מכין את חידות הבגרות המאתגרות...",
  "מעבד נתוני מודיעין מהארכיון..."
];

const LoadingScreen: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="relative w-32 h-32 mb-12">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tighter">Initializing Narrative Engine</h2>
      <p className="text-xl text-indigo-300 animate-pulse transition-all duration-500 font-medium">
        {messages[msgIndex]}
      </p>
      <div className="mt-8 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-indigo-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
