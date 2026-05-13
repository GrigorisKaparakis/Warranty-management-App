
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { UI_MESSAGES } from '../../core/config';

/**
 * LoadingOverlay: Εμφανίζεται κατά τη διάρκεια ασύγχρονων εργασιών.
 */
export const LoadingOverlay: React.FC = () => {
  const isLoading = useStore(s => s.isLoading);
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-white font-black text-xs uppercase tracking-[0.3em]">ΕΠΕΞΕΡΓΑΣΙΑ...</p>
    </div>
  );
};

/**
 * DragDropOverlay: Εμφανίζεται όταν ο χρήστης σέρνει ένα αρχείο πάνω στην εφαρμογή.
 */
export const DragDropOverlay: React.FC = () => {
  const dragActive = useStore(s => s.dragActive);
  if (!dragActive) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-blue-600/90 backdrop-blur-sm flex flex-col items-center justify-center p-10 animate-in fade-in duration-200">
      <div className="w-full max-w-xl border-4 border-dashed border-white/40 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
          <Upload className="text-blue-600" size={48} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">DROP PDF TO SCAN</h2>
          <p className="text-blue-100 font-bold text-lg uppercase tracking-widest">ΑΦΗΣΤΕ ΤΟ ΑΡΧΕΙΟ ΕΔΩ ΓΙΑ ΑΥΤΟΜΑΤΗ ΑΝΑΛΥΣΗ ΑΠΟ ΤΟ AI</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl border border-white/20">
          <FileText className="text-white" size={20} />
          <span className="text-white font-black text-xs uppercase tracking-widest">ΥΠΟΣΤΗΡΙΖΕΤΑΙ PDF & ΕΙΚΟΝΕΣ</span>
        </div>
      </div>
    </div>
  );
};

/**
 * DeleteConfirmationModal: Παράθυρο επιβεβαίωσης διαγραφής εγγύησης.
 */
export const DeleteConfirmationModal: React.FC<{ onConfirm: (entry: {id: string, warrantyId: string}) => void }> = ({ onConfirm }) => {
  const deletingEntry = useStore(s => s.deletingEntry);
  const setDeletingEntry = useStore(s => s.setDeletingEntry);

  if (!deletingEntry) return null;

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] p-8 max-sm w-full shadow-2xl border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">ΕΠΙΒΕΒΑΙΩΣΗ ΔΙΑΓΡΑΦΗΣ</h3>
        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed italic">ΘΕΛΕΤΕ ΝΑ ΔΙΑΓΡΑΨΕΤΕ ΟΡΙΣΤΙΚΑ ΤΗΝ ΕΓΓΥΗΣΗ <strong>{deletingEntry.warrantyId}</strong>;</p>
        <div className="flex gap-4">
          <button onClick={() => setDeletingEntry(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-[11px] uppercase rounded-xl hover:bg-slate-200">ΑΚΥΡΩΣΗ</button>
          <button 
            onClick={() => onConfirm(deletingEntry)} 
            className="flex-1 py-3 bg-red-600 text-white font-bold text-[11px] uppercase rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
          >
            ΔΙΑΓΡΑΦΗ
          </button>
        </div>
      </div>
    </div>
  );
};
