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
      title="BRANDING & LABELS" 
      subtitle="ΔΙΑΜΟΡΦΩΣΗ ΤΗΣ ΟΠΤΙΚΗΣ ΤΑΥΤΟΤΗΤΑΣ"
      actions={
        isDirty && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>ΑΚΥΡΩΣΗ</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={onSave}>ΑΠΟΘΗΚΕΥΣΗ</Button>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-900">
            <Layout size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider">ΕΠΩΝΥΜΙΑ ΕΠΙΧΕΙΡΗΣΗΣ</h4>
          </div>
          <input 
            type="text" 
            value={localBranding?.appName || ''} 
            onChange={e => onUpdateBranding('appName', e.target.value)} 
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl font-bold outline-none text-sm focus:bg-white" 
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-900">
            <Zap size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider">LOGO (TEXT)</h4>
          </div>
          <input 
            type="text" 
            value={localBranding?.logoText || ''} 
            onChange={e => onUpdateBranding('logoText', e.target.value)} 
            className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl font-bold outline-none text-sm focus:bg-white" 
          />
        </div>
      </div>
    </Card>
  );
});
