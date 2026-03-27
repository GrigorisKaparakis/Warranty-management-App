
import React from 'react';
import { Notice } from '../../core/types';
import { FirestoreService } from '../../services/firebase/db';

import { useAppState } from '../../hooks/useAppState';
import { useStore } from '../../store/useStore';

/**
 * NoticeTicker: Εμφανίζει την πιο πρόσφατη live ανακοίνωση στην κορυφή της οθόνης.
 * Χρησιμοποιείται για άμεση επικοινωνία μεταξύ των μελών του συνεργείου.
 */
export const NoticeTicker: React.FC = () => {
  const { canBroadcast } = useAppState();
  const notices = useStore(s => s.notices);
  
  if (notices.length === 0) return null;

  const latestNotice = notices[0]; // Πάντα δείχνουμε την τελευταία

  return (
    <div className="bg-slate-900 h-10 flex items-center px-6 overflow-hidden animate-in slide-in-from-top-full duration-500 sticky top-0 z-[150] shadow-2xl border-b border-slate-800">
      <div className="flex items-center gap-4 w-full">
        {/* Animated Badge */}
        <span className="flex-shrink-0 bg-blue-600 text-[9px] font-black text-white px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
          LIVE NOTICE
        </span>
        
        {/* Κυρίως Κείμενο */}
        <div className="flex-1 overflow-hidden">
          <p className="text-blue-400 font-bold text-xs uppercase tracking-tight truncate">
            {latestNotice.text} 
            <span className="text-slate-600 font-medium ml-2 text-[10px]">
              — ΑΠΟ {latestNotice.authorEmail.split('@')[0]}
            </span>
          </p>
        </div>
        
        {/* Κλείσιμο Ανακοίνωσης: Διαγράφει την ανακοίνωση από τη βάση για όλους (Μόνο αν υπάρχει δικαίωμα) */}
        {canBroadcast && (
          <button 
            onClick={() => FirestoreService.deleteNotice(latestNotice.id)}
            className="text-slate-500 hover:text-white transition-colors p-1"
            title="Clear Notice"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
