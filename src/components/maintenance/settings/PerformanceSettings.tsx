import React, { memo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Settings2, Layout, Info, Shield, Save } from 'lucide-react';

import { SystemLimits } from '../../../core/types';

interface PerformanceSettingsProps {
  localLimits: SystemLimits;
  isDirty: boolean;
  onUpdateLimits: (key: keyof SystemLimits, value: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const PerformanceSettings: React.FC<PerformanceSettingsProps> = memo(({
  localLimits,
  isDirty,
  onUpdateLimits,
  onSave,
  onCancel
}) => {
  const limitsConfig: { label: string; key: keyof SystemLimits; icon: any; desc: string }[] = [
    { label: 'FETCH LIMIT', key: 'fetchLimit', icon: Settings2, desc: 'ΜΕΓΙΣΤΟΣ ΑΡΙΘΜΟΣ ΕΓΓΥΗΣΕΩΝ' },
    { label: 'INVENTORY PAGE SIZE', key: 'inventoryPageSize', icon: Layout, desc: 'ΕΓΓΡΑΦΕΣ ΑΝΑ ΣΕΛΙΔΑ' },
    { label: 'AI CHAT HISTORY', key: 'aiChatHistoryLimit', icon: Info, desc: 'ΜΗΝΥΜΑΤΑ ΣΤΟ ΙΣΤΟΡΙΚΟ' },
    { label: 'DASHBOARD LOGS', key: 'dashboardAuditLogs', icon: Shield, desc: 'ΠΡΟΣΦΑΤΕΣ ΕΝΕΡΓΕΙΕΣ' },
    { label: 'AUDIT LOG FETCH', key: 'auditLogFetchLimit', icon: Shield, desc: 'ΣΥΝΟΛΙΚΑ LOGS' },
  ];

  return (
    <Card 
      title="PERFORMANCE CALIBRATION" 
      subtitle="OPTIMIZE SYSTEM THROUGHPUT & MEMORY ALLOCATION"
      actions={
        isDirty && (
          <div className="flex items-center gap-4">
            <button 
              onClick={onCancel}
              className="h-10 px-6 rounded-xl bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all border border-black/20 font-mono"
            >
              ABORT
            </button>
            <button 
              onClick={onSave}
              className="h-10 px-6 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] border-none italic"
            >
              COMMIT SYNC
            </button>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {limitsConfig.map((limit) => (
          <div key={limit.key} className="p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 space-y-4 hover:border-blue-500/20 transition-all group/limit shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover/limit:bg-blue-600/10 transition-all"></div>
            
            <div className="flex items-center gap-3 text-slate-500 group-hover/limit:text-blue-400 transition-colors">
              <limit.icon size={16} />
              <label className="text-[10px] font-black uppercase tracking-[0.2em] italic">{limit.label}</label>
            </div>
            <input 
              type="number" 
              value={(localLimits as any)?.[limit.key] || 0} 
              onChange={e => onUpdateLimits(limit.key, parseInt(e.target.value) || 0)}
              className="w-full px-5 py-3 bg-slate-950 border border-white/5 rounded-xl font-black text-sm text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all shadow-inner"
            />
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic leading-relaxed">{limit.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
});
