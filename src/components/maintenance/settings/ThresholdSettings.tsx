import React, { memo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Clock, Save } from 'lucide-react';

interface ThresholdSettingsProps {
  localThresholds: { warningDays: number; criticalDays: number; soonDays: number };
  isDirty: boolean;
  onUpdateThresholds: (key: 'warningDays' | 'criticalDays' | 'soonDays', value: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ThresholdSettings: React.FC<ThresholdSettingsProps> = memo(({
  localThresholds,
  isDirty,
  onUpdateThresholds,
  onSave,
  onCancel
}) => {
  const thresholdsConfig: { label: string; key: 'warningDays' | 'criticalDays' | 'soonDays'; color: string; icon: any }[] = [
    { label: 'ΚΡΙΣΙΜΗ ΛΗΞΗ', key: 'criticalDays', color: 'text-red-500', icon: Clock },
    { label: 'ΠΡΟΕΙΔΟΠΟΙΗΣΗ', key: 'warningDays', color: 'text-amber-500', icon: Clock },
    { label: 'ΣΥΝΤΟΜΑ', key: 'soonDays', color: 'text-blue-500', icon: Clock },
  ];

  return (
    <Card 
      title="ΠΑΡΑΜΕΤΡΟΠΟΙΗΣΗ ΛΗΞΕΩΝ" 
      subtitle="ΟΡΙΣΤΕ ΤΑ ΧΡΟΝΙΚΑ ΟΡΙΑ ΕΙΔΟΠΟΙΗΣΕΩΝ (ΣΕ ΗΜΕΡΕΣ)"
      actions={
        isDirty && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>ΑΚΥΡΩΣΗ</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={onSave}>ΑΠΟΘΗΚΕΥΣΗ</Button>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {thresholdsConfig.map((t) => (
          <div key={t.key} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <t.icon size={14} />
              <label className="text-[10px] font-bold uppercase tracking-wider">{t.label}</label>
            </div>
            <input 
              type="number" 
              value={(localThresholds as any)?.[t.key] ?? 0} 
              onChange={e => onUpdateThresholds(t.key, parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg font-bold text-sm outline-none"
            />
            <p className={`text-[9px] font-bold uppercase ${t.color}`}>ΕΝΔΕΙΞΗ {t.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
});
