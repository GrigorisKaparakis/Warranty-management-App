import { 
  onSnapshot as firestoreOnSnapshot, 
  getDocs as firestoreGetDocs, 
  getDoc as firestoreGetDoc,
  DocumentReference,
  Query,
  DocumentSnapshot,
  QuerySnapshot,
  SnapshotListenOptions,
  doc
} from "firebase/firestore";
import { visibilityManager } from "../../utils/visibilityManager";
import { db, auth } from "./core";

/**
 * Firestore Monitor Tool (v1.2.0)
 * Καταγράφει κάθε ανάγνωση (Read) από το Firestore για έλεγχο κόστους και απόδοσης.
 * Υποστηρίζει Visibility-Aware Subscriptions και Global Kill-Switch.
 */

let isKillSwitchActive = false;
let killSwitchListeners: ((active: boolean) => void)[] = [];

/**
 * Εγγραφή για αλλαγές στο Kill-Switch
 */
export const onKillSwitchChange = (callback: (active: boolean) => void) => {
  killSwitchListeners.push(callback);
  callback(isKillSwitchActive);
  return () => {
    killSwitchListeners = killSwitchListeners.filter(l => l !== callback);
  };
};

/**
 * Ενεργοποιεί την παρακολούθηση του Global Kill-Switch
 */
export const initKillSwitch = () => {
  const settingsRef = doc(db, "app_settings", "global");
  return firestoreOnSnapshot(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      isKillSwitchActive = !!data.killSwitchEnabled;
      killSwitchListeners.forEach(l => l(isKillSwitchActive));
    }
  });
};

export const getKillSwitchStatus = () => isKillSwitchActive;

interface ReadLog {
  path: string;
  docCount: number;
  source: 'SERVER' | 'CACHE' | 'UNKNOWN';
  timestamp: string;
  operation: 'GET_DOC' | 'GET_DOCS' | 'SNAPSHOT';
}

const logRead = (log: ReadLog) => {
  // Console logs removed for production V1.0.9
};

async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  
  const ADMIN_EMAILS = ["grigoriskaparakishk@gmail.com"];
  if (ADMIN_EMAILS.includes(user.email || '')) return true;

  try {
    const userDoc = await firestoreGetDoc(doc(db, "users", user.uid));
    return userDoc.exists() && userDoc.data()?.role === 'ADMIN';
  } catch (e) {
    return false;
  }
}

/**
 * Monitored version of onSnapshot
 */
export function monitoredOnSnapshot<T>(
  reference: Query<T> | DocumentReference<T>,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void,
  options?: SnapshotListenOptions
) {
  const path = (reference as any).path || (reference as any)._query?.path?.segments?.join('/') || 'unknown/path';
  
  // Το monitoredOnSnapshot καλείται εσωτερικά από το visibilityAwareOnSnapshot 
  // ή απευθείας. Αν το KillSwitch είναι ενεργό, ελέγχουμε αν υπάρχει bypass.
  // Σημείωση: Το bypass ελέγχεται στον start() του visibilityAwareOnSnapshot για ασύγχρονη υποστήριξη.
  
  let isInitialFetch = true;
  
  const handleSnapshot = (snapshot: any) => {
    const isQuery = 'docs' in snapshot;
    const totalDocs = isQuery ? snapshot.docs.length : (snapshot.exists() ? 1 : 0);
    const source = snapshot.metadata.fromCache ? 'CACHE' : 'SERVER';
    
    // Calculate changes
    let added = 0;
    let modified = 0;
    let removed = 0;
    
    if (isQuery) {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'added') added++;
        if (change.type === 'modified') modified++;
        if (change.type === 'removed') removed++;
      });
    }

    const operation = isInitialFetch ? 'INITIAL_FETCH' : 'LIVE_UPDATE';
    const docCountText = isInitialFetch 
      ? `${totalDocs} docs` 
      : `+${added} ~${modified} -${removed} (Total: ${totalDocs})`;

    logRead({
      path,
      docCount: isInitialFetch ? totalDocs : (added + modified + removed),
      source,
      timestamp: new Date().toLocaleTimeString(),
      operation: `SNAPSHOT_${operation}` as any
    });

    isInitialFetch = false;
    onNext(snapshot);
  };

  if (options) {
    return firestoreOnSnapshot(reference as any, options, handleSnapshot, onError);
  }

  return firestoreOnSnapshot(reference as any, handleSnapshot, onError);
}

/**
 * Visibility-Aware version of onSnapshot
 * Σταματάει τη συνδρομή όταν το tab δεν είναι ορατό και την ξεκινάει πάλι όταν εμφανίζεται.
 */
export function visibilityAwareOnSnapshot<T>(
  reference: Query<T> | DocumentReference<T>,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void,
  options?: SnapshotListenOptions
) {
  let unsubscribe: (() => void) | null = null;
  let isStoppedManually = false;

  const start = async () => {
    if (isStoppedManually) return;
    if (unsubscribe) return;

    // Αν είναι ενεργό το Kill-Switch, ελέγχουμε αν είμαστε admin για να το παρακάμψουμε
    if (isKillSwitchActive) {
      const path = (reference as any).path || (reference as any)._query?.path?.segments?.join('/') || 'unknown';
      if (!path.includes('app_settings/global')) {
        const isAdmin = await isCurrentUserAdmin();
        if (!isAdmin) {
          console.warn("Kill-Switch active: Subscription blocked for non-admin");
          return;
        }
      }
    }

    unsubscribe = monitoredOnSnapshot(reference, onNext, onError, options);
  };

  const stop = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  // Παρακολούθηση ορατότητας
  const cleanupVisibility = visibilityManager.subscribe((visible) => {
    if (visible) {
      start();
    } else {
      stop();
    }
  });

  // Επιστρέφει συνάρτηση για οριστικό σταμάτημα
  return () => {
    isStoppedManually = true;
    stop();
    cleanupVisibility();
  };
}

/**
 * Monitored version of getDocs
 */
export async function monitoredGetDocs<T>(query: Query<T>): Promise<QuerySnapshot<T>> {
  const path = (query as any).path || (query as any)._query?.path?.segments?.join('/') || 'unknown/path';
  
  if (isKillSwitchActive && !path.includes('app_settings/global')) {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      throw new Error("Application is temporarily disabled (Kill-Switch Active)");
    }
  }
  
  const snapshot = await firestoreGetDocs(query);
  
  logRead({
    path,
    docCount: snapshot.docs.length,
    source: snapshot.metadata.fromCache ? 'CACHE' : 'SERVER',
    timestamp: new Date().toLocaleTimeString(),
    operation: 'GET_DOCS'
  });

  return snapshot;
}

/**
 * Monitored version of getDoc
 */
export async function monitoredGetDoc<T>(reference: DocumentReference<T>): Promise<DocumentSnapshot<T>> {
  const path = (reference as any).path || 'unknown/path';
  
  if (isKillSwitchActive && !path.includes('app_settings/global')) {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      throw new Error("Application is temporarily disabled (Kill-Switch Active)");
    }
  }
  
  const snapshot = await firestoreGetDoc(reference);

  logRead({
    path,
    docCount: 1,
    source: snapshot.metadata.fromCache ? 'CACHE' : 'SERVER',
    timestamp: new Date().toLocaleTimeString(),
    operation: 'GET_DOC'
  });

  return snapshot;
}
