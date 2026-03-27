
import React from 'react';
import { UserProfile, UserRole, GarageSettings } from '../../core/types';
import { FirestoreService } from '../../services/firebase/db';

import { useStore } from '../../store/useStore';
import { ONBOARDING_DEFAULTS } from '../../core/config';

/**
 * UserTable: Πίνακας διαχείρισης χρηστών (Μόνο για Admin).
 * Επιτρέπει την αλλαγή ρόλων και τη διαγραφή λογαριασμών από τη βάση.
 */
export const UserTable: React.FC = () => {
  const users = useStore(s => s.users);
  const settings = useStore(s => s.settings);
  const [confirmingDeleteUid, setConfirmingDeleteUid] = React.useState<string | null>(null);
  const availableRoles = settings.availableRoles || ONBOARDING_DEFAULTS.DEFAULT_ROLES;

  const handleDelete = async (uid: string) => {
    if (confirmingDeleteUid !== uid) {
      setConfirmingDeleteUid(uid);
      setTimeout(() => setConfirmingDeleteUid(null), 3000);
      return;
    }
    
    await FirestoreService.deleteUserProfile(uid);
    setConfirmingDeleteUid(null);
  };

  return (
    <div className="p-12 max-w-6xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-10">ΧΡΗΣΤΕΣ & ΠΡΟΣΒΑΣΗ</h2>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ρόλος</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ενέργειες</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.uid} className={`hover:bg-slate-50/50 transition-colors ${u.disabled ? 'opacity-50' : ''}`}>
                <td className="px-8 py-6 font-bold text-slate-800">
                  <div className="flex items-center gap-3">
                    {u.email}
                    {u.disabled && (
                      <span className="bg-red-100 text-red-600 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">DISABLED</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  {/* Dropdown για αλλαγή ρόλου σε πραγματικό χρόνο */}
                  <select 
                    value={u.role} 
                    onChange={(e) => FirestoreService.updateUserProfile(u.uid, { role: e.target.value as UserRole })} 
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-8 py-6 text-right flex justify-end gap-3">
                  <button 
                    onClick={() => FirestoreService.updateUserProfile(u.uid, { disabled: !u.disabled })} 
                    className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      u.disabled 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                    }`}
                  >
                    {u.disabled ? 'ΕΝΕΡΓΟΠΟΙΗΣΗ' : 'ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ'}
                  </button>

                  <button 
                    onClick={() => handleDelete(u.uid)} 
                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      confirmingDeleteUid === u.uid 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                        : 'text-slate-300 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {confirmingDeleteUid === u.uid ? 'ΕΠΙΒΕΒΑΙΩΣΗ;' : 'ΔΙΑΓΡΑΦΗ'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
