/**
 * registry.ts: Διαχείριση των μητρώων (Registries) της εφαρμογής.
 * Περιλαμβάνει λειτουργίες για Ανταλλακτικά (Parts), Οχήματα (Vehicles) και Πελάτες (Customers).
 */

import { doc, onSnapshot, query, orderBy, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, partsCollection, vehiclesCollection, customersCollection, deepSanitize, handleFirestoreError, OperationType } from "./core";
import { PartRegistryEntry, VehicleRegistryEntry, CustomerRegistryEntry } from "../../core/types";

export const RegistryService = {
  subscribeToParts(callback: (parts: PartRegistryEntry[]) => void) {
    const q = query(partsCollection, orderBy("code", "asc"));
    return onSnapshot(q, (snapshot) => {
      const parts = snapshot.docs.map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as PartRegistryEntry));
      callback(parts);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "parts"));
  },

  subscribeToVehicles(callback: (vehicles: VehicleRegistryEntry[]) => void) {
    const q = query(vehiclesCollection, orderBy("vin", "asc"));
    return onSnapshot(q, (snapshot) => {
      const vehicles = snapshot.docs.map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as VehicleRegistryEntry));
      callback(vehicles);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "vehicles"));
  },

  subscribeToCustomers(callback: (customers: CustomerRegistryEntry[]) => void) {
    const q = query(customersCollection, orderBy("fullName", "asc"));
    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as CustomerRegistryEntry));
      callback(customers);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "customers"));
  },

  async upsertPart(code: string, description: string, brand?: string): Promise<void> {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    const docId = cleanCode.replace(/\//g, '-');
    let cleanDesc = description.trim();
    if (!cleanDesc || cleanDesc === 'ΠΕΡΙΓΡΑΦΗ ΑΠΟ ΙΣΤΟΡΙΚΟ') cleanDesc = '-';
    
    try {
      const docRef = doc(db, "parts", docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const finalDesc = (cleanDesc === '-' && data.description && data.description !== '-' && data.description !== 'ΠΕΡΙΓΡΑΦΗ ΑΠΟ ΙΣΤΟΡΙΚΟ') 
          ? data.description 
          : cleanDesc;
        await updateDoc(docRef, {
          description: finalDesc,
          brand: brand || data.brand || '', 
          lastUsed: Date.now(),
          useCount: (data.useCount || 0) + 1
        });
      } else {
        await setDoc(docRef, {
          code: cleanCode,
          description: cleanDesc,
          brand: brand || '',
          lastUsed: Date.now(),
          useCount: 1
        });
      }
    } catch (e) { 
      handleFirestoreError(e, OperationType.WRITE, `parts/${docId}`);
    }
  },

  async upsertVehicle(vin: string, brand: string, ownerName: string): Promise<void> {
    if (!vin || vin.length < 5) return;
    const cleanVin = vin.trim().toUpperCase();
    try {
      const docRef = doc(db, "vehicles", cleanVin);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        await updateDoc(docRef, {
          brand: brand || data.brand || '',
          ownerName: ownerName || data.ownerName || '',
          lastUsed: Date.now(),
          useCount: (data.useCount || 0) + 1
        });
      } else {
        await setDoc(docRef, {
          vin: cleanVin,
          brand: brand || '',
          ownerName: ownerName || '',
          lastUsed: Date.now(),
          useCount: 1
        });
      }
    } catch (e) { 
      handleFirestoreError(e, OperationType.WRITE, `vehicles/${cleanVin}`);
    }
  },

  async upsertCustomer(fullName: string, vin?: string): Promise<void> {
    if (!fullName) return;
    const cleanName = fullName.trim().toUpperCase();
    const docId = cleanName.replace(/\//g, '-');
    try {
      const docRef = doc(db, "customers", docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as CustomerRegistryEntry;
        const vins = data.vins || [];
        if (vin && !vins.includes(vin.toUpperCase())) {
          vins.push(vin.toUpperCase());
        }
        await updateDoc(docRef, {
          vins: vins,
          lastUsed: Date.now(),
          useCount: (data.useCount || 0) + 1
        });
      } else {
        await setDoc(docRef, {
          fullName: cleanName,
          vins: vin ? [vin.toUpperCase()] : [],
          lastUsed: Date.now(),
          useCount: 1
        });
      }
    } catch (e) { 
      handleFirestoreError(e, OperationType.WRITE, `customers/${docId}`);
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "customers", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `customers/${id}`);
    }
  }
};
