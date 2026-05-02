import React, { useEffect, useState } from 'react';
import { onKillSwitchChange } from '../../services/firebase/monitor';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

import { useStore } from '../../store/useStore';

export const KillSwitchOverlay: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  
  const user = useStore(s => s?.user);
  const profile = useStore(s => s?.profile);
  const authLoading = useStore(s => s?.authLoading);
  const isAdmin = profile?.role === 'ADMIN';

  useEffect(() => {
    const unsubscribeKill = onKillSwitchChange((active) => {
      setIsActive(active);
    });

    return () => {
      unsubscribeKill();
    };
  }, []);

  // Αν είναι admin, δεν δείχνουμε το καθολικό overlay
  if (isAdmin) {
    if (!isActive) return null;
    
    // Εμφανίζουμε μόνο μια μικρή ειδοποίηση για τον Admin ότι το Kill-Switch είναι ενεργό
    return (
      <div className="fixed top-0 left-0 right-0 z-[10001] bg-red-600 text-white text-[10px] font-black uppercase py-1 px-4 text-center tracking-[0.2em] flex items-center justify-center gap-2">
        <AlertTriangle size={12} />
        <span>System Admin Mode: Global Kill-Switch is ACTIVE - App is offline for users</span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isActive && !authLoading && (
        <motion.div
          id="kill-switch-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-slate-900 border border-red-500/30 p-8 rounded-2xl shadow-2xl shadow-red-500/20"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 rounded-full">
                <ShieldAlert className="w-12 h-12 text-red-500" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Εφαρμογή Εκτός Λειτουργίας
            </h2>
            
            <p className="text-slate-400 mb-8 leading-relaxed">
              Η εφαρμογή έχει τεθεί προσωρινά εκτός λειτουργίας από τον διαχειριστή για λόγους ασφαλείας ή συντήρησης. 
              <br/><br/>
              Παρακαλούμε δοκιμάστε ξανά αργότερα.
            </p>

            <div className="flex items-center gap-2 justify-center text-red-400 text-sm font-medium bg-red-400/5 py-2 px-4 rounded-lg border border-red-400/10">
              <AlertTriangle className="w-4 h-4" />
              <span>GLOBAL KILL-SWITCH ACTIVE</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
