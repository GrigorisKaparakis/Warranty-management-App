import React, { useState, memo } from 'react';
import { MenuItem } from '../../../core/types';
import { ICONS, DEFAULT_MENU } from '../../../core/config';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ArrowUp, ArrowDown, RotateCcw, Trash2, Plus, Save } from 'lucide-react';

interface MenuSettingsProps {
  localMenu: MenuItem[];
  localStatuses: Record<string, any>;
  isDirty: boolean;
  onUpdateMenuItem: (itemId: string, field: string, value: any) => void;
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onMoveMenu: (itemId: string, direction: 'up' | 'down') => void;
  onResetMenu: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const MenuSettings: React.FC<MenuSettingsProps> = memo(({
  localMenu,
  localStatuses,
  isDirty,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
  onMoveMenu,
  onResetMenu,
  onSave,
  onCancel
}) => {
  const [newMenuItem, setNewMenuItem] = useState<Omit<MenuItem, 'roles'>>({ 
    id: '', 
    label: '', 
    icon: ICONS.dashboard, 
    category: 'main' 
  });
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const handleAddMenuItem = () => {
    if (!newMenuItem.id || !newMenuItem.label) return;
    onAddMenuItem({ ...newMenuItem, roles: ['ADMIN'] } as MenuItem);
    setNewMenuItem({ id: '', label: '', icon: ICONS.dashboard, category: 'main' });
  };

  const handleResetMenu = () => {
    if (!isConfirmingReset) {
      setIsConfirmingReset(true);
      setTimeout(() => setIsConfirmingReset(false), 3000);
      return;
    }
    onResetMenu();
    setIsConfirmingReset(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-32">
      <Card 
        title="INTERFACE ARCHITECT" 
        subtitle="CONFIGURE NAVIGATION & SYSTEM VIEWS"
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
        <div className="space-y-10 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">VIEW TEMPLATE SELECTION</label>
              </div>
              <select 
                onChange={e => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val.startsWith('STATUS_')) {
                    const statusKey = val.replace('STATUS_', '');
                    const config = localStatuses[statusKey];
                    setNewMenuItem({
                      id: `warranty/view/${statusKey}`,
                      label: config?.label || statusKey,
                      icon: ICONS.all,
                      category: 'views'
                    });
                  } else {
                    const template = (DEFAULT_MENU as MenuItem[]).find(m => m.id === val);
                    if (template) {
                      setNewMenuItem({
                        id: template.id,
                        label: template.label,
                        icon: template.icon,
                        category: template.category || (['dashboard', 'entry', 'all'].includes(template.id) ? 'main' : 'views')
                      });
                    }
                  }
                }}
                className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl font-black text-[12px] text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-950">SELECT TEMPLATE ACCESSOR...</option>
                <optgroup label="CORE SYSTEM MODULES" className="bg-slate-950 text-slate-500">
                  {(DEFAULT_MENU as MenuItem[]).map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-950 text-white">{m.label}</option>
                  ))}
                </optgroup>
                <optgroup label="DYNAMIC STATUS PROXIES" className="bg-slate-950 text-slate-500">
                  {Object.entries(localStatuses).map(([key, config]) => (
                    <option key={key} value={`STATUS_${key}`} className="bg-slate-950 text-white">{config.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="flex items-center p-6 bg-blue-600/5 rounded-2xl border border-blue-500/10 shadow-inner">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed italic">
                SELECT A TEMPLATE TO AUTO-POPULATE REGISTRATION FIELDS. ALL PARAMETERS REMAIN MUTABLE POST-LOAD.
              </p>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full shadow-[0_0_15px_rgba(255,255,255,0.02)]" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 italic">ENDPOINT / PATH</label>
              <input 
                type="text" 
                placeholder="E.G. REPORTS"
                value={newMenuItem.id} 
                onChange={e => setNewMenuItem({...newMenuItem, id: e.target.value.trim()})} 
                className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl font-black text-[12px] text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-800" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 italic">INTERFACE LABEL</label>
              <input 
                type="text" 
                placeholder="E.G. ANALYTICS"
                value={newMenuItem.label} 
                onChange={e => setNewMenuItem({...newMenuItem, label: e.target.value})} 
                className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl font-black text-[12px] text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-800" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 italic">ICON SYMBOL</label>
              <select 
                value={newMenuItem.icon} 
                onChange={e => setNewMenuItem({...newMenuItem, icon: e.target.value})} 
                className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl font-black text-[12px] text-blue-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
              >
                {Object.keys(ICONS).map(key => <option key={key} value={ICONS[key]} className="bg-slate-950 text-white">{key}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 italic">LAYER CATEGORY</label>
              <select 
                value={newMenuItem.category} 
                onChange={e => setNewMenuItem({...newMenuItem, category: e.target.value as any})} 
                className="w-full px-6 py-4 bg-slate-950 border border-white/5 rounded-2xl font-black text-[12px] text-blue-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="main" className="bg-slate-950 text-white">MAIN (UPPER)</option>
                <option value="views" className="bg-slate-950 text-white">VIEWS (MIDDLE)</option>
                <option value="admin" className="bg-slate-950 text-white">ADMIN (LOWER)</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleAddMenuItem}
            className="w-full h-16 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 border-none italic"
          >
            <Plus size={20} />
            REGISTER TO INTERFACE STACK
          </button>
        </div>
      </Card>

      <Card 
        title="NAVIGATION HIERARCHY" 
        subtitle="ORCHESTRATE SYSTEM ACCESS FLOWS"
        actions={
          <button 
            onClick={handleResetMenu}
            className={`h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all italic border ${isConfirmingReset ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'}`}
          >
            {isConfirmingReset ? 'CONFIRM FACTORY RESET?' : 'REVERT TO CORE'}
          </button>
        }
        noPadding
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">ORDER</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">ICON</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">LAYER</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">ENDPOINT</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">LABEL</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">COMMAND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {localMenu.map((item, idx) => (
                <tr key={item.id} className="group hover:bg-white/[0.03] transition-all">
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1 items-center bg-slate-950/50 p-1.5 rounded-lg border border-white/5">
                      <button onClick={() => onMoveMenu(item.id, 'up')} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-blue-400 disabled:opacity-10 transition-all"><ArrowUp size={14} /></button>
                      <button onClick={() => onMoveMenu(item.id, 'down')} disabled={idx === localMenu.length - 1} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-blue-400 disabled:opacity-10 transition-all"><ArrowDown size={14} /></button>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={item.icon} 
                      onChange={(e) => onUpdateMenuItem(item.id, 'icon', e.target.value)} 
                      className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black text-blue-400 outline-none cursor-pointer appearance-none uppercase tracking-widest text-center min-w-[100px]"
                    >
                      {Object.keys(ICONS).map(key => <option key={key} value={ICONS[key]} className="bg-slate-950 text-white">{key}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={item.category || 'main'} 
                      onChange={(e) => onUpdateMenuItem(item.id, 'category', e.target.value)} 
                      className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-500 outline-none cursor-pointer appearance-none uppercase tracking-widest text-center min-w-[100px]"
                    >
                      <option value="main" className="bg-slate-950 text-white">MAIN</option>
                      <option value="views" className="bg-slate-950 text-white">VIEWS</option>
                      <option value="admin" className="bg-slate-950 text-white">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-[11px] font-mono text-blue-500/70 tracking-tighter italic">/{item.id}</div>
                  </td>
                  <td className="px-8 py-5">
                    <input 
                      type="text" 
                      value={item.label} 
                      onChange={(e) => onUpdateMenuItem(item.id, 'label', e.target.value)} 
                      className="bg-slate-950 border border-white/5 px-4 py-2.5 rounded-xl text-[12px] font-black text-white w-full outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all italic tracking-tighter" 
                    />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onDeleteMenuItem(item.id)} 
                      className="w-10 h-10 flex items-center justify-center bg-white/[0.03] rounded-xl text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 border border-white/5 mx-auto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
});
