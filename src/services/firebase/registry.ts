/**
 * registry.ts: Διαχείριση των μητρώων (Registries) της εφαρμογής.
 * Περιλαμβάνει λειτουργίες για Ανταλλακτικά (Parts), Οχήματα (Vehicles) και Πελάτες (Customers).
 */

import { 
  doc, 
  query, 
  orderBy, 
  setDoc, 
  deleteDoc,
  increment, 
  limit, 
  serverTimestamp 
} from "firebase/firestore";
import { visibilityAwareOnSnapshot, monitoredGetDoc } from "./monitor";
import { 
  db, 
  partsCollection, 
  vehiclesCollection, 
  customersCollection, 
  deepSanitize, 
  handleFirestoreError, 
  OperationType 
} from "./core";
import { 
  PartRegistryEntry, 
  VehicleRegistryEntry, 
  CustomerRegistryEntry 
} from "../../core/types";
import { 
  normalizeString, 
  normalizeDescription, 
  createFirestoreId 
} from "../../utils/normalization";

export const RegistryService = {
  /**
   * Παρακολούθηση ανταλλακτικών (Top 200).
   */
  subscribeToParts(callback: (parts: PartRegistryEntry[]) => void) {
    const q = query(partsCollection, orderBy("useCount", "desc"), limit(200));
    return visibilityAwareOnSnapshot(q, (snapshot) => {
      const parts = snapshot.docs.map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as PartRegistryEntry));
      callback(parts);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "parts"));
  },

  /**
   * Παρακολούθηση οχημάτων (Top 200).
   */
  subscribeToVehicles(callback: (vehicles: VehicleRegistryEntry[]) => void) {
    const q = query(vehiclesCollection, orderBy("useCount", "desc"), limit(200));
    return visibilityAwareOnSnapshot(q, (snapshot) => {
      const vehicles = snapshot.docs.map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as VehicleRegistryEntry));
      callback(vehicles);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "vehicles"));
  },

  /**
   * Παρακολούθηση πελατών (Top 200).
   */
  subscribeToCustomers(callback: (customers: CustomerRegistryEntry[]) => void) {
    const q = query(customersCollection, orderBy("useCount", "desc"), limit(200));
    return visibilityAwareOnSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as CustomerRegistryEntry));
      callback(customers);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "customers"));
  },

  /**
   * Προσθήκη ή Ενημέρωση ανταλλακτικού (Upsert).
   * Περιλαμβάνει έξυπνη λογική για να μην σβήνεται η υπάρχουσα περιγραφή αν η νέα είναι κενή.
   */
  async upsertPart(code: string, description: string, brand?: string): Promise<void> {
    if (!code) return;
    const cleanCode = normalizeString(code);
    const docId = createFirestoreId(cleanCode);
    const cleanDesc = normalizeDescription(description);
    
    try {
      const docRef = doc(db, "parts", docId);
      
      if (cleanDesc !== '-') {
        // Αν έχουμε έγκυρη περιγραφή, την αποθηκεύουμε κατευθείαν
        await setDoc(docRef, {
          code: cleanCode,
          description: cleanDesc,
          brand: normalizeString(brand || ''),
          lastUsed: serverTimestamp(),
          useCount: increment(1)
        }, { merge: true });
      } else {
        // Αν η νέα περιγραφή είναι "-", ελέγχουμε αν υπάρχει ήδη παλιά για να μην τη χάσουμε
        const snap = await monitoredGetDoc(docRef);
        const oldData = snap.exists() ? snap.data() : null;
        await setDoc(docRef, {
          code: cleanCode,
          description: oldData?.description || '-',
          brand: normalizeString(brand || oldData?.brand || ''),
          lastUsed: serverTimestamp(),
          useCount: increment(1)
        }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `parts/${docId}`);
    }
  },

  /**
   * Ενημέρωση ή δημιουργία οχήματος στο μητρώο.
   */
  async upsertVehicle(vin: string, brand?: string, model?: string): Promise<void> {
    if (!vin) return;
    const cleanVin = normalizeString(vin);
    const docId = createFirestoreId(cleanVin);
    
    try {
      const docRef = doc(db, "vehicles", docId);
      await setDoc(docRef, {
        vin: cleanVin,
        brand: normalizeString(brand || ''),
        model: normalizeString(model || ''),
        lastUsed: serverTimestamp(),
        useCount: increment(1)
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `vehicles/${docId}`);
    }
  },

  /**
   * Ενημέρωση ή δημιουργία πελάτη στο μητρώο.
   */
  async upsertCustomer(fullName: string, phone?: string, email?: string): Promise<void> {
    if (!fullName) return;
    const cleanName = normalizeString(fullName);
    const docId = createFirestoreId(cleanName);
    
    try {
      const docRef = doc(db, "customers", docId);
      await setDoc(docRef, {
        fullName: cleanName,
        phone: phone?.trim() || '',
        email: email?.trim().toLowerCase() || '',
        lastUsed: serverTimestamp(),
        useCount: increment(1)
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `customers/${docId}`);
    }
  },

  /**
   * Διαγραφή ανταλλακτικού από το μητρώο.
   */
  async deletePart(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "parts", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `parts/${id}`);
    }
  },

  /**
   * Διαγραφή οχήματος από το μητρώο.
   */
  async deleteVehicle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "vehicles", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vehicles/${id}`);
    }
  },

  /**
   * Διαγραφή πελάτη από το μητρώο.
   */
  async deleteCustomer(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "customers", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `customers/${id}`);
    }
  }
};
