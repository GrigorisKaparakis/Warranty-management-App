
// Ενοποίηση όλων των απαραίτητων μεθόδων από το firebase/auth
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { UserProfile, UserRole } from "../../core/types";
import { auth, db } from "./db";

/**
 * AuthService: Διαχειρίζεται την ταυτοποίηση των χρηστών.
 */
/**
 * AuthService: Διαχειρίζεται την ταυτοποίηση των χρηστών μέσω Firebase Auth
 * και τον συγχρονισμό των προφίλ στο Firestore.
 */
export const AuthService = {
  /**
   * Σύνδεση με email και κωδικό.
   */
  login: async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  /**
   * Εγγραφή νέου χρήστη. 
   * Μετά την εγγραφή στο Auth, δημιουργεί ένα έγγραφο στο Firestore (/users) 
   * για να αποθηκεύσει τον ρόλο (ADMIN, EMPLOYEE, USER).
   */
  register: async (email: string, pass: string, role: UserRole = 'USER') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: email,
        role: role
      };
      
      // Αποθήκευση του προφίλ στη βάση
      await setDoc(doc(db, "users", result.user.uid), userProfile);
      return result.user;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  /**
   * Ανάκτηση του προφίλ (και του ρόλου) ενός χρήστη από το Firestore.
   */
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    return null;
  },

  /**
   * Real-time παρακολούθηση του προφίλ ενός χρήστη.
   */
  subscribeToProfile: (uid: string, callback: (profile: UserProfile | null) => void) => {
    const docRef = doc(db, "users", uid);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Profile listener error:", error);
    });
  },

  /**
   * Αποσύνδεση χρήστη.
   */
  logout: async (callback?: () => void) => {
    await signOut(auth);
    if (callback) callback();
  },

  /**
   * Observer που παρακολουθεί την κατάσταση σύνδεσης (Login/Logout) σε πραγματικό χρόνο.
   */
  subscribe: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Αλλαγή κωδικού πρόσβασης για τον τρέχοντα χρήστη.
   */
  changePassword: async (newPassword: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updatePassword(user, newPassword);
      } catch (error) {
        console.error("Password change failed:", error);
        throw error;
      }
    } else {
      throw new Error("No user is currently logged in.");
    }
  }
};
