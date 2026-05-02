import {
  onSnapshot as firestoreOnSnapshot,
  getDocs as firestoreGetDocs,
  getDoc as firestoreGetDoc,
  getDocsFromCache,
  getDocsFromServer,
  getDocFromCache,
  getDocFromServer,
  DocumentReference,
  Query,
  DocumentSnapshot,
  QuerySnapshot,
  SnapshotListenOptions,
  doc
} from "firebase/firestore";
import { useStore } from "../../store/useStore";
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
      const isActive = !!data.killSwitchEnabled;
      isKillSwitchActive = isActive;

      // Update store for UI reactivity
      const setMaintenanceMode = useStore.getState().setMaintenanceMode;
      if (setMaintenanceMode) setMaintenanceMode(isActive);

      killSwitchListeners.forEach(l => l(isActive));
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
  const isServer = log.source === 'SERVER';
  const sourceLabel = isServer ? 'firebase' : 'cache';
  const color = isServer ? 'color: #ef4444; font-weight: bold;' : 'color: #10b981; font-weight: bold;';

  console.log(
    `%cfrom ${sourceLabel} ${log.docCount} docs from ${log.path}`,
    color
  );
};

async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

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

    if (isKillSwitchActive) {
      const path = (reference as any).path || (reference as any)._query?.path?.segments?.join('/') || 'unknown';
      if (!path.includes('app_settings/global')) {
        const isAdmin = await isCurrentUserAdmin();
        if (isStoppedManually || unsubscribe) return;

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

  const cleanupVisibility = visibilityManager.subscribe((visible) => {
    if (visible) {
      start();
    } else {
      stop();
    }
  });

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
