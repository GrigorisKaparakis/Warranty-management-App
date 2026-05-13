/**
 * aiFeedback.ts: Διαχείριση της αποθήκευσης και ανάκτησης του feedback για το AI.
 * Επιτρέπει τη συλλογή δεδομένων για τη βελτίωση της ακρίβειας της εξαγωγής δεδομένων.
 */
import { collection, addDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db, auth } from "./db";
import { AIFeedback } from "../../core/types";
import { monitoredGetDocs } from "./monitor";

export const AIFeedbackService = {
  /**
   * Αποθήκευση ενός νέου feedback.
   */
  saveFeedback: async (feedback: Omit<AIFeedback, "id" | "timestamp" | "userId">) => {
    try {
      const colRef = collection(db, "aiFeedback");
      const docData = {
        ...feedback,
        timestamp: Date.now(),
        userId: auth.currentUser?.uid || "anonymous"
      };
      await addDoc(colRef, docData);
    } catch (error) {
      console.error("Error saving AI feedback:", error);
    }
  },

  /**
   * Ανάκτηση των πιο πρόσφατων feedback για μια συγκεκριμένη εταιρεία.
   */
  getFeedbackForCompany: async (company: string, maxResults: number = 3): Promise<AIFeedback[]> => {
    try {
      const colRef = collection(db, "aiFeedback");
      const q = query(
        colRef,
        where("company", "==", company),
        orderBy("timestamp", "desc"),
        limit(maxResults)
      );
      
      const snapshot = await monitoredGetDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AIFeedback));
    } catch (error) {
      console.error("Error fetching AI feedback:", error);
      return [];
    }
  },

  /**
   * Ανάκτηση των πιο πρόσφατων feedback γενικά (για περιπτώσεις που δεν ξέρουμε την εταιρεία).
   */
  getRecentFeedback: async (maxResults: number = 5): Promise<AIFeedback[]> => {
    try {
      const colRef = collection(db, "aiFeedback");
      const q = query(
        colRef,
        orderBy("timestamp", "desc"),
        limit(maxResults)
      );
      
      const snapshot = await monitoredGetDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AIFeedback));
    } catch (error) {
      console.error("Error fetching recent AI feedback:", error);
      return [];
    }
  }
};
