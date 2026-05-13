/**
 * TrendChart.tsx: Γράφημα τάσεων (Volume Trends).
 * Εμφανίζει τον όγκο των εγγυήσεων ανά μήνα με δυναμικές μπάρες.
 */
import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface TrendChartProps {
  stats: any;
}

export const TrendChart: React.FC<TrendChartProps> = ({ stats }) => {
  return (
    <Card title="ΤΑΣΕΙΣ ΟΓΚΟΥ" icon={TrendingUp}>
      <div className="h-full flex flex-col justify-between">
        <div className="flex items-end justify-between h-48 gap-2 pt-6">
          {stats.trendData.map((d, i) => {
            const maxVal = Math.max(...stats.trendData.map(t => t.value), 1);
            const h = (d.value / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                <div className="relative w-full flex justify-center h-full items-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full max-w-[32px] bg-zinc-900 rounded-t-xl group-hover:bg-blue-600 transition-colors cursor-help relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.value} ΕΓΓΥΗΣΕΙΣ
                    </div>
                  </motion.div>
                </div>
                <div className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">
                  {d.label.split('/')[0]}/{d.label.split('/')[1].slice(-2)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
          <div className="text-[9px] font-black text-blue-800 uppercase tracking-widest mb-1">Status Summary</div>
          <div className="text-[10px] font-bold text-blue-600/70 uppercase">
            Μέσος όρος {Math.round(stats.total / (stats.trendData.length || 1))} εγγυήσεων ανά μήνα
          </div>
        </div>
      </div>
    </Card>
  );
};
