/**
 * VisibilityManager.ts: Διαχειρίζεται την κατάσταση ορατότητας του Tab της εφαρμογής.
 * Υλοποιεί έναν μηχανισμό "Grace Period" (60 δευτερόλεπτα) ώστε να μην διακόπτονται
 * ακαριαία οι συνδέσεις με το Firestore όταν ο χρήστης αλλάζει tab για λίγο.
 * Αυτό μειώνει δραστικά τα Reads/Writes και το κόστος της βάσης.
 */

type VisibilityCallback = (visible: boolean) => void;

class VisibilityManager {
  private callbacks: Set<VisibilityCallback> = new Set();
  private isInitialized = false;
  private currentVisible = true;
  private timeoutId: any = null;
  private GRACE_PERIOD = 60000; // 60 δευτερόλεπτα αναμονής πριν την απενεργοποίηση

  constructor() {
    if (typeof document !== 'undefined') {
      this.currentVisible = document.visibilityState === 'visible';
      this.init();
    }
  }

  /**
   * Αρχικοποιεί τους event listeners του browser.
   */
  private init() {
    if (this.isInitialized) return;

    document.addEventListener('visibilitychange', () => {
      const actualVisible = document.visibilityState === 'visible';

      if (actualVisible) {
        // Επιστροφή στο tab: Ακυρώνουμε το χρονόμετρο απενεργοποίησης αν τρέχει
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }

        // Ενημερώνουμε αμέσως ότι είμαστε πάλι ενεργοί
        if (!this.currentVisible) {
          this.currentVisible = true;
          this.notify();
        }
      } else {
        // Αλλαγή tab: Περιμένουμε το grace period πριν "κοιμίσουμε" την εφαρμογή
        if (this.timeoutId) clearTimeout(this.timeoutId);

        this.timeoutId = setTimeout(() => {
          this.currentVisible = false;
          this.timeoutId = null;
          this.notify();
        }, this.GRACE_PERIOD);
      }
    });

    this.isInitialized = true;
  }

  /**
   * Ενημερώνει όλους τους συνδρομητές για την αλλαγή κατάστασης.
   */
  private notify() {
    this.callbacks.forEach(cb => cb(this.currentVisible));
  }

  /**
   * Εγγραφή για ειδοποιήσεις αλλαγής ορατότητας.
   * @returns Συνάρτηση για απεγγραφή (unsubscribe).
   */
  subscribe(callback: VisibilityCallback): () => void {
    this.callbacks.add(callback);
    // Στέλνουμε αμέσως την τρέχουσα κατάσταση
    callback(this.currentVisible);

    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Έλεγχος αν η εφαρμογή θεωρείται "Ενεργή" αυτή τη στιγμή.
   */
  isVisible(): boolean {
    return this.currentVisible;
  }
}

/**
 * Singleton instance του VisibilityManager για χρήση σε όλη την εφαρμογή.
 */
export const visibilityManager = new VisibilityManager();
