import React, { useState, memo } from 'react';
import { UserRole, StatusConfig } from '../../../core/types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ArrowUp, ArrowDown, RotateCcw, Trash2, Plus, Save } from 'lucide-react';
import { toast } from '../../../utils/toast';
import { FirestoreService } from '../../../services/firebase/db';

interface StatusSettingsProps {
  localStatuses: Record<string, StatusConfig>;
  localStatusOrder: string[];
  availableRoles: UserRole[];
  isDirty: boolean;
  onUpdateStatus: (statusKey: string, field: keyof StatusConfig, value: any) => void;
  onToggleStatusRole: (statusKey: string, role: UserRole) => void;
  onAddStatus: (key: string) => void;
  onDeleteStatus: (key: string) => void;
  onMoveStatus: (statusKey: string, direction: 'up' | 'down') => void;
  onSave: () => void;
  onCancel: () => void;
  settings: any; // Original settings for migration mapping
}

export const StatusSettings: React.FC<StatusSettingsProps> = memo(({
  localStatuses,
  localStatusOrder,
  availableRoles,
  isDirty,
  onUpdateStatus,
  onToggleStatusRole,
  onAddStatus,
  onDeleteStatus,
  onMoveStatus,
  onSave,
  onCancel,
  settings
}) => {
  const [newStatusKey, setNewStatusKey] = useState('');
  const [confirmingDeleteKey, setConfirmingDeleteKey] = useState<string | null>(null);
  const [isMigratingStatuses, setIsMigratingStatuses] = useState(false);
  const [migrationCount, setMigrationCount] = useState(0);

  const handleAddStatus = () => {
    if (!newStatusKey) return;
    onAddStatus(newStatusKey);
    setNewStatusKey('');
  };

  const handleDeleteStatus = (key: string) => {
    if (confirmingDeleteKey !== key) {
      setConfirmingDeleteKey(key);
      setTimeout(() => setConfirmingDeleteKey(null), 3000);
      return;
    }
    onDeleteStatus(key);
    setConfirmingDeleteKey(null);
  };

  const handleMigrateStatuses = async () => {
    setIsMigratingStatuses(true);
    setMigrationCount(0);
    try {
      const mapping: Record<string, string> = {};
      Object.entries(settings.statusConfigs || {}).forEach(([key, conf]) => {
        mapping[(conf as any).label] = key;
      });
      await FirestoreService.migrateStatuses(mapping, (c) => setMigrationCount(c));
      toast.success("ΟΛΟΚΛΗΡΩΘΗΚΕ!");
    } catch (e) {
      toast.error("ΣΦΑΛΜΑ");
    } finally {
      setIsMigratingStatuses(false);
    }
  };

  return (
    <Card 
      title="WORKFLOW & STATUS EDITOR" 
      subtitle="ΔΙΑΧΕΙΡΙΣΗ ΤΩΝ ΣΤΑΔΙΩΝ ΤΗΣ ΕΓΓΥΗΣΗΣ"
      actions={
        <div className="flex items-center gap-2">
          {isDirty && (
            <>
              <Button variant="secondary" size="sm" onClick={onCancel}>ΑΚΥΡΩΣΗ</Button>
              <Button variant="primary" size="sm" icon={Save} onClick={onSave}>ΑΠΟΘΗΚΕΥΣΗ</Button>
            </>
          )}
          <Button 
            variant="secondary" 
            size="sm" 
            icon={RotateCcw}
            onClick={handleMigrateStatuses}
            loading={isMigratingStatuses}
          >
            {isMigratingStatuses ? `ΣΥΓΧΡΟΝΙΣΜΟΣ (${migrationCount})...` : 'ΔΙΟΡΘΩΣΗ ΠΑΛΙΩΝ STATUS'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
          <input 
            type="text" 
            placeholder="ΝΕΟ ΚΛΕΙΔΙ (Π.Χ. WAITING_PARTS)..." 
            value={newStatusKey}
            onChange={e => setNewStatusKey(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-sm"
          />
          <Button onClick={handleAddStatus} icon={Plus} size="sm">ΠΡΟΣΘΗΚΗ</Button>
        </div>

        <div className="space-y-3">
          {localStatusOrder.map((key, idx, arr) => {
            const config = localStatuses[key];
            if (!config) return null;
            return (
              <div key={key} className="flex items-center gap-4 p-4 bg-white border border-zinc-100 rounded-xl hover:border-zinc-200 transition-all group">
                <div className="flex flex-col gap-1">
                  <button onClick={() => onMoveStatus(key, 'up')} disabled={idx === 0} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowUp size={14} /></button>
                  <button onClick={() => onMoveStatus(key, 'down')} disabled={idx === arr.length - 1} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowDown size={14} /></button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">ΚΛΕΙΔΙ: {key}</div>
                    <input type="text" value={config.label} onChange={(e) => onUpdateStatus(key, 'label', e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg text-sm font-bold outline-none focus:bg-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">ΧΡΩΜΑ</div>
                    <div className="flex items-center gap-2">
                      <input type="color" value={config.color} onChange={(e) => onUpdateStatus(key, 'color', e.target.value)} className="w-8 h-8 rounded-lg border-0 cursor-pointer" />
                      <span className="text-xs font-mono text-zinc-500">{config.color}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">ΠΡΟΣΒΑΣΗ ΡΟΛΩΝ</div>
                    <div className="flex flex-wrap gap-1">
                      {availableRoles.map(role => (
                        <button 
                          key={role} 
                          onClick={() => onToggleStatusRole(key, role)} 
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${config.allowedRoles?.includes(role) ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="danger" 
                  size="sm" 
                  icon={Trash2}
                  onClick={() => handleDeleteStatus(key)}
                >
                  {confirmingDeleteKey === key ? 'ΕΠΙΒΕΒΑΙΩΣΗ' : ''}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
});
