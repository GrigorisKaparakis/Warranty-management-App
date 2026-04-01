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
  onPaymentChange: (isPaid: boolean) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  allStatusKeys,
  getStatusLabel,
  onStatusChange,
  onPaymentChange,
  onDelete,
  onClose
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-500">
      <div className="bg-slate-950/95 text-white px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-12 border border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-5 border-r border-white/10 pr-12">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            {selectedCount}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em]">{UI_MESSAGES.LABELS.SELECTED}</div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{UI_MESSAGES.LABELS.STATUS}:</span>
            <select 
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none"
              value=""
            >
              <option value="" disabled className="bg-slate-900">{UI_MESSAGES.LABELS.CHOOSE}</option>
              {allStatusKeys.map(s => <option key={s} value={s} className="bg-slate-900">{getStatusLabel(s)}</option>)}
            </select>
          </div>

          <div className="w-px h-10 bg-white/10" />

          <div className="flex gap-3">
            <button 
              onClick={() => onPaymentChange(true)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
            >
              <CheckCircle size={16} /> {UI_MESSAGES.LABELS.PAID}
            </button>
            <button 
              onClick={() => onPaymentChange(false)}
              className="flex items-center gap-2 px-5 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all shadow-xl"
            >
              <XCircle size={16} /> {UI_MESSAGES.LABELS.UNPAID}
            </button>
          </div>

          <div className="w-px h-10 bg-white/10" />

          <button 
            onClick={onDelete}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 text-slate-400 hover:text-white hover:bg-red-600 rounded-xl text-[10px] font-black uppercase transition-all shadow-xl"
          >
            <Trash size={16} /> {UI_MESSAGES.LABELS.DELETE}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="ml-6 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all text-slate-500 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
