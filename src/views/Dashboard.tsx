import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FirestoreService, auth } from '../services/firebase/db';
import { EntryStatus, UI_LIMITS } from '../core/config';
import { useAppState } from '../hooks/useAppState';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { getActionColor } from '../utils/auditUtils';
import { Send, Activity, BarChart3, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

/**
 * DashboardView: Η κεντρική σελίδα επισκόπησης. Εμφανίζει στατιστικά,
 * κατανομή εγγυήσεων και πρόσφατη δραστηριότητα.
 */
export const DashboardView: React.FC = () => {
  const { stats, navigateWithFilters: onNavigate, canBroadcast, canSeeAudit } = useAppState();
  const auditLogs = useStore(s => s?.auditLogs);
  const settings = useStore(s => s?.settings);
  const [broadcastText, setBroadcastText] = useState('');

  const getStatusLabel = (status: string) => {
    return settings?.statusConfigs?.[status]?.label || status;
  };

  const getStatusColor = (status: string) => {
    return settings?.statusConfigs?.[status]?.color || '#64748b';
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    await FirestoreService.addNotice({
      text: broadcastText.trim(),
      authorEmail: auth.currentUser?.email || 'Unknown',
      createdAt: Date.now()
    });
    setBroadcastText('');
  };

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

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-10 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader title="DASHBOARD" subtitle="ΣΤΑΤΙΣΤΙΚΑ & ΕΠΟΠΤΕΙΑ ΣΥΣΤΗΜΑΤΟΣ" />
        
        {canBroadcast && (
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleBroadcast} 
            className="flex gap-2 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm max-w-md w-full"
          >
            <input 
              type="text" 
              placeholder="WORKSHOP BROADCAST..." 
              value={broadcastText}
              onChange={e => setBroadcastText(e.target.value)}
              className="flex-1 px-4 py-2 text-xs font-bold outline-none placeholder:text-zinc-300"
            />
            <Button size="sm" icon={Send} type="submit">
              ΑΠΟΣΤΟΛΗ
            </Button>
          </motion.form>
        )}
      </div>
      
      {/* Global Stats Grid */}
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
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
         {/* Distribution Chart */}
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
                    <div 
                      className="h-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${p}%`,
                        backgroundColor: getStatusColor(s)
                      }} 
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Top Companies */}
        <Card title="TOP ΕΤΑΙΡΕΙΕΣ" icon={BarChart3}>
          <div className="space-y-5">
            {(() => {
              const visibleCompanies = settings.dashboardConfig?.visibleCompanies || [];
              let companiesToDisplay: [string, number][] = [];
              
              if (visibleCompanies.length > 0) {
                companiesToDisplay = visibleCompanies.map(name => {
                  const stat = stats.companyStats.find(([n]) => n === name);
                  return [name, stat ? stat[1] : 0] as [string, number];
                });
              } else {
                companiesToDisplay = stats.companyStats.slice(0, UI_LIMITS.DASHBOARD_TOP_COMPANIES);
              }

              return companiesToDisplay.map(([name, count]: [string, number]) => {
                const p = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <button 
                    key={name} 
                    onClick={() => onNavigate('all', 'ALL', name)}
                    className="w-full text-left space-y-2 group"
                  >
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900 transition-colors">
                      <span>{name}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                      <div 
                        className="h-full bg-zinc-900 transition-all duration-1000 ease-out" 
                        style={{ width: `${p}%` }} 
                      />
                    </div>
                  </button>
                );
              });
            })()}
            {stats.companyStats.length === 0 && (
              <div className="p-10 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                <p className="text-[10px] font-black text-zinc-300 uppercase italic tracking-widest">ΔΕΝ ΥΠΑΡΧΟΥΝ ΔΕΔΟΜΕΝΑ</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity - Full Width */}
      {settings.dashboardConfig?.showAuditLog !== false && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card title="ΠΡΟΣΦΑΤΗ ΔΡΑΣΤΗΡΙΟΤΗΤΑ" icon={Activity}>
            <div className="space-y-4">
              {canSeeAudit ? (
                <>
                  {auditLogs.slice(0, settings.limits?.dashboardAuditLogs || UI_LIMITS.DASHBOARD_AUDIT_LOGS).map(log => (
                    <div key={log.id} className="flex gap-6 items-start p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 bg-${getActionColor(log.action)}-500 shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="text-[10px] font-black text-zinc-900 uppercase">
                            {log.userEmail.split('@')[0]}
                          </div>
                          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">•</span>
                          <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                            {log.targetWarrantyId}
                          </div>
                          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">•</span>
                          <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            {new Date(log.timestamp).toLocaleString('el-GR')}
                          </div>
                        </div>
                        <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter leading-relaxed italic whitespace-pre-wrap">
                          {log.details.split(' | ').map((detail, i) => (
                            <div key={i} className="py-0.5">• {detail}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="p-16 text-center border-2 border-dashed border-zinc-100 rounded-[2.5rem]">
                      <p className="text-[10px] font-black text-zinc-300 uppercase italic tracking-widest">ΚΑΜΙΑ ΚΙΝΗΣΗ ΑΚΟΜΑ ΣΤΟ ΣΥΣΤΗΜΑ</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-16 text-center bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                  <p className="text-[10px] font-bold text-zinc-300 uppercase italic tracking-widest">ΠΕΡΙΟΡΙΣΜΕΝΗ ΠΡΟΣΒΑΣΗ ΣΤΟ ΙΣΤΟΡΙΚΟ</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
