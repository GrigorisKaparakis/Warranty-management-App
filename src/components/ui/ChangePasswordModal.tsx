import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/firebase/auth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeFeedback, setPasswordChangeFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (passwordChangeFeedback) {
      const timer = setTimeout(() => setPasswordChangeFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordChangeFeedback]);

  if (!isOpen) return null;

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeFeedback({ msg: "Οι κωδικοί δεν ταιριάζουν!", type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeFeedback({ msg: "Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες.", type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.changePassword(newPassword);
      setPasswordChangeFeedback({ msg: "Ο κωδικός άλλαξε επιτυχώς!", type: 'success' });
      setNewPassword('');
      setConfirmNewPassword('');
      // onClose(); // Κλείσιμο του modal μετά την επιτυχή αλλαγή
    } catch (e: any) {
      setPasswordChangeFeedback({ msg: "Σφάλμα αλλαγής κωδικού: " + e.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ ΠΡΟΣΒΑΣΗΣ</h3>
        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed italic">Εισάγετε τον νέο κωδικό πρόσβασης για τον λογαριασμό σας.</p>
        
        <div className="space-y-4">
          <input 
            type="password" 
            placeholder="Νέος Κωδικός" 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Επιβεβαίωση Νέου Κωδικού" 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-[11px] uppercase rounded-xl hover:bg-slate-200"
              disabled={isLoading}
            >
              Ακυρωση
            </button>
            <button 
              onClick={handleChangePassword}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Αλλαγή Κωδικού
            </button>
          </div>
          {passwordChangeFeedback && (
            <span className={`text-sm font-semibold mt-4 block text-center ${passwordChangeFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {passwordChangeFeedback.msg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
