/**
 * BrandAnalytics.tsx: Ανάλυση ανά Brand και Εταιρεία.
 * Εμφανίζει στατιστικά στοιχεία για τις κορυφαίες μάρκες και διανομείς.
 */
import React from 'react';
import { motion } from 'motion/react';
import { BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface BrandAnalyticsProps {
  stats: any;
}

export const BrandAnalytics: React.FC<BrandAnalyticsProps> = ({ stats }) => {
  return (
    <Card title="BRAND & ΕΤΑΙΡΕΙΕΣ" icon={BarChart3}>
      <div className="space-y-6">
        <div className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-4">Top Brands</div>
        {stats.brandStats.slice(0, 4).map(([name, count]) => {
          const p = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <div key={name} className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase">
                <span>{name}</span>
                <span>{count}</span>
              </div>
              <div className="h-1.5 bg-zinc-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  className="h-full bg-blue-600"
                />
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t border-zinc-50">
          <div className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-4">Top Companies</div>
          {stats.companyStats.slice(0, 3).map(([name, count]) => (
            <div key={name} className="flex justify-between items-center py-2 border-b border-zinc-50 last:border-0">
              <span className="text-[10px] font-black text-zinc-500 uppercase">{name}</span>
              <span className="px-2 py-0.5 rounded-lg bg-zinc-100 text-[10px] font-black text-zinc-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
