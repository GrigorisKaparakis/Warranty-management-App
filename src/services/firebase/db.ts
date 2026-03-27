
/**
 * db.ts: Ο κεντρικός διαχειριστής της βάσης δεδομένων.
 * Πλέον λειτουργεί ως "Facade" που συγκεντρώνει τις λειτουργίες από εξειδικευμένα modules.
 */

import { db, auth } from "./core";
import { AdminService, MaintenanceService } from "./admin";
import { EntryService } from "./entries";
import { RegistryService } from "./registry";
import { NoteService } from "./notes";

export { db, auth };

export const FirestoreService = {
  // Admin & Settings
  ...AdminService,
  ...MaintenanceService,
  
  // Warranty Entries
  ...EntryService,
  
  // Registries (Parts, Vehicles, Customers)
  ...RegistryService,
  
  // Notes
  ...NoteService
};
