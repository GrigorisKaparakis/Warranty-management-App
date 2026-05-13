/**
 * StatsGrid.tsx: Το πλέγμα των κύριων στατιστικών (Cards).
 * Εμφανίζει τα σύνολα, το ποσοστό πληρωμών και τις εγγυήσεις που λήγουν σύντομα.
 */
import React from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { UI_LIMITS } from '../../core/config';

interface StatsGridProps {
  stats: any;
  settings: any;
  onNavigate: (type: string, status?: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, settings, onNavigate }) => {
  const getStatusLabel = (status: string) => {
    return settings?.statusConfigs?.[status]?.label || status;
  };

  const getStatusColor = (status: string) => {
    return settings?.statusConfigs?.[status]?.color || '#64748b';
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {(settings.dashboardConfig?.globalStats || ['TOTAL', 'PAID']).map(statId => {
        if (statId === 'TOTAL') {
          return (
            <motion.button 
              variants={itemVariants}
              key="TOTAL"
              onClick={() => onNavigate('all')}
              className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm text-left hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity size={16} />
                </div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΣΥΝΟΛΙΚΕΣ</span>
              </div>
              <div className="text-4xl font-black text-zinc-900 tracking-tighter">{stats.total}</div>
            </motion.button>
          );
        }
        if (statId === 'PAID') {
          return (
            <motion.button 
              variants={itemVariants}
              key="PAID"
              onClick={() => onNavigate('paid')}
              className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm text-left hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp size={16} />
                </div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΠΛΗΡΩΜΕΣ</span>
              </div>
              <div className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.paidPercent}%</div>
            </motion.button>
          );
        }
        if (statId === 'EXPIRING') {
          return (
            <motion.button 
              variants={itemVariants}
              key="EXPIRING"
              onClick={() => onNavigate('expiryTracker' as any)}
              className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm text-left hover:border-rose-200 hover:shadow-xl hover:shadow-rose-50/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle size={16} />
                </div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΛΗΓΟΥΝ ΣΥΝΤΟΜΑ</span>
              </div>
              <div className="text-4xl font-black text-rose-600 tracking-tighter">{stats.expiringCount}</div>
            </motion.button>
          );
        }
        return null;
      })}
      
      {(settings.dashboardConfig?.featuredStatuses || []).slice(0, UI_LIMITS.DASHBOARD_FEATURED_STATUSES).map(statusKey => {
        const count = stats.counts[statusKey] || 0;
        const label = getStatusLabel(statusKey);
        const color = getStatusColor(statusKey);
        
        return (
          <motion.button 
            variants={itemVariants}
            key={statusKey}
            onClick={() => onNavigate('all', statusKey)}
            className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm text-left hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">{label}</div>
            <div className="text-4xl font-black tracking-tighter" style={{ color }}>{count}</div>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
