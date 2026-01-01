
import React, { useEffect, useState } from 'react';
import { getAllTopicsReport, TopicReportItem } from '../services/localService';

interface ReportScreenProps {
  onBack: () => void;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ onBack }) => {
  const [report, setReport] = useState<TopicReportItem[]>([]);

  useEffect(() => {
    setReport(getAllTopicsReport());
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/80 backdrop-blur-xl border-4 border-indigo-500/30 rounded-[50px] p-12 relative shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 right-12 -translate-y-1/2 bg-indigo-600 px-8 py-3 rounded-full text-white font-black uppercase tracking-widest text-lg shadow-xl">
          דוח סטטוס ארכיון
        </div>

        <div className="mb-12 text-right">
          <h2 className="text-5xl font-black text-white mb-4 crt-glow">פירוט מאגר הידע</h2>
          <div className="h-1.5 w-32 bg-indigo-500 rounded-full"></div>
          <p className="text-slate-300 mt-6 text-2xl leading-relaxed">
            להלן פירוט כל הנושאים ההיסטוריים המקודדים במערכת, כולל שאלות מובנות ושאלות שנוצרו על ידי בינה מלאכותית.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[35px] border-2 border-indigo-500/20 bg-black/40 shadow-inner">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b-4 border-indigo-500/30 bg-indigo-500/5">
                <th className="py-8 px-8 text-indigo-400 font-black uppercase tracking-[0.2em] text-sm">נושא היסטורי</th>
                <th className="py-8 px-8 text-indigo-400 font-black uppercase tracking-[0.2em] text-sm text-center">שאלות מובנות</th>
                <th className="py-8 px-8 text-indigo-400 font-black uppercase tracking-[0.2em] text-sm text-center">שאלות AI</th>
                <th className="py-8 px-8 text-indigo-400 font-black uppercase tracking-[0.2em] text-sm text-center">סה"כ במאגר</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {report.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-500/10 transition-colors group">
                  <td className="py-8 px-8 font-black text-white text-2xl group-hover:text-indigo-300">
                    {item.topic}
                  </td>
                  <td className="py-8 px-8 text-center font-mono text-slate-400 text-2xl">
                    {item.staticCount}
                  </td>
                  <td className="py-8 px-8 text-center font-mono text-indigo-400 text-2xl font-black">
                    {item.dynamicCount}
                  </td>
                  <td className="py-8 px-8 text-center">
                    <span className="bg-indigo-500/20 text-indigo-300 px-6 py-3 rounded-[20px] font-black font-mono text-2xl shadow-lg border border-indigo-500/30">
                      {item.total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 flex flex-col gap-10">
           <div className="p-10 bg-indigo-500/5 border-2 border-indigo-500/20 rounded-[40px] text-xl text-slate-300 leading-relaxed italic shadow-inner">
             <span className="font-black text-indigo-400 block mb-2 uppercase tracking-widest text-sm">הערת מערכת:</span>
             * שאלות AI מתווספות למאגר המקומי שלך באופן אוטומטי בכל פעם שאתה מפעיל את "AI MODE" עבור נושא חדש. המערכת שומרת עד 20 שאלות ייחודיות לכל נושא כדי לייעל את ציר הזמן.
           </div>

          <button
            onClick={onBack}
            className="w-full py-10 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-[40px] uppercase tracking-[0.4em] transition-all active:scale-95 text-3xl flex items-center justify-center gap-6 group border-4 border-white/5 shadow-2xl"
          >
            <svg className="w-10 h-10 group-hover:translate-x-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span>חזרה למסך הראשי</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
