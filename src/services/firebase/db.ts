
/**
 * db.ts: Ο κεντρικός διαχειριστής της βάσης δεδομένων.
 * Πλέον λειτουργεί ως "Facade" που συγκεντρώνει τις λειτουργίες από εξειδικευμένα modules.
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
