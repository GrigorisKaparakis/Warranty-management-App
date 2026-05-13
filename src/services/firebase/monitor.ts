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
 * monitor.ts: Εργαλείο παρακολούθησης και ελέγχου των Firestore Reads (v1.2.5).
 * 
 * Λειτουργίες:
 * 1. Καταγραφή κάθε Read (GET/SNAPSHOT) στην κονσόλα για έλεγχο κόστους.
 * 2. Global Kill-Switch: Δυνατότητα άμεσης απενεργοποίησης της εφαρμογής από τη βάση.
 * 3. Visibility-Aware Subscriptions: Αυτόματη παύση των listeners όταν το tab δεν είναι ορατό.
 */

let isKillSwitchActive = false;
const killSwitchListeners = new Set<(active: boolean) => void>();
let activeListenersCount = 0;
let totalReadsCount = 0;

/**
 * Εγγραφή για αλλαγές στο Kill-Switch
 */
export const onKillSwitchChange = (callback: (active: boolean) => void) => {
  killSwitchListeners.add(callback);
  callback(isKillSwitchActive);
  return () => {
    killSwitchListeners.delete(callback);
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
      const debugEnabled = !!data.debugLogsEnabled;
      isKillSwitchActive = isActive;

      // Update store for UI reactivity
      const uiState = useStore.getState();
      if (uiState.setMaintenanceMode) uiState.setMaintenanceMode(isActive);
      if (uiState.setDebugLogsEnabled) uiState.setDebugLogsEnabled(debugEnabled);

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
  const debugEnabled = useStore.getState().isDebugLogsEnabled;
  
  if (isServer) {
    totalReadsCount += log.docCount;
  }

  if (!debugEnabled) return;

  const sourceLabel = isServer ? 'firebase' : 'cache';
  const color = isServer ? 'color: #ef4444; font-weight: bold; background: #fee2e2; padding: 2px 4px; border-radius: 4px;' : 'color: #10b981; font-weight: bold; background: #dcfce7; padding: 2px 4px; border-radius: 4px;';
  
  console.log(
    `%cfrom ${sourceLabel} ${log.docCount} docs from ${log.path}`,
    color
  );
  
  if (isServer) {
    console.log(`%c[TOTAL READS: ${totalReadsCount}] [ACTIVE LISTENERS: ${activeListenersCount}]`, 'color: #6366f1; font-weight: bold;');
  }
};


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

  activeListenersCount++;
  if (useStore.getState().isDebugLogsEnabled) {
    console.log(`%c[LISTENER OPENED] ${path} (Total Active: ${activeListenersCount})`, 'color: #f59e0b; font-weight: bold;');
  }

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

    logRead({
      path,
      docCount: isInitialFetch ? totalDocs : (added + modified + removed),
      source,
      timestamp: new Date().toLocaleTimeString(),
      operation: 'SNAPSHOT'
    });

    isInitialFetch = false;
    onNext(snapshot);
  };

  const wrapUnsubscribe = (unsub: () => void) => {
    return () => {
      activeListenersCount--;
      if (useStore.getState().isDebugLogsEnabled) {
        console.log(`%c[LISTENER CLOSED] ${path} (Total Active: ${activeListenersCount})`, 'color: #6b7280; font-weight: bold;');
      }
      unsub();
    };
  };

  if (options) {
    return wrapUnsubscribe(firestoreOnSnapshot(reference as any, options, handleSnapshot, onError));
  }

  return wrapUnsubscribe(firestoreOnSnapshot(reference as any, handleSnapshot, onError));
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

  const start = () => {
    if (isStoppedManually) return;
    if (unsubscribe) return;

    if (isKillSwitchActive) {
      const path = (reference as any).path || (reference as any)._query?.path?.segments?.join('/') || 'unknown';
      if (!path.includes('app_settings/global')) {
        const role = useStore.getState().profile?.role;
        if (role !== 'ADMIN') {
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
    const role = useStore.getState().profile?.role;
    if (role !== 'ADMIN') {
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
    const role = useStore.getState().profile?.role;
    if (role !== 'ADMIN') {
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
