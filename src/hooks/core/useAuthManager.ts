import { useEffect, useRef } from 'react';
import { AuthService } from '@/services/firebase/auth';
import { FirestoreService } from '@/services/firebase/db';
import { useStore } from '@/store/useStore';
import { toast } from '@/utils/toast';
import { ONBOARDING_DEFAULTS } from '@/core/config';
import { UserProfile } from '@/core/types';

/**
 * useAuthManager: Hook για τη διαχείριση του Authentication και του Profile.
 */
export const useAuthManager = () => {
  const isAppIdle = useStore(s => s.isAppIdle);
  const setAuth = useStore(s => s.setAuth);
  const setAccountDisabled = useStore(s => s.setAccountDisabled);
  const hasShownWelcome = useRef(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = AuthService.subscribe(async (currentUser) => {
      if (currentUser) {
        if (unsubscribeProfile) unsubscribeProfile();
        
        // Skip profile listener if app is idle to save resources
        if (isAppIdle) return;

        unsubscribeProfile = AuthService.subscribeToProfile(currentUser.uid, async (userProfile) => {
          if (!userProfile) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              role: ONBOARDING_DEFAULTS.DEFAULT_USER_ROLE,
              disabled: false
            };

            setAuth(currentUser, newProfile);
            setAccountDisabled(false);
            await FirestoreService.updateUserProfile(currentUser.uid, newProfile);
            return;
          }

          setAccountDisabled(!!userProfile.disabled);
          setAuth(currentUser, userProfile);
        });

        if (!hasShownWelcome.current) {
          const name = currentUser.email?.split('@')[0] || 'Χρήστης';
          toast.info(`Σύνδεση ως ${name}`);
          hasShownWelcome.current = true;
        }
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setAuth(null, null);
        setAccountDisabled(false);
        hasShownWelcome.current = false;
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [setAuth, setAccountDisabled, isAppIdle]);
};
