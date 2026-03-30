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
    <div className="space-y-6">
      <Card 
        title="ΠΡΟΣΘΗΚΗ ΝΕΟΥ VIEW" 
        subtitle="ΕΠΙΛΕΞΤΕ ΑΠΟ ΤΑ ΠΡΟΚΑΘΟΡΙΣΜΕΝΑ TEMPLATES Η ΔΗΜΙΟΥΡΓΗΣΤΕ ΔΙΚΟ ΣΑΣ"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">ΠΡΟΤΥΠΟ (TEMPLATE)</label>
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
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
              >
                <option value="">ΕΠΙΛΕΞΤΕ ΠΡΟΤΥΠΟ...</option>
                <optgroup label="ΒΑΣΙΚΕΣ ΣΕΛΙΔΕΣ">
                  {(DEFAULT_MENU as MenuItem[]).map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </optgroup>
                <optgroup label="ΠΡΟΒΟΛΕΣ ΚΑΤΑΣΤΑΣΕΩΝ (STATUS VIEWS)">
                  {Object.entries(localStatuses).map(([key, config]) => (
                    <option key={key} value={`STATUS_${key}`}>{config.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                Επιλέξτε ένα πρότυπο για να συμπληρωθούν αυτόματα τα πεδία. Μπορείτε να τα τροποποιήσετε στη συνέχεια.
              </p>
            </div>
          </div>

          <div className="h-px bg-zinc-100" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">ID / PATH</label>
              <input 
                type="text" 
                placeholder="π.χ. reports"
                value={newMenuItem.id} 
                onChange={e => setNewMenuItem({...newMenuItem, id: e.target.value.trim()})} 
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">ΕΤΙΚΕΤΑ</label>
              <input 
                type="text" 
                placeholder="π.χ. ΑΝΑΦΟΡΕΣ"
                value={newMenuItem.label} 
                onChange={e => setNewMenuItem({...newMenuItem, label: e.target.value})} 
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">ΕΙΚΟΝΙΔΙΟ</label>
              <select 
                value={newMenuItem.icon} 
                onChange={e => setNewMenuItem({...newMenuItem, icon: e.target.value})} 
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all"
              >
                {Object.keys(ICONS).map(key => <option key={key} value={ICONS[key]}>{key}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5 block ml-1">ΚΑΤΗΓΟΡΙΑ</label>
              <select 
                value={newMenuItem.category} 
                onChange={e => setNewMenuItem({...newMenuItem, category: e.target.value as any})} 
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold outline-none text-xs focus:ring-2 focus:ring-zinc-900/5 transition-all"
              >
                <option value="main">MAIN (ΠΑΝΩ)</option>
                <option value="views">VIEWS (ΜΕΣΗ)</option>
                <option value="admin">ADMIN (ΚΑΤΩ)</option>
              </select>
            </div>
          </div>
          <Button onClick={handleAddMenuItem} icon={Plus} className="w-full py-4">ΠΡΟΣΘΗΚΗ ΣΤΟ ΜΕΝΟΥ</Button>
        </div>
      </Card>

      <Card 
        title="EDITOR ΜΕΝΟΥ" 
        subtitle="ΔΙΑΧΕΙΡΙΣΗ ΣΕΙΡΑΣ ΚΑΙ ΡΥΘΜΙΣΕΩΝ ΜΕΝΟΥ"
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant={isConfirmingReset ? "danger" : "secondary"} 
              size="sm" 
              icon={RotateCcw} 
              onClick={handleResetMenu}
            >
              {isConfirmingReset ? 'ΕΠΙΒΕΒΑΙΩΣΗ ΕΠΑΝΑΦΟΡΑΣ;' : 'ΕΠΑΝΑΦΟΡΑ'}
            </Button>
          </div>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΣΕΙΡΑ</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ICON</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CATEGORY</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">LABEL</th>
                <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΕΝΕΡΓΕΙΕΣ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {localMenu.map((item, idx) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => onMoveMenu(item.id, 'up')} disabled={idx === 0} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowUp size={12} /></button>
                      <button onClick={() => onMoveMenu(item.id, 'down')} disabled={idx === localMenu.length - 1} className="text-zinc-400 hover:text-zinc-900 disabled:opacity-20"><ArrowDown size={12} /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select value={item.icon} onChange={(e) => onUpdateMenuItem(item.id, 'icon', e.target.value)} className="bg-transparent border-0 text-xs font-bold outline-none cursor-pointer">
                      {Object.keys(ICONS).map(key => <option key={key} value={ICONS[key]}>{key}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select value={item.category || 'main'} onChange={(e) => onUpdateMenuItem(item.id, 'category', e.target.value)} className="bg-transparent border-0 text-xs font-bold outline-none cursor-pointer">
                      <option value="main">MAIN</option>
                      <option value="views">VIEWS</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-900">{item.id}</td>
                  <td className="px-6 py-4">
                    <input type="text" value={item.label} onChange={(e) => onUpdateMenuItem(item.id, 'label', e.target.value)} className="bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-lg text-xs font-bold w-full outline-none focus:bg-white" />
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onDeleteMenuItem(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
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
