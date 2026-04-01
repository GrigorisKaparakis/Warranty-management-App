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
      title="WORKFLOW ARCHITECT" 
      subtitle="CONFIGURE SYSTEM STATUS STATES & CLEARANCE"
      actions={
        <div className="flex items-center gap-4">
          {isDirty && (
            <>
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
            </>
          )}
          <button 
            onClick={handleMigrateStatuses}
            disabled={isMigratingStatuses}
            className="h-10 px-6 rounded-xl bg-slate-900 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all border border-white/5 flex items-center gap-2 italic disabled:opacity-50"
          >
            {isMigratingStatuses ? (
              <>
                <RotateCcw size={14} className="animate-spin" />
                SYNCING ({migrationCount})...
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                LEGACY SYNC
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-8 pt-4">
        <div className="flex gap-4 p-6 bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-inner group">
          <input 
            type="text" 
            placeholder="NEW STATUS KEY (E.G. WAITING_PARTS)..." 
            value={newStatusKey}
            onChange={e => setNewStatusKey(e.target.value)}
            className="flex-1 px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl font-black text-sm text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-800"
          />
          <button 
            onClick={handleAddStatus}
            className="px-8 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-2xl shadow-blue-900/40 italic"
          >
            <Plus size={18} />
            REGISTER
          </button>
        </div>

        <div className="space-y-4">
          {localStatusOrder.map((key, idx, arr) => {
            const config = localStatuses[key];
            if (!config) return null;
            return (
              <div key={key} className="flex items-center gap-6 p-6 glass-dark border border-white/5 rounded-[2.5rem] hover:border-blue-500/30 transition-all group/status relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover/status:bg-blue-600/10 transition-all"></div>
                
                <div className="flex flex-col gap-2 relative z-10">
                  <button onClick={() => onMoveStatus(key, 'up')} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-slate-600 hover:text-white disabled:opacity-10 transition-all"><ArrowUp size={16} /></button>
                  <button onClick={() => onMoveStatus(key, 'down')} disabled={idx === arr.length - 1} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-slate-600 hover:text-white disabled:opacity-10 transition-all"><ArrowDown size={16} /></button>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">ID: {key}</div>
                    <input type="text" value={config.label} onChange={(e) => onUpdateStatus(key, 'label', e.target.value)} className="w-full bg-slate-950 border border-white/5 px-5 py-3 rounded-xl text-sm font-black text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">COLOR HEX</div>
                    <div className="flex items-center gap-4 bg-slate-950 border border-white/5 p-2 rounded-xl">
                      <div className="relative">
                        <input type="color" value={config.color} onChange={(e) => onUpdateStatus(key, 'color', e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer overflow-hidden p-0 bg-transparent block" />
                      </div>
                      <span className="text-[11px] font-black font-mono text-blue-400 tracking-widest">{config.color.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">SECURITY CLEARANCE</div>
                    <div className="flex flex-wrap gap-2">
                      {availableRoles.map(role => (
                        <button 
                          key={role} 
                          onClick={() => onToggleStatusRole(key, role)} 
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${config.allowedRoles?.includes(role) ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-slate-900 border-white/5 text-slate-600 hover:text-slate-400'}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteStatus(key)}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all relative z-10 border ${confirmingDeleteKey === key ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-white/5 border-white/5 text-slate-700 hover:text-red-500 hover:bg-red-500/10'}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
});
