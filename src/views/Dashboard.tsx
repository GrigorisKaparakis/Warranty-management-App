import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FirestoreService, auth } from '../services/firebase/db';
import { EntryStatus, UI_LIMITS, UI_MESSAGES } from '../core/config';
import { useAppState } from '../hooks/useAppState';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { getActionColor } from '../utils/auditUtils';
import { AiService } from '../services/AiService';
import { 
  Send, 
  Activity, 
  BarChart3, 
  PieChart, 
  Database, 
  Clock, 
  CreditCard, 
  CheckCircle,
  Sparkles
} from 'lucide-react';

/**
 * DashboardView: Η κεντρική σελίδα επισκόπησης.
 * Σχεδιασμένη με Sapphire Dark Theme για μέγιστη αντίθεση και αισθητική.
 */
export const DashboardView: React.FC = () => {
  const { stats, navigateWithFilters, canBroadcast, canSeeAudit } = useAppState();
  const auditLogs = useStore(s => s?.auditLogs) || [];
  const settings = useStore(s => s?.settings);
  const [broadcastText, setBroadcastText] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Fetch AI Insight on load or stats change
  useEffect(() => {
    const fetchInsight = async () => {
      const insight = await AiService.generateStatsSummary(stats);
      setAiInsight(insight);
    };
    fetchInsight();
  }, [stats]);

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

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <PageHeader 
          title={UI_MESSAGES.DASHBOARD.TITLE} 
          subtitle="ΣΥΝΟΛΙΚΗ ΕΠΙΣΚΟΠΗΣΗ ΣΥΣΤΗΜΑΤΟΣ" 
        />
        {aiInsight && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 max-w-2xl px-4"
          >
            <div className="glass-dark p-6 rounded-[2rem] border-blue-500/20 bg-blue-500/5 flex items-start gap-4">
              <Sparkles className="text-blue-400 shrink-0 mt-1" size={18} />
              <p className="text-[11px] font-bold text-blue-100 uppercase leading-relaxed tracking-wider">
                {aiInsight}
              </p>
            </div>
          </motion.div>
        )}
      </header>
      
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'ΣΥΝΟΛΟ ΕΓΓΡΑΦΩΝ', value: stats.total, icon: Database, color: 'blue', onClick: () => navigateWithFilters('all') },
          { label: 'ΣΕ ΕΚΚΡΕΜΟΤΗΤΑ', value: stats.counts?.PENDING || 0, icon: Clock, color: 'amber', onClick: () => navigateWithFilters('all', 'PENDING') },
          { label: 'ΠΡΟΣ ΠΛΗΡΩΜΗ', value: stats.counts?.UNPAID || 0, icon: CreditCard, color: 'rose', onClick: () => navigateWithFilters('all', 'UNPAID') },
          { label: 'ΕΞΟΦΛΗΜΕΝΑ', value: stats.counts?.PAID || 0, icon: CheckCircle, color: 'emerald', onClick: () => navigateWithFilters('all', 'PAID') }
        ].map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={item.onClick}
            className="premium-card p-8 cursor-pointer flex flex-col justify-between min-h-[200px] group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon className={`text-${item.color}-400`} size={24} />
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{item.label}</div>
              <div className="text-4xl font-black text-white tracking-tighter tabular-nums">{item.value}</div>
            </div>
            
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${item.color}-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      {canBroadcast && (
        <motion.form 
          onSubmit={handleBroadcast} 
          className="flex gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/10 shadow-sm max-w-md w-full"
        >
          <input 
            type="text" 
            placeholder="WORKSHOP BROADCAST..." 
            value={broadcastText}
            onChange={e => setBroadcastText(e.target.value)}
            className="flex-1 px-4 py-2 text-xs font-bold outline-none bg-transparent text-white placeholder:text-zinc-600"
          />
          <Button size="sm" icon={Send} type="submit">
            ΑΠΟΣΤΟΛΗ
          </Button>
        </motion.form>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <Card title="ΚΑΤΑΝΟΜΗ ΚΑΤΑΣΤΑΣΗΣ" icon={PieChart}>
          <div className="space-y-5">
            {(settings?.dashboardConfig?.distributionStatuses || settings?.statusOrder || Object.keys(settings?.statusConfigs || {})).map(s => {
              if (!settings?.statusConfigs?.[s]) return null;
              const count = stats.counts[s] || 0;
              const p = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <button 
                  key={s} 
                  onClick={() => navigateWithFilters('all', s)}
                  className="w-full text-left space-y-2 group"
                >
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
                    <span>{getStatusLabel(s)}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
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
              const visibleCompanies = settings?.dashboardConfig?.visibleCompanies || [];
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
                    onClick={() => navigateWithFilters('all', 'ALL', name)}
                    className="w-full text-left space-y-2 group"
                  >
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
                      <span>{name}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${p}%` }} 
                      />
                    </div>
                  </button>
                );
              });
            })()}
            {stats.companyStats.length === 0 && (
              <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">ΔΕΝ ΥΠΑΡΧΟΥΝ ΔΕΔΟΜΕΝΑ</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity - Full Width */}
      {settings?.dashboardConfig?.showAuditLog !== false && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card title="ΠΡΟΣΦΑΤΗ ΔΡΑΣΤΗΡΙΟΤΗΤΑ" icon={Activity}>
            <div className="space-y-4">
              {canSeeAudit ? (
                <>
                  {auditLogs.slice(0, settings?.limits?.dashboardAuditLogs || UI_LIMITS.DASHBOARD_AUDIT_LOGS).map(log => (
                    <div key={log.id} className="flex gap-6 items-start p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all flex items-center group">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 bg-${getActionColor(log.action)}-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="text-[10px] font-black text-white uppercase opacity-80">
                            {log.userEmail.split('@')[0]}
                          </div>
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">•</span>
                          <div className="text-[10px] font-black text-blue-400 uppercase tracking-wider">
                            {log.targetWarrantyId}
                          </div>
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">•</span>
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {new Date(log.timestamp).toLocaleString('el-GR')}
                          </div>
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed italic whitespace-pre-wrap group-hover:text-slate-100 transition-colors">
                          {log.details.split(' | ').map((detail, i) => (
                            <div key={i} className="py-0.5">• {detail}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="p-16 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                      <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">ΚΑΜΙΑ ΚΙΝΗΣΗ ΑΚΟΜΑ ΣΤΟ ΣΥΣΤΗΜΑ</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-16 text-center bg-white/5 rounded-[2.5rem] border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase italic tracking-widest">ΠΕΡΙΟΡΙΣΜΕΝΗ ΠΡΟΣΒΑΣΗ ΣΤΟ ΙΣΤΟΡΙΚΟ</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
