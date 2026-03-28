import { 
  onSnapshot as firestoreOnSnapshot, 
  getDocs as firestoreGetDocs, 
  getDoc as firestoreGetDoc,
  DocumentReference,
  Query,
  DocumentSnapshot,
  QuerySnapshot,
  SnapshotListenOptions
} from "firebase/firestore";

/**
 * Firestore Monitor Tool (v1.0.9)
 * Καταγράφει κάθε ανάγνωση (Read) από το Firestore για έλεγχο κόστους και απόδοσης.
 */

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
 * Monitored version of getDocs
 */
export async function monitoredGetDocs<T>(query: Query<T>): Promise<QuerySnapshot<T>> {
  const path = (query as any).path || (query as any)._query?.path?.segments?.join('/') || 'unknown/path';
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
