
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
    <div className="absolute top-full left-0 right-0 z-[110] mt-2 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 max-h-[350px] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{UI_MESSAGES.LABELS.PREVIOUS_VISITS}</div>
        <button type="button" onClick={onClose} className="text-slate-300 hover:text-slate-600 font-bold">×</button>
      </div>
      <div className="space-y-3">
        {history.map(h => (
          <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[11px] font-black text-slate-900 block">{h.warrantyId}</span>
                <span className="text-[9px] font-bold text-blue-600 uppercase">{h.brand}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400">{new Date(h.createdAt).toLocaleDateString('el-GR')}</span>
            </div>
            <div className="text-[10px] text-slate-500 italic leading-tight bg-white p-2 rounded-lg border border-slate-50">
              {h.notes || UI_MESSAGES.LABELS.NO_REMARKS}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
