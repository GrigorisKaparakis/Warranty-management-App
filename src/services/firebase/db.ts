/**
 * db.ts: Ο κεντρικός διαχειριστής της βάσης δεδομένων (Facade).
 * Συγκεντρώνει και εξάγει όλες τις επιμέρους υπηρεσίες (Admin, Entries, Registry, κλπ) για εύκολη πρόσβαση.
 */
import { db, auth } from "./core";
import { AdminService, MaintenanceService } from "./admin";
import { EntryService } from "./entries";
import { RegistryService } from "./registry";
import { StatsService } from "./stats";
import { NoteService } from "./notes";
import { ChatService } from "./chat";

export { db, auth };

export const FirestoreService = {
  // Admin & Settings
  ...AdminService,
  ...MaintenanceService,
  
  // Warranty Entries
  ...EntryService,

  // Stats
  ...StatsService,
  
  // Registries (Parts, Vehicles, Customers)
  ...RegistryService,
  
  // Notes
  ...NoteService,

  // Chat
  ...ChatService
};
