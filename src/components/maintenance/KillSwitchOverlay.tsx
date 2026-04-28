import React, { useEffect, useState } from 'react';
import { onKillSwitchChange } from '../../services/firebase/monitor';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { auth, db } from '../../services/firebase/core';
import { doc, getDoc } from 'firebase/firestore';

export const KillSwitchOverlay: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const ADMIN_EMAILS = ["grigoriskaparakishk@gmail.com"];

  useEffect(() => {
    const checkAdminStatus = async (user: any) => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      // Check hardcoded email first
      if (ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        setChecking(false);
        return;
      }

      // Check firestore roles (fallback)
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'ADMIN') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Admin check error:", e);
      } finally {
        setChecking(false);
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      checkAdminStatus(user);
    });

    const unsubscribeKill = onKillSwitchChange((active) => {
      setIsActive(active);
    });

    return () => {
      unsubscribeAuth();
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
      {isActive && !checking && (
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
