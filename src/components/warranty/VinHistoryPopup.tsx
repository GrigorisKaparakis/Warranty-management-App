
/**
 * VinHistoryPopup.tsx: Αναδυόμενο παράθυρο που εμφανίζει το ιστορικό επισκέψεων ενός VIN.
 * Παρέχει γρήγορη πρόσβαση σε προηγούμενες παρατηρήσεις και ημερομηνίες.
 */
import React from 'react';
import { Entry } from '../../core/types';
import { UI_MESSAGES } from '../../core/config';

interface VinHistoryPopupProps {
  history: Entry[];
  onClose: () => void;
}

export const VinHistoryPopup: React.FC<VinHistoryPopupProps> = ({ history, onClose }) => {
  return (
    <div className="absolute top-full left-0 right-0 z-[110] mt-3 bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 p-6 max-h-[400px] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center mb-6">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{UI_MESSAGES.LABELS.PREVIOUS_VISITS}</div>
        <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white bg-white/5 rounded-full transition-all text-xl">×</button>
      </div>
      <div className="space-y-4">
        {history.map(h => (
          <div key={h.id} className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-black text-white block tracking-widest uppercase">{h.warrantyId}</span>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">{h.brand}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(h.createdAt).toLocaleDateString('el-GR')}</span>
            </div>
            <div className="text-[10px] text-slate-400 italic leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 group-hover:text-slate-200 transition-colors">
              {h.notes || UI_MESSAGES.LABELS.NO_REMARKS}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
