/**
 * chat.ts: Υπηρεσία για τη λειτουργία της ομαδικής συνομιλίας (Live Chat).
 * Διαχειρίζεται την αποστολή μηνυμάτων, το real-time συγχρονισμό και την κατάσταση παρουσίας (Presence).
 */
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  arrayUnion,
  setDoc,
  writeBatch,
  where
} from "firebase/firestore";
import { db } from "./core";
import { ChatMessage, ChatPresence } from "../../core/types";
import { visibilityAwareOnSnapshot } from "./monitor";

/**
 * ChatService: Διαχειρίζεται την επικοινωνία σε πραγματικό χρόνο (public chat).
 */
export const ChatService = {
  // ... (rest of sendMessage remains same)
  sendMessage: async (text: string, userId: string, userName: string) => {
    try {
      const messagesRef = collection(db, "messages");
      await addDoc(messagesRef, {
        text,
        senderId: userId,
        senderName: userName,
        timestamp: serverTimestamp(),
        readBy: [userId]
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  /**
   * Παρακολούθηση των τελευταίων μηνυμάτων σε πραγματικό χρόνο.
   */
  subscribeToMessages: (callback: (messages: ChatMessage[]) => void, messageLimit: number = 20) => {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(messageLimit));

    return visibilityAwareOnSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      callback(messages);
    });
  },

  /**
   * Σήμανση μηνύματος ως διαβασμένο.
   */
  markAsRead: async (messageId: string, userId: string) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, {
        readBy: arrayUnion(userId)
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  },

  /**
   * Σήμανση πολλαπλών μηνυμάτων ως διαβασμένα.
   */
  markMultipleAsRead: async (messageIds: string[], userId: string) => {
    if (messageIds.length === 0) return;
    try {
      const batch = writeBatch(db);
      messageIds.forEach(id => {
        const messageRef = doc(db, "messages", id);
        batch.update(messageRef, {
          readBy: arrayUnion(userId)
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking multiple messages as read:", error);
    }
  },

  /**
   * Ενημέρωση παρουσίας χρήστη (Presence).
   */
  updatePresence: async (userId: string, name: string, isAppFocused: boolean, isAppIdle: boolean) => {
    try {
      const presenceRef = doc(db, "presence", userId);
      await setDoc(presenceRef, {
        uid: userId,
        name,
        lastActive: serverTimestamp(),
        isAppFocused,
        isAppIdle
      }, { merge: true });
    } catch (error) {
      // Ignored
    }
  },

  /**
   * Παρακολούθηση ενεργών χρηστών (presence) με φιλτράρισμα στη βάση για οικονομία.
   */
  subscribeToPresence: (callback: (presence: ChatPresence[]) => void) => {
    const presenceRef = collection(db, "presence");
    // Φιλτράρουμε μόνο όσους έχουν το app focused για να μειώσουμε τα reads
    const q = query(presenceRef, where("isAppFocused", "==", true));
    
    return visibilityAwareOnSnapshot(q, (snapshot) => {
      const presence: ChatPresence[] = [];
      snapshot.forEach((docSnap) => {
        presence.push({ ...docSnap.data() } as ChatPresence);
      });
      callback(presence);
    });
  }
};
