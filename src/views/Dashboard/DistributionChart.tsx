/**
 * DistributionChart.tsx: Κατανομή εγγυήσεων ανά κατάσταση (Status Distribution).
 * Εμφανίζει ποσοστιαία και αριθμητικά τη συμμετοχή κάθε status στο σύνολο των εγγυήσεων.
 */
import React from 'react';
import { motion } from 'motion/react';
import { PieChart } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { EntryStatus } from '../../core/config';

interface DistributionChartProps {
  stats: any;
  settings: any;
  onNavigate: (type: string, status?: string) => void;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ stats, settings, onNavigate }) => {
  const getStatusLabel = (status: string) => {
    return settings?.statusConfigs?.[status]?.label || status;
  };

  const getStatusColor = (status: string) => {
    return settings?.statusConfigs?.[status]?.color || '#64748b';
  };

  return (
    <Card title="ΚΑΤΑΝΟΜΗ ΚΑΤΑΣΤΑΣΗΣ" icon={PieChart}>
      <div className="space-y-5">
        {(settings.dashboardConfig?.distributionStatuses || settings.statusOrder || Object.keys(settings.statusConfigs || {})).map(s => {
          if (!settings.statusConfigs?.[s]) return null;
          const count = stats.counts[s] || 0;
          const p = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <button 
              key={s} 
              onClick={() => onNavigate(s === EntryStatus.REJECTED ? 'rejected' : 'all', s)}
              className="w-full text-left space-y-2 group"
            >
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900 transition-colors">
                <span>{getStatusLabel(s)}</span>
                <span>{count}</span>
              </div>
              <div className="h-2 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  className="h-full transition-all duration-1000 ease-out" 
                  style={{ backgroundColor: getStatusColor(s) }} 
                />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
