
import { doc, addDoc, deleteDoc, setDoc, updateDoc } from "firebase/firestore";
import { monitoredOnSnapshot } from "../monitor";
import { db, noticesCollection, auditCollection, usersCollection, deepSanitize, handleFirestoreError, OperationType } from "../core";
import { GarageSettings, Notice, AuditEntry, UserProfile } from "../../../core/types";
import { DB_CONFIG, FULL_GARAGE_DEFAULTS, EntryStatus } from "../../../core/config";

export const AdminService = {
  // Παρακολούθηση Ρυθμίσεων
  subscribeToSettings(callback: (settings: GarageSettings) => void) {
    const docRef = doc(db, DB_CONFIG.COLLECTIONS.SETTINGS, DB_CONFIG.SETTINGS_DOC_ID);
    return monitoredOnSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = deepSanitize(snapshot.data()) as GarageSettings;

        // Deep merge with defaults to ensure all fields exist
        const mergedSettings: GarageSettings = {
          ...FULL_GARAGE_DEFAULTS,
          ...data,
          branding: { ...FULL_GARAGE_DEFAULTS.branding, ...data.branding },
          limits: { ...FULL_GARAGE_DEFAULTS.limits, ...data.limits },
          expiryThresholds: { ...FULL_GARAGE_DEFAULTS.expiryThresholds, ...data.expiryThresholds },
          dashboardConfig: { ...FULL_GARAGE_DEFAULTS.dashboardConfig, ...data.dashboardConfig },
          rolePermissions: { ...FULL_GARAGE_DEFAULTS.rolePermissions, ...data.rolePermissions }
        };

        // Handle legacy fields if necessary
        const legacyData = data as any;
        if (!data.branding && (legacyData.companyName || legacyData.logoText)) {
          mergedSettings.branding = {
            appName: legacyData.companyName || FULL_GARAGE_DEFAULTS.branding!.appName,
            logoText: legacyData.logoText || FULL_GARAGE_DEFAULTS.branding!.logoText
          };
        }

        callback(mergedSettings);
      } else {
        callback(FULL_GARAGE_DEFAULTS);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings/garage-config"));
  },

  async updateSettings(settings: GarageSettings): Promise<void> {
    const docRef = doc(db, DB_CONFIG.COLLECTIONS.SETTINGS, DB_CONFIG.SETTINGS_DOC_ID);
    try {
      await setDoc(docRef, deepSanitize(settings));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "settings/garage-config");
    }
  },

  // Ανακοινώσεις
  subscribeToNotices(callback: (notices: Notice[]) => void) {
    const docRef = noticesCollection;
    return monitoredOnSnapshot(docRef, (snapshot) => {
      const notices = snapshot.docs.map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as Notice));
      callback(notices.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "notices"));
  },

  async addNotice(notice: Omit<Notice, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(noticesCollection, deepSanitize(notice));
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "notices") as any;
    }
  },

  async deleteNotice(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "notices", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    }
  },

  // Audit Logs
  subscribeToAuditLogs(limitCount: number, callback: (logs: AuditEntry[]) => void) {
    return monitoredOnSnapshot(auditCollection, (snapshot) => {
      const logs = snapshot.docs
        .map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as AuditEntry))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limitCount);
      callback(logs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "audit_logs"));
  },

  async addAuditLog(log: Omit<AuditEntry, 'id'>): Promise<void> {
    try {
      await addDoc(auditCollection, deepSanitize(log));
    } catch (e) {
      // We don't use handleFirestoreError here to avoid infinite loops if audit logging fails due to permissions
      console.error("Audit log failed:", e);
    }
  },

  // Διαχείριση Χρηστών
  subscribeToUsers(callback: (users: UserProfile[]) => void) {
    return monitoredOnSnapshot(usersCollection, (snapshot) => {
      const users = snapshot.docs.map(snap => deepSanitize(snap.data()) as UserProfile);
      callback(users);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "users"));
  },

  async _updateUser(uid: string, updates: Partial<UserProfile>, useSet: boolean = false): Promise<void> {
    const docRef = doc(db, "users", uid);
    try {
      if (useSet) {
        await setDoc(docRef, deepSanitize(updates), { merge: true });
      } else {
        await updateDoc(docRef, deepSanitize(updates));
      }
    } catch (error) {
      handleFirestoreError(error, useSet ? OperationType.WRITE : OperationType.UPDATE, `users/${uid}`);
    }
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    return this._updateUser(uid, updates, true);
  },

  async updateUserPreference(uid: string, updates: Partial<UserProfile>): Promise<void> {
    return this._updateUser(uid, updates, false);
  },

  async deleteUserProfile(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  }
};
