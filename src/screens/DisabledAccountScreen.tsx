import React from 'react';
import { AuthService } from '../services/firebase/auth';

/**
 * DisabledAccountScreen: Εμφανίζεται όταν ο λογαριασμός του χρήστη έχει απενεργοποιηθεί.
 */
export const DisabledAccountScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-10 text-center">
    <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-bounce">
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">ΛΟΓΑΡΙΑΣΜΟΣ ΑΠΕΝΕΡΓΟΠΟΙΗΜΕΝΟΣ</h1>
    <p className="text-slate-400 font-bold text-lg max-w-md mb-10 uppercase tracking-widest">
      Η ΠΡΟΣΒΑΣΗ ΣΑΣ ΕΧΕΙ ΑΠΕΝΕΡΓΟΠΟΙΗΘΕΙ ΑΠΟ ΤΟΝ ΔΙΑΧΕΙΡΙΣΤΗ. ΕΠΙΚΟΙΝΩΝΗΣΤΕ ΜΕ ΤΗΝ ΥΠΟΣΤΗΡΙΞΗ.
    </p>
    <button 
      onClick={() => AuthService.logout()} 
      className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-widest hover:bg-slate-200 transition-all"
    >
      ΑΠΟΣΥΝΔΕΣΗ
    </button>
  </div>
);
