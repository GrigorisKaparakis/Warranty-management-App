/**
 * ExpiryModal.tsx: Παράθυρο χειροκίνητης αλλαγής ημερομηνίας λήξης.
 * Επιτρέπει την τροποποίηση ή αφαίρεση της ημερομηνίας λήξης μιας εγγύησης.
 */
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ExpiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  newExpiryDate: string;
  setNewExpiryDate: (date: string) => void;
  onUpdateExpiry: (overrideDate?: string) => void;
  isUpdatingExpiry: boolean;
}

export const ExpiryModal: React.FC<ExpiryModalProps> = ({
  isOpen,
  onClose,
  newExpiryDate,
  setNewExpiryDate,
  onUpdateExpiry,
  isUpdatingExpiry
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-zinc-100 scale-100 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Calendar className="text-blue-600" size={24} />
        </div>
        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-2 italic">ΧΕΙΡΟΚΙΝΗΤΗ ΑΛΛΑΓΗ ΛΗΞΗΣ</h3>
        <p className="text-xs font-bold text-zinc-500 mb-8 leading-relaxed italic uppercase tracking-tight">
          Χρησιμοποιήστε αυτή την επιλογή μόνο για εξαιρέσεις. Η αλλαγή θα καταγραφεί στο ιστορικό.
        </p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">ΝΕΑ ΗΜΕΡΟΜΗΝΙΑ ΛΗΞΗΣ</label>
            <input 
              type="date" 
              className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-black text-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              disabled={isUpdatingExpiry}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button 
              onClick={() => {
                setNewExpiryDate('');
                onUpdateExpiry('');
              }}
              variant="secondary"
              className="flex-1 text-rose-600 hover:bg-rose-50"
              disabled={isUpdatingExpiry}
            >
              ΚΑΘΑΡΙΣΜΟΣ
            </Button>
            <Button 
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={isUpdatingExpiry}
            >
              ΑΚΥΡΩΣΗ
            </Button>
            <Button 
              onClick={() => onUpdateExpiry()}
              variant="primary"
              className="flex-1 shadow-lg shadow-blue-100"
              disabled={isUpdatingExpiry}
            >
              {isUpdatingExpiry ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'ΕΝΗΜΕΡΩΣΗ'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
