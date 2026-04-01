
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
    <div className="p-12 max-w-7xl mx-auto animate-fade-in pb-32">
      <div className="flex flex-col gap-2 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">ADMINISTRATION PROTOCOL</span>
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">USERS & ACCESS CONTROL</h2>
      </div>

      <div className="glass-dark rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">IDENTITY / EMAIL</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">CLEARANCE LEVEL</th>
              <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic text-right">COMMANDS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => (
              <tr key={u.uid} className={`group hover:bg-white/[0.03] transition-all ${u.disabled ? 'opacity-40 grayscale' : ''}`}>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all">
                       <span className="text-slate-500 font-black text-xs uppercase">{u.email?.[0]}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white tracking-tight text-lg">{u.email}</span>
                      {u.disabled && (
                        <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.2em] mt-1 italic">DEACTIVATED</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <select 
                    value={u.role} 
                    onChange={(e) => FirestoreService.updateUserProfile(u.uid, { role: e.target.value as UserRole })} 
                    className="px-6 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-[11px] font-black text-blue-400 uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
                  >
                    {availableRoles.map(r => <option key={r} value={r} className="bg-slate-950 text-white">{r}</option>)}
                  </select>
                </td>
                <td className="px-10 py-8">
                  <div className="flex justify-end gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => FirestoreService.updateUserProfile(u.uid, { disabled: !u.disabled })} 
                      className={`h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl italic border border-white/5 ${
                        u.disabled 
                          ? 'bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20' 
                          : 'bg-amber-600/10 text-amber-500 hover:bg-amber-600/20'
                      }`}
                    >
                      {u.disabled ? 'RESTORE ACCESS' : 'SUSPEND'}
                    </button>

                    <button 
                      onClick={() => handleDelete(u.uid)} 
                      className={`h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic border border-white/5 ${
                        confirmingDeleteUid === u.uid 
                          ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border-red-500' 
                          : 'text-slate-600 hover:text-red-500 hover:bg-red-600/10'
                      }`}
                    >
                      {confirmingDeleteUid === u.uid ? 'CONFIRM PURGE?' : 'DELETE'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
