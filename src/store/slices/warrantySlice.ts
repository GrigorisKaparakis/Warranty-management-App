/**
 * warrantySlice.ts: Διαχείριση των δεδομένων των εγγυήσεων και των μητρώων.
 * Αποθηκεύει τις εγγυήσεις, τα logs, τις σημειώσεις και τα registries (ανταλλακτικά, οχήματα, κλπ).
 */

import { StateCreator } from 'zustand';
import { Entry, AuditEntry, Note, Notice, PartRegistryEntry, VehicleRegistryEntry, CustomerRegistryEntry, GlobalStats } from '../../core/types';

export interface WarrantySlice {
  // Data Collections
  entries: Entry[];
  setEntries: (entries: Entry[]) => void;
  lastDoc: any | null; // Using any for QueryDocumentSnapshot to avoid circular deps/complex imports if needed
  setLastDoc: (doc: any | null) => void;
  globalStats: GlobalStats | null;
  setGlobalStats: (stats: GlobalStats | null) => void;
  auditLogs: AuditEntry[];
  setAuditLogs: (logs: AuditEntry[]) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  notices: Notice[];
  setNotices: (notices: Notice[]) => void;
  users: any[]; // UserProfile[]
  setUsers: (users: any[]) => void;
  parts: PartRegistryEntry[];
  setParts: (parts: PartRegistryEntry[]) => void;
  vehicles: VehicleRegistryEntry[];
  setVehicles: (vehicles: VehicleRegistryEntry[]) => void;
  customers: CustomerRegistryEntry[];
  setCustomers: (customers: CustomerRegistryEntry[]) => void;

  // Navigation & Filtering
  listFilters: { status: string; company: string };
  setListFilters: (filters: { status: string; company: string }) => void;
  selectedVin: string | null;
  setSelectedVin: (vin: string | null) => void;

  // Active Operations
  deletingEntry: {id: string, warrantyId: string} | null;
  setDeletingEntry: (entry: {id: string, warrantyId: string} | null) => void;
  editingEntry: Entry | null;
  setEditingEntry: (entry: Entry | null) => void;
}

export const createWarrantySlice: StateCreator<WarrantySlice> = (set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  lastDoc: null,
  setLastDoc: (lastDoc) => set({ lastDoc }),
  globalStats: null,
  setGlobalStats: (globalStats) => set({ globalStats }),
  auditLogs: [],
  setAuditLogs: (auditLogs) => set({ auditLogs }),
  notes: [],
  setNotes: (notes) => set({ notes }),
  notices: [],
  setNotices: (notices) => set({ notices }),
  users: [],
  setUsers: (users) => set({ users }),
  parts: [],
  setParts: (parts) => set({ parts }),
  vehicles: [],
  setVehicles: (vehicles) => set({ vehicles }),
  customers: [],
  setCustomers: (customers) => set({ customers }),

  listFilters: { status: 'ALL', company: 'ALL' },
  setListFilters: (listFilters) => set({ listFilters }),
  selectedVin: null,
  setSelectedVin: (selectedVin) => set({ selectedVin }),

  deletingEntry: null,
  setDeletingEntry: (deletingEntry) => set({ deletingEntry }),
  editingEntry: null,
  setEditingEntry: (editingEntry) => set({ editingEntry }),
});
