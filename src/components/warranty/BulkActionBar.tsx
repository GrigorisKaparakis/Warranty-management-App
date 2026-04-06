/**
 * BulkActionBar.tsx: Μπάρα μαζικών ενεργειών.
 * Εμφανίζεται όταν επιλέγονται πολλαπλές εγγυήσεις και επιτρέπει τη μαζική αλλαγή κατάστασης, πληρωμής ή διαγραφή.
 */

import React from 'react';
import { CheckCircle, XCircle, Trash, X } from 'lucide-react';
import { UI_MESSAGES } from '../../core/config';

interface BulkActionBarProps {
  selectedCount: number;
  allStatusKeys: string[];
  getStatusLabel: (status: string) => string;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  allStatusKeys,
  getStatusLabel,
  onStatusChange,
  onDelete,
  onClose
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-zinc-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-10 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4 border-r border-white/10 pr-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm">
            {selectedCount}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest">{UI_MESSAGES.LABELS.SELECTED}</div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{UI_MESSAGES.LABELS.STATUS}:</span>
            <select 
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-zinc-800 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
              value=""
            >
              <option value="" disabled>{UI_MESSAGES.LABELS.CHOOSE}</option>
              {allStatusKeys.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
            </select>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <button 
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl text-[10px] font-black uppercase transition-all"
          >
            <Trash size={14} /> {UI_MESSAGES.LABELS.DELETE}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="ml-4 p-2 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
