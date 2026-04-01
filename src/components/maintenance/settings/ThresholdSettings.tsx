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
      title="EXPIRY THRESHOLD CALIBRATION" 
      subtitle="DEFINE TEMPORAL LOGIC FOR NOTIFICATION DISPATCH (DAYS)"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {thresholdsConfig.map((t) => (
          <div key={t.key} className="p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 space-y-4 hover:border-blue-500/20 transition-all group/threshold shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover/threshold:bg-blue-600/10 transition-all"></div>
            
            <div className="flex items-center gap-3 text-slate-500 group-hover/threshold:text-blue-400 transition-colors">
              <t.icon size={16} />
              <label className="text-[10px] font-black uppercase tracking-[0.2em] italic">{t.label}</label>
            </div>
            <input 
              type="number" 
              value={(localThresholds as any)?.[t.key] ?? 0} 
              onChange={e => onUpdateThresholds(t.key, parseInt(e.target.value) || 0)}
              className="w-full px-5 py-3 bg-slate-950 border border-white/5 rounded-xl font-black text-sm text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all shadow-inner"
            />
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${t.key === 'criticalDays' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : t.key === 'warningDays' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}></div>
              <p className={`text-[9px] font-black uppercase tracking-widest italic ${t.key === 'criticalDays' ? 'text-red-500/70' : t.key === 'warningDays' ? 'text-amber-500/70' : 'text-blue-500/70'}`}>
                PROTOCOL: {t.label} 
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});
