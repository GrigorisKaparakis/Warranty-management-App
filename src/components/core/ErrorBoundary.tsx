import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FirestoreService } from '../../services/firebase/db';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary: Component που "συλλαμβάνει" σφάλματα στο UI και εμφανίζει
 * μια φιλική σελίδα σφάλματος αντί να καταρρεύσει η εφαρμογή.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Καταγραφή στο Audit Log απευθείας (fire and forget)
    const isPermissionError = error.message.includes('permission-denied') || error.message.includes('insufficient permissions');
    FirestoreService.addAuditLog({
      timestamp: Date.now(),
      userId: 'SYSTEM',
      userEmail: 'system@error-boundary',
      action: 'ERROR',
      targetId: 'SYSTEM',
      targetWarrantyId: 'SYSTEM',
      details: `${isPermissionError ? 'ΣΦΑΛΜΑ ΔΙΚΑΙΩΜΑΤΩΝ' : 'ΚΡΙΣΙΜΟ ΣΦΑΛΜΑ UI'}: ${error.message || String(error)}`
    }).catch(err => console.error('Failed to log error to audit:', err));
  }

  public render() {
    if (this.state.hasError) {
      let isPermissionError = false;
      let errorDetails = "";
      
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType && parsed.authInfo) {
            isPermissionError = true;
            errorDetails = `Σφάλμα Δικαιωμάτων: ${parsed.operationType} στο ${parsed.path || 'άγνωστο μονοπάτι'}`;
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-zinc-200 text-center">
            <div className={`w-16 h-16 ${isPermissionError ? 'bg-amber-100' : 'bg-rose-100'} rounded-2xl mx-auto mb-6 flex items-center justify-center`}>
              <span className={`${isPermissionError ? 'text-amber-600' : 'text-rose-600'} font-black text-2xl`}>!</span>
            </div>
            <h1 className="text-xl font-black text-zinc-800 uppercase tracking-tight mb-4 italic">
              {isPermissionError ? 'ΠΕΡΙΟΡΙΣΜΟΣ ΠΡΟΣΒΑΣΗΣ' : 'ΚΑΤΙ ΠΗΓΕ ΣΤΡΑΒΑ'}
            </h1>
            <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed italic">
              {isPermissionError 
                ? `Δεν έχετε τα απαραίτητα δικαιώματα για αυτή την ενέργεια. ${errorDetails}`
                : 'Παρουσιάστηκε ένα απρόσμενο σφάλμα. Παρακαλώ ανανεώστε τη σελίδα ή δοκιμάστε ξανά αργότερα.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-700 transition-all shadow-lg"
            >
              ΑΝΑΝΕΩΣΗ ΣΕΛΙΔΑΣ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
