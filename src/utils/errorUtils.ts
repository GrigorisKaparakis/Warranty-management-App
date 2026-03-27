/**
 * errorUtils.ts: Βοηθητικές συναρτήσεις για τη διαχείριση και μορφοποίηση σφαλμάτων.
 */

import { UI_MESSAGES } from '../core/config';

/**
 * Μετατρέπει ένα σφάλμα (που μπορεί να είναι JSON string από το Firestore)
 * σε ένα ανθρώπινο και κατανοητό μήνυμα για το UI.
 */
export const formatError = (error: any): string => {
  if (!error) return UI_MESSAGES.ERRORS.GENERAL;

  const message = error instanceof Error ? error.message : String(error);

  // Έλεγχος αν το μήνυμα είναι JSON (δικό μας custom error από το Firestore Service)
  try {
    const parsed = JSON.parse(message);
    
    if (parsed.error && parsed.operationType) {
      const opMap: Record<string, string> = {
        'create': 'ΔΗΜΙΟΥΡΓΙΑ',
        'update': 'ΕΝΗΜΕΡΩΣΗ',
        'delete': 'ΔΙΑΓΡΑΦΗ',
        'list': 'ΠΡΟΒΟΛΗ ΛΙΣΤΑΣ',
        'get': 'ΑΝΑΚΤΗΣΗ',
        'write': 'ΕΓΓΡΑΦΗ'
      };

      const operation = opMap[parsed.operationType] || parsed.operationType;
      
      // Αν είναι σφάλμα δικαιωμάτων
      if (parsed.error.includes('insufficient permissions') || parsed.error.includes('permission-denied')) {
        return `${UI_MESSAGES.ERRORS.PERMISSION_DENIED} (${operation})`;
      }

      return `${UI_MESSAGES.ERRORS.GENERAL} (${operation})`;
    }
  } catch (e) {
    // Δεν είναι JSON, συνεχίζουμε με το απλό κείμενο
  }

  // Μετάφραση κοινών σφαλμάτων Firebase Auth
  if (message.includes('auth/invalid-credential') || message.includes('auth/user-not-found') || message.includes('auth/wrong-password')) {
    return "ΑΠΟΤΥΧΙΑ ΣΥΝΔΕΣΗΣ. ΕΛΕΓΞΤΕ ΤΑ ΣΤΟΙΧΕΙΑ ΣΑΣ.";
  }
  
  if (message.includes('auth/network-request-failed')) {
    return "ΣΦΑΛΜΑ ΔΙΚΤΥΟΥ. ΠΑΡΑΚΑΛΩ ΕΛΕΓΞΤΕ ΤΗ ΣΥΝΔΕΣΗ ΣΑΣ.";
  }

  if (message.includes('quota-exceeded')) {
    return "ΤΟ ΟΡΙΟ ΧΡΗΣΗΣ (QUOTA) ΕΞΑΝΤΛΗΘΗΚΕ. ΔΟΚΙΜΑΣΤΕ ΑΥΡΙΟ.";
  }

  return message || UI_MESSAGES.ERRORS.GENERAL;
};
