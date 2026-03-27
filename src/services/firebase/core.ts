import { initializeApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  DocumentReference,
  CollectionReference,
  Query
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Entry } from "../../core/types";
import { DB_CONFIG } from "../../core/config";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
  throw error;
}

// Ρυθμίσεις σύνδεσης με το Firebase Project
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
export const auth = getAuth(app);

// Ορισμός των Collections
export const entriesCollection = collection(db, DB_CONFIG.COLLECTIONS.ENTRIES);
export const notesCollection = collection(db, DB_CONFIG.COLLECTIONS.NOTES);
export const usersCollection = collection(db, DB_CONFIG.COLLECTIONS.USERS);
export const auditCollection = collection(db, DB_CONFIG.COLLECTIONS.AUDIT);
export const noticesCollection = collection(db, DB_CONFIG.COLLECTIONS.NOTICES);
export const partsCollection = collection(db, DB_CONFIG.COLLECTIONS.PARTS);
export const vehiclesCollection = collection(db, DB_CONFIG.COLLECTIONS.VEHICLES);
export const customersCollection = collection(db, DB_CONFIG.COLLECTIONS.CUSTOMERS);

/**
 * Βοηθητική συνάρτηση που μετατρέπει τα αντικείμενα σε "καθαρά" JSON.
 */
export const deepSanitize = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (typeof obj.toMillis === 'function') return obj.toMillis();
  if (obj instanceof Date) return obj.getTime();
  
  if (Array.isArray(obj)) return obj.map(item => deepSanitize(item));
  
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key.startsWith('_')) continue;
      newObj[key] = deepSanitize(obj[key]);
    }
  }
  return newObj;
};

/**
 * Διασφαλίζει ότι μια εγγραφή έχει όλα τα απαραίτητα πεδία.
 */
export const sanitizeEntry = (data: any, id?: string): Entry => {
  const clean = deepSanitize(data);
  if (!Array.isArray(clean.parts)) clean.parts = [];
  clean.fullName = clean.fullName || clean.fullname || '';
  clean.warrantyId = clean.warrantyId || clean.warrantyid || '';
  clean.vin = clean.vin || '';
  clean.company = clean.company || '';
  clean.brand = clean.brand || '';
  clean.notes = clean.notes || '';
  if (id) clean.id = id;
  return clean as Entry;
};