import React, { memo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Layout, Zap, Save } from 'lucide-react';

interface BrandingSettingsProps {
  localBranding: { appName: string; logoText: string };
  isDirty: boolean;
  onUpdateBranding: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const BrandingSettings: React.FC<BrandingSettingsProps> = memo(({
  localBranding,
  isDirty,
  onUpdateBranding,
  onSave,
  onCancel
}) => {
  return (
    <Card 
      title="VISUAL IDENTITY MODULE" 
      subtitle="SYSTEM BRANDING & LABEL ARCHITECTURE"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Layout size={18} className="text-blue-500" />
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">INSTANCE IDENTIFIER</h4>
          </div>
          <input 
            type="text" 
            placeholder="APP NAME..."
            value={localBranding?.appName || ''} 
            onChange={e => onUpdateBranding('appName', e.target.value)} 
            className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl font-black text-sm text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-800" 
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-blue-500" />
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">CORE SIGNATURE (LOGO)</h4>
          </div>
          <input 
            type="text" 
            placeholder="LOGO TEXT..."
            value={localBranding?.logoText || ''} 
            onChange={e => onUpdateBranding('logoText', e.target.value)} 
            className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl font-black text-sm text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-800" 
          />
        </div>
      </div>
    </Card>
  );
});
