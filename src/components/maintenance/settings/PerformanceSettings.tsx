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
    { label: 'INVENTORY SEARCH DELAY', key: 'inventorySearchDelay', icon: Info, desc: 'ΚΑΘΥΣΤΕΡΗΣΗ ΑΝΑΖΗΤΗΣΗΣ (ms)' },
    { label: 'PART SUGGESTIONS DELAY', key: 'partSuggestionsDelay', icon: Info, desc: 'ΚΑΘΥΣΤΕΡΗΣΗ ΠΡΟΤΑΣΕΩΝ (ms)' },
    { label: 'DASHBOARD LOGS', key: 'dashboardAuditLogs', icon: Shield, desc: 'ΠΡΟΣΦΑΤΕΣ ΕΝΕΡΓΕΙΕΣ' },
    { label: 'AUDIT LOG FETCH', key: 'auditLogFetchLimit', icon: Shield, desc: 'ΣΥΝΟΛΙΚΑ LOGS' },
  ];

  return (
    <Card 
      title="APP PERFORMANCE LIMITS" 
      subtitle="ΔΙΑΧΕΙΡΙΣΗ ΟΡΙΩΝ ΑΠΟΔΟΣΗΣ"
      actions={
        isDirty && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>ΑΚΥΡΩΣΗ</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={onSave}>ΑΠΟΘΗΚΕΥΣΗ</Button>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {limitsConfig.map((limit) => (
          <div key={limit.key} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <limit.icon size={14} />
              <label className="text-[10px] font-bold uppercase tracking-wider">{limit.label}</label>
            </div>
            <input 
              type="number" 
              value={(localLimits as any)?.[limit.key] || 0} 
              onChange={e => onUpdateLimits(limit.key, parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg font-bold text-sm outline-none"
            />
            <p className="text-[9px] text-zinc-400 italic">{limit.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
});
