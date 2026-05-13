import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { FirestoreService } from '@/services/firebase/db';
import { visibilityManager } from '@/utils/visibilityManager';

/**
 * usePresenceManager: Hook για την παρακολούθηση της παρουσίας του χρήστη.
 * Ενημερώνει τη βάση αν ο χρήστης είναι Online, Focused ή Idle.
 */
export const usePresenceManager = () => {
  const user = useStore(s => s.user);
  const isAppIdle = useStore(s => s.isAppIdle);

  useEffect(() => {
    if (!user?.uid) return;

    const updatePresence = async () => {
      const isVisible = visibilityManager.isVisible();
      const name = user.email?.split('@')[0].toUpperCase() || 'UNKNOWN';
      
      try {
        await FirestoreService.updatePresence(
          user.uid, 
          name, 
          isVisible, 
          isAppIdle
        );
      } catch (e) {
        // Silently fail presence updates
      }
    };

    // Αρχική ενημέρωση
    updatePresence();

    // Heartbeat κάθε 45 δευτερόλεπτα
    const interval = setInterval(updatePresence, 45000);

    // Ενημέρωση σε αλλαγή visibility
    const unsubVisibility = visibilityManager.subscribe(updatePresence);

    return () => {
      clearInterval(interval);
      unsubVisibility();
      // Σήμανση ως offline/away κατά το unmount (προαιρετικό, συνήθως το χειρίζεται το heartbeat)
      FirestoreService.updatePresence(user.uid, user.email?.split('@')[0].toUpperCase() || 'UNKNOWN', false, true);
    };
  }, [user?.uid, isAppIdle]);
};
