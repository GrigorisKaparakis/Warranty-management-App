import { FirestoreService } from './firebase/db';

/**
 * AnalyticsService: Διαχειρίζεται την καταγραφή γεγονότων (events).
 * Σημείωση: Η καταγραφή στο Firebase Analytics έχει απενεργοποιηθεί προσωρινά.
 */
/**
 * AnalyticsService: Διαχειρίζεται την καταγραφή γεγονότων (events) και σφαλμάτων
 * για την παρακολούθηση της χρήσης της εφαρμογής.
 */
export const AnalyticsService = {
  /**
   * Καταγραφή αλλαγής σελίδας / view.
   */
  logPageView: (viewName: string) => {
    // Analytics log removed for production
  },

  /**
   * Καταγραφή δημιουργίας εγγύησης.
   */
  logWarrantyCreated: (brand: string, company: string) => {
    // Analytics log removed for production
  },

  /**
   * Καταγραφή χρήσης του AI Engine.
   */
  logAiUsage: (feature: string) => {
    // Analytics log removed for production
  },

  /**
   * Καταγραφή σύνδεσης χρήστη.
   */
  logLogin: (method: string = 'email') => {
    // Analytics log removed for production
  },

  /**
   * Καταγραφή σφάλματος.
   */
  logError: async (errorName: string, errorMessage: string) => {
    console.error(`[Analytics] Error: ${errorName} - ${errorMessage}`);
    try {
      await FirestoreService.addAuditLog({
        timestamp: Date.now(),
        userId: 'SYSTEM',
        userEmail: 'system@analytics',
        action: 'ERROR',
        targetId: 'SYSTEM',
        targetWarrantyId: 'SYSTEM',
        details: `${errorName}: ${errorMessage}`
      });
    } catch (err) {
      console.error('Failed to log error to audit:', err);
    }
  },

  /**
   * Καταγραφή εξαγωγής PDF.
   */
  logPdfExport: (type: string) => {
    // Analytics log removed for production
  }
};
