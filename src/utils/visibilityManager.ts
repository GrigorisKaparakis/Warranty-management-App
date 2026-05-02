
/**
 * VisibilityManager: Παρακολουθεί αν το tab είναι ενεργό.
 */
type VisibilityCallback = (visible: boolean) => void;

class VisibilityManager {
  private callbacks: Set<VisibilityCallback> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;
    
    document.addEventListener('visibilitychange', () => {
      const isVisible = document.visibilityState === 'visible';
      this.callbacks.forEach(cb => cb(isVisible));
    });
    
    this.isInitialized = true;
  }

  /**
   * Εγγραφή για ειδοποιήσεις αλλαγής ορατότητας.
   */
  subscribe(callback: VisibilityCallback): () => void {
    this.callbacks.add(callback);
    // Επιστρέφουμε την αρχική κατάσταση αμέσως
    callback(document.visibilityState === 'visible');
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Έλεγχος αν το tab είναι ορατό.
   */
  isVisible(): boolean {
    return typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
  }
}

export const visibilityManager = new VisibilityManager();
