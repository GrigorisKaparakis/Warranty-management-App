/**
 * APP_DEFAULTS: Κεντρικό αρχείο ρυθμίσεων και προεπιλεγμένων δεδομένων.
 */
export const APP_DEFAULTS = {
  NAME: "MYCOMPANY",
  LOGO: "LOGO",
  SPLASH_TEXT: "ΦΟΡΤΩΣΗ...",
  DESCRIPTION: "PROFESSIONAL WARRANTY MANAGEMENT AND REGISTRY SYSTEM WITH SMART ANALYSIS AND PDF EXPORT CAPABILITIES.",
  TOAST_DURATION: 4000,
};

/**
 * PERFORMANCE_CONFIG: Ρυθμίσεις για την απόδοση της εφαρμογής.
 * Περιλαμβάνει χρονικά όρια (debounce) και μεγέθη παρτίδων (batch sizes).
 */
export const PERFORMANCE_CONFIG = {
  DEBOUNCE: {
    INVENTORY_SEARCH: 600,
    PART_SUGGESTIONS: 500,
  },
  FIRESTORE: {
    BATCH_SIZE: 500,
  }
};

/**
 * UI_LIMITS: Όρια εμφάνισης στοιχείων στο UI.
 */
export const UI_LIMITS = {
  FETCH_LIMIT: 500,
  INVENTORY_PAGE_SIZE: 30,
  DASHBOARD_FEATURED_STATUSES: 2,
  DASHBOARD_AUDIT_LOGS: 5,
  DASHBOARD_TOP_COMPANIES: 5,
  AUDIT_LOG_FETCH_LIMIT: 100
};

/**
 * UI_THRESHOLDS: Κατώφλια και χρονικά όρια για ειδοποιήσεις.
 */
export const UI_THRESHOLDS = {
  EXPIRY_WARNING_DAYS: 10,
  EXPIRY_CRITICAL_DAYS: 7,
  EXPIRY_SOON_DAYS: 30,
  RECENT_ACTIVITY_HOURS: 24
};

/**
 * VALIDATION_RULES: Κανόνες επικύρωσης δεδομένων.
 */
export const VALIDATION_RULES = {
  VIN_LENGTH: 17,
};

/**
 * SORT_CONFIG: Προεπιλεγμένες ρυθμίσεις ταξινόμησης.
 */
export const SORT_CONFIG = {
  INVENTORY: {
    key: 'createdAt' as 'createdAt' | 'warrantyId' | 'fullName' | 'brand',
    order: 'desc' as 'asc' | 'desc',
  }
};

/**
 * LOG_CONFIG: Ρυθμίσεις για το ιστορικό αλλαγών (Logs).
 */
export const LOG_CONFIG = {
  DATE_LOCALE: 'el-GR',
  FALLBACK_USER: 'UNKNOWN',
  FORMAT: (username: string, label: string, dateStr: string, timeStr: string) => 
    `[${username}] ${label} ΣΤΙΣ ${dateStr} ${timeStr}`,
};

export const DB_CONFIG = {
  COLLECTIONS: {
    ENTRIES: "entries",
    NOTES: "notes",
    USERS: "users",
    AUDIT: "audit_logs",
    NOTICES: "notices",
    PARTS: "parts",
    VEHICLES: "vehicles",
    CUSTOMERS: "customers",
    SETTINGS: "settings"
  },
  SETTINGS_DOC_ID: "garage-config"
};
