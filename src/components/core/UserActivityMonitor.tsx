import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 λεπτά

/**
 * Παρακολουθεί την δραστηριότητα του χρήστη.
 * Αν περάσουν 10 λεπτά χωρίς κίνηση/interaction, θέτει το app σε Idle mode
 * για να εξοικονομήσει Reads κλείνοντας τους listeners.
 */
export const UserActivityMonitor: React.FC = () => {
  const setAppIdle = useStore((s) => s.setAppIdle);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Αν ήμασταν σε IDLE, επαναφέρουμε το app
    if (useStore.getState().isAppIdle) {
      setAppIdle(false);
      toast.success('Καλώς ήρθατε πίσω! Οι συνδέσεις ενεργοποιήθηκαν ξανά.');
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setAppIdle(true);
      toast.info('Λόγω αδράνειας, οι συνδέσεις έκλεισαν για εξοικονόμηση πόρων.');
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    // Events που θεωρούμε "δραστηριότητα"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'focus'];

    const handleActivity = () => {
      resetTimer();
    };

    // Αρχική εκκίνηση του timer
    resetTimer();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Παρακολούθηση αλλαγής visibility (όταν αλλάζει tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};
