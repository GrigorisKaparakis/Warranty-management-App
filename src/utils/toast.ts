/**
 * toast.ts: Global Toast Helper.
 * Χρησιμοποιεί τη βιβλιοθήκη sonner για πιο robust και όμορφες ειδοποιήσεις.
 */

import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },
  error: (message: string) => {
    sonnerToast.error(message);
  },
  info: (message: string) => {
    sonnerToast.info(message);
  },
  warning: (message: string) => {
    sonnerToast.warning(message);
  },
  show: (message: string, type: ToastType = 'success') => {
    if (type === 'success') sonnerToast.success(message);
    else if (type === 'error') sonnerToast.error(message);
    else if (type === 'warning') sonnerToast.warning(message);
    else sonnerToast.info(message);
  }
};
