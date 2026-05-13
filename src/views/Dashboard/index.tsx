/**
 * DashboardView: Η κεντρική σελίδα επισκόπησης της εφαρμογής.
 * Συντονίζει τα επιμέρους στατιστικά στοιχεία, τα γραφήματα και τη λειτουργία των ανακοινώσεων (Broadcast).
 */
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FirestoreService, auth } from '../../services/firebase/db';
import { useAppState } from '../../hooks/core/useAppState';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Send } from 'lucide-react';

// Sub-components
import { StatsGrid } from './StatsGrid';
import { DistributionChart } from './DistributionChart';
import { BrandAnalytics } from './BrandAnalytics';
import { TrendChart } from './TrendChart';
import { AuditActivityCard } from './AuditActivityCard';

export const DashboardView: React.FC = () => {
  const { stats, navigateWithFilters: onNavigate, canBroadcast, canSeeAudit } = useAppState();
  const auditLogs = useStore(s => s?.auditLogs);
  const settings = useStore(s => s?.settings);
  const [broadcastText, setBroadcastText] = useState('');

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
      
      <StatsGrid 
        stats={stats} 
        settings={settings} 
        onNavigate={onNavigate} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        <div className="lg:col-span-4">
          <DistributionChart 
            stats={stats} 
            settings={settings} 
            onNavigate={onNavigate} 
          />
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <BrandAnalytics stats={stats} />
          <TrendChart stats={stats} />
        </div>
      </motion.div>

      <AuditActivityCard 
        canSeeAudit={canSeeAudit} 
        auditLogs={auditLogs} 
        settings={settings} 
      />
    </div>
  );
};

