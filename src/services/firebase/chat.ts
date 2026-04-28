
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
  setDoc
} from "firebase/firestore";
import { db } from "./core";
import { ChatMessage, ChatPresence } from "../../core/types";
import { visibilityAwareOnSnapshot } from "./monitor";

/**
 * ChatService: Διαχειρίζεται την επικοινωνία σε πραγματικό χρόνο (public chat).
 */
export const ChatService = {
  /**
   * Αποστολή νέου μηνύματος.
   */
  sendMessage: async (text: string, userId: string, userName: string) => {
    try {
      const messagesRef = collection(db, "messages");
      await addDoc(messagesRef, {
        text,
        senderId: userId,
        senderName: userName,
        timestamp: serverTimestamp(),
        readBy: [userId] // Ο αποστολέας το έχει ήδη διαβάσει
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
   * Σήμανση μηνύματος ως διαβασμένο από τον τρέχοντα χρήστη.
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
    try {
      const promises = messageIds.map(id => {
        const messageRef = doc(db, "messages", id);
        return updateDoc(messageRef, {
          readBy: arrayUnion(userId)
        });
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Error marking multiple messages as read:", error);
    }
  },

  /**
   * Ενημέρωση παρουσίας χρήστη.
   */
  updatePresence: async (userId: string, name: string, chatOpen: boolean) => {
    try {
      const presenceRef = doc(db, "presence", userId);
      await setDoc(presenceRef, {
        uid: userId,
        name,
        lastActive: serverTimestamp(),
        chatOpen
      }, { merge: true });
    } catch (error) {
      // Ignored for presence to avoid noise
    }
  },

  /**
   * Παρακολούθηση ενεργών χρηστών (presence).
   */
  subscribeToPresence: (callback: (presence: ChatPresence[]) => void) => {
    const presenceRef = collection(db, "presence");
    return visibilityAwareOnSnapshot(presenceRef, (snapshot) => {
      const presence: ChatPresence[] = [];
      snapshot.forEach((docSnap) => {
        presence.push({ ...docSnap.data() } as ChatPresence);
      });
      callback(presence);
    });
  }
};
