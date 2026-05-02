
/**
 * Ρόλοι χρηστών για τον έλεγχο προσβάσεων (RBAC).
 * Πλέον είναι δυναμικοί και ορίζονται στη βάση δεδομένων.
 */
export type UserRole = string;

export type SortKey = 'createdAt' | 'warrantyId' | 'fullName' | 'brand';
export type SortOrder = 'asc' | 'desc';

/**
 * Διαθέσιμα Views (σελίδες) στην εφαρμογή.
 */
export type ViewType = 'dashboard' | 'entry' | 'all' | 'paid' | 'rejected' | 'notes' | 'maintenance' | 'users' | 'vinSearch' | 'aiAssistant' | 'expiryTracker' | 'auditLog';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayDensity?: 'compact' | 'standard' | 'large';
  disabled?: boolean;
}

/**
 * Ανταλλακτικό που συνδέεται με μια εγγύηση.
 */
export interface Part {
  id: string;
  code: string;         // Κωδικός εργοστασίου
  description: string;  // Περιγραφή (π.χ. "Φίλτρο λαδιού")
  quantity: number;
  isReady: boolean;     // Αν έχει παραληφθεί/τοποθετηθεί
}

/**
 * Καταχώρηση στη βάση δεδομένων ανταλλακτικών (Global Registry).
 */
export interface PartRegistryEntry {
  id: string;           // Συνήθως ο κωδικός (code) ή auto-id
  code: string;         // Κωδικός εργοστασίου (μοναδικός)
  description: string;  // Περιγραφή
  brand?: string;       // Μάρκα (π.χ. HONDA)
  lastUsed: number;     // Timestamp τελευταίας χρήσης
  useCount: number;     // Πόες φορές έχει χρησιμοποιηθεί
}

/**
 * Καταχώρηση στη βάση δεδομένων οχημάτων (Vehicle Registry).
 */
export interface VehicleRegistryEntry {
  id: string;           // Το VIN (μοναδικό)
  vin: string;
  brand: string;
  ownerName: string;    // Τελευταίο γνωστό ονοματεπώνυμο
  lastUsed: number;
  useCount: number;
}

/**
 * Καταχώρηση στη βάση δεδομένων πελατών (Customer Registry).
 */
export interface CustomerRegistryEntry {
  id: string;           // Το ονοματεπώνυμο (normalized) ή auto-id
  fullName: string;
  phone?: string;       // Τηλέφωνο επικοινωνίας
  lastUsed: number;
  useCount: number;
  vins: string[];       // Λίστα με τα VIN που έχει ο πελάτης
}

/**
 * Ανακοίνωση που εμφανίζεται στο Ticker στην κορυφή.
 */
export interface Notice {
  id: string;
  text: string;
  authorEmail: string;
  createdAt: number;
}

/**
 * Κανόνες για το πώς το AI αναγνωρίζει τους διανομείς από το PDF.
 */
export interface DistributorRule {
  id: string;
  company: string; // π.χ. ΣΑΡΑΚΑΚΗΣ
  brand: string;   // π.χ. HONDA
  markers: string; // Λέξεις κλειδιά για το AI
}

/**
 * Το κεντρικό μοντέλο μιας Εγγραφής Εγγύησης.
 */
export interface Entry {
  id: string;
  userId: string;
  authorEmail?: string; // Email του χρήστη που δημιούργησε την εγγραφή
  warrantyId: string;   // Ο κωδικός της εγγύησης (π.χ. W-12345)
  vin: string;          // Αριθμός πλαισίου (17 χαρακτήρες)
  company: string;      // Διανομέας
  brand: string;        // Μάρκα/Μοντέλο
  fullName: string;     // Ονοματεπώνυμο πελάτη
  status: string;
  parts: Part[];
  notes: string;        // Παρατηρήσεις και αυτόματο ιστορικό αλλαγών
  isPaid: boolean;      // Κατάσταση πληρωμής από διανομέα
  createdAt: number;
  updatedAt?: number;   // Timestamp τελευταίας ενημέρωσης
  readyAt?: number;     // Timestamp όταν ολοκληρώθηκε/έγινε ready
  expiryAt?: number;    // Timestamp λήξης εγγύησης
}

export interface Note {
  id: string;
  userId: string;
  authorEmail: string;
  title: string;
  content: string;
  createdAt: number;
}

/**
 * Καταγραφή ενέργειας για το Audit Trail (Ιστορικό Διαγραφών/Αλλαγών).
 */
export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'RESTORE' | 'ERROR';
  targetId: string;
  targetWarrantyId: string;
  details: string;      // Περιγραφή της αλλαγής
  oldData?: any;        // Τα δεδομένα πριν την αλλαγή (για Restore)
  newData?: any;        // Τα δεδομένα μετά την αλλαγή
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  roles: UserRole[];
  category?: 'main' | 'views' | 'admin';
}

/**
 * Δυναμική παραμετροποίηση των καταστάσεων (Labels & Colors).
 */
export interface StatusConfig {
  label: string;
  color: string;
  allowedRoles: UserRole[];
}

export interface DashboardConfig {
  globalStats?: string[]; // Λίστα με τα κλειδιά των γενικών στατιστικών (TOTAL, PAID κλπ)
  featuredStatuses?: string[]; // Λίστα με τα κλειδιά των status που θέλουμε να φαίνονται ως κάρτες
  distributionStatuses?: string[]; // Ποιες καταστάσεις θα φαίνονται στο γράφημα κατανομής
  visibleCompanies?: string[]; // Ποιες εταιρείες θα φαίνονται στο γράφημα εταιρειών
  showAuditLog?: boolean; // Εμφάνιση ή απόκρυψη του Audit Log στο Dashboard
}

export interface SystemLimits {
  fetchLimit: number;
  inventoryPageSize: number;
  inventorySearchDelay: number;
  partSuggestionsDelay: number;
  dashboardAuditLogs: number;
  auditLogFetchLimit: number;
}

export interface AppBranding {
  appName: string;
  logoText: string;
}

/**
 * Κεντρικές ρυθμίσεις που αποθηκεύονται στο Firestore (/settings/garage-config).
 */
export interface GarageSettings {
  branding?: AppBranding;
  companyBrandMap: Record<string, string[]>; // Ποια brands ανήκουν σε ποια εταιρεία
  companyExpiryRules?: Record<string, string>; // Κανόνες λήξης ανά εταιρεία
  availableRoles?: string[];
  menuConfig?: MenuItem[];
  statusConfigs?: Record<string, StatusConfig>;
  statusOrder?: string[];
  dashboardConfig?: DashboardConfig;
  limits?: SystemLimits;
  expiryThresholds?: {
    warningDays: number;
    criticalDays: number;
    soonDays: number;
  };
  distributorRules?: DistributorRule[];
  aiPrompts?: {
    pdfExtraction?: string;
    botInstructions?: string;
  };
  rolePermissions?: Record<string, UserRole[]>;
  chatEnabled?: boolean;
}

/**
 * AI Feedback: Καταγράφει τις διορθώσεις που έκανε ο χρήστης στα αποτελέσματα του AI.
 */
export interface AIFeedback {
  id: string;
  timestamp: number;
  userId: string;
  company: string;      // Ο διανομέας στον οποίο αφορά το λάθος
  originalData: any;    // Τι έβγαλε το AI
  correctedData: any;   // Τι έγραψε ο χρήστης
  discrepancies: string[]; // Λίστα με τα πεδία που διέφεραν
}

/**
 * Μήνυμα στο Chat.
 */
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any; // Firestore Timestamp
  readBy: string[]; // Λίστα με τα IDs των χρηστών που είδαν το μήνυμα
}

/**
 * Παρουσία χρήστη στο Chat.
 */
export interface ChatPresence {
  uid: string;
  name: string;
  lastActive: any; // Firestore Timestamp
  chatOpen: boolean;
}

/**
 * Συγκεντρωτικά στατιστικά για το Dashboard (Aggregated Data Pattern).
 */
export interface GlobalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
  unpaid: number;
  lastUpdated?: number;
}
