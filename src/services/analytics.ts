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
    console.log(`[Analytics] Page View: ${viewName}`);
  },

  /**
   * Καταγραφή δημιουργίας εγγύησης.
   */
  logWarrantyCreated: (brand: string, company: string) => {
    console.log(`[Analytics] Warranty Created: ${brand} - ${company}`);
  },

  /**
   * Καταγραφή χρήσης του AI Engine.
   */
  logAiUsage: (feature: string) => {
    console.log(`[Analytics] AI Usage: ${feature}`);
  },

  /**
   * Καταγραφή σύνδεσης χρήστη.
   */
  logLogin: (method: string = 'email') => {
    console.log(`[Analytics] Login: ${method}`);
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
    console.log(`[Analytics] PDF Export: ${type}`);
  }
};
