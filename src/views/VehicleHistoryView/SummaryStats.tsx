/**
 * SummaryStats.tsx: Σύνοψη στατιστικών οχήματος.
 * Εμφανίζει συνοπτικά στοιχεία όπως το σύνολο των εγγυήσεων και την τελευταία επίσκεψη.
 */
import React from 'react';

interface SummaryStatsProps {
  summary: {
    total: number;
    lastVisit: string;
    daysSince: number;
    latestBrand: string;
    latestCompany: string;
  };
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 animate-fade-in">
      <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
        <div className="text-[9px] font-black text-blue-400 uppercase mb-2 tracking-widest">ΣΥΝΟΛΟ ΕΓΓΥΗΣΕΩΝ</div>
        <div className="text-3xl font-black text-blue-700 tracking-tighter">{summary.total}</div>
      </div>
      <div className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100">
        <div className="text-[9px] font-black text-zinc-400 uppercase mb-2 tracking-widest">ΤΕΛΕΥΤΑΙΑ ΕΠΙΣΚΕΨΗ</div>
        <div className="text-3xl font-black text-zinc-900 tracking-tighter">{summary.lastVisit}</div>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mt-1">Πριν από {summary.daysSince} ημέρες</div>
      </div>
      <div className="p-8 bg-zinc-900 rounded-[2rem] shadow-xl text-white">
        <div className="text-[9px] font-black text-zinc-500 uppercase mb-2 tracking-widest">ΟΧΗΜΑ</div>
        <div className="text-xl font-black tracking-tighter uppercase italic mb-1">{summary.latestBrand}</div>
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{summary.latestCompany}</div>
      </div>
    </div>
  );
};
