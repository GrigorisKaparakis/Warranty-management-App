/**
 * audit-logger.ts: Υπηρεσία καταγραφής ενεργειών χρήστη (Audit Logs).
 * Χρησιμοποιείται για την παρακολούθηση αλλαγών, διαγραφών και σφαλμάτων
 * στην εφαρμογή, επιτρέποντας την επαναφορά δεδομένων αν χρειαστεί.
 */
import { auth } from "./core";
import { AdminService } from "./admin";
import { deepSanitize } from "./core";

export const AuditLogger = {
  async logAction(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'ERROR', targetId: string, warrantyId: string, details: string, oldData?: any, newData?: any) {
    try {
      await AdminService.addAuditLog({
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || 'system',
        userEmail: auth.currentUser?.email || 'system',
        action,
        targetId,
        targetWarrantyId: warrantyId,
        details,
        oldData: oldData ? deepSanitize(oldData) : null,
        newData: newData ? deepSanitize(newData) : null
      });
    } catch (error) {
      console.error(`Audit logging failed for ${action} on ${targetId}:`, error);
    }
  },

  async logError(targetId: string, warrantyId: string, error: any, context: string) {
    const errMessage = error instanceof Error ? error.message : String(error);
    await this.logAction(
      'ERROR', 
      targetId, 
      warrantyId, 
      `${context}: ${errMessage.slice(0, 150)}`
    );
  }
};
