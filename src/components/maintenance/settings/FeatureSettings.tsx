import React, { memo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Save, MessageCircle, ToggleLeft, ToggleRight } from 'lucide-react';

interface FeatureSettingsProps {
  localChatEnabled: boolean;
  isDirty: boolean;
  onUpdateChatStatus: (enabled: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const FeatureSettings: React.FC<FeatureSettingsProps> = memo(({
  localChatEnabled,
  isDirty,
  onUpdateChatStatus,
  onSave,
  onCancel
}) => {
  return (
    <Card 
      title="ΔΥΝΑΤΟΤΗΤΕΣ ΣΥΣΤΗΜΑΤΟΣ" 
      subtitle="ΕΝΕΡΓΟΠΟΙΗΣΗ / ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ ΕΠΙΠΛΕΟΝ ΛΕΙΤΟΥΡΓΙΩΝ"
      actions={
        isDirty && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>ΑΚΥΡΩΣΗ</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={onSave}>ΑΠΟΘΗΚΕΥΣΗ</Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all hover:border-blue-200">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${localChatEnabled ? 'bg-blue-100 text-blue-600' : 'bg-zinc-200 text-zinc-500'}`}>
              <MessageCircle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight">Ομαδική Συνομιλία (Live Chat)</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                {localChatEnabled ? 'Η λειτουργία chat είναι ενεργή για όλους τους χρήστες' : 'Το chat είναι πλήρως απενεργοποιημένο'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => onUpdateChatStatus(!localChatEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[11px] uppercase transition-all ${
              localChatEnabled 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700' 
                : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
            }`}
          >
            {localChatEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{localChatEnabled ? 'ΕΝΕΡΓΟ' : 'ΑΠΕΝΕΡΓΟ'}</span>
          </button>
        </div>
      </div>
    </Card>
  );
});
