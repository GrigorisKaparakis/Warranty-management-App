
import { GarageSettings, MenuItem, StatusConfig, UserRole, ViewType } from './types';

/**
 * APP_CONFIG: Κεντρικό αρχείο ρυθμίσεων και προεπιλεγμένων δεδομένων.
 * Όλα τα hardcoded δεδομένα της εφαρμογής συγκεντρωμένα εδώ για εύκολη διαχείριση.
 */

/**
 * Καταστάσεις στις οποίες μπορεί να βρίσκεται μια εγγύηση (Enum).
 * Μεταφέρθηκε εδώ για να είναι συγκεντρωμένο με τα υπόλοιπα defaults.
 */
export enum EntryStatus {
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
  WORKSHOP = 'WORKSHOP',
  RETURNED = 'RETURNED',
  ALERT = 'ALERT',
  REJECTED = 'REJECTED',
  PENDING = 'WAITING', // Alias for backward compatibility if needed
  PAID = 'COMPLETED'   // Alias for backward compatibility if needed
}

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
  AUDIT_LOG_FETCH_LIMIT: 100,
  AI_CHAT_HISTORY: 50
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
 * PDF_CONFIG: Ρυθμίσεις για την εξαγωγή PDF.
 */
export const PDF_CONFIG = {
  FONTS: {
    NOTO_SANS_URL: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
  },
  DEFAULTS: {
    COMPANY_NAME: "ΟΝΟΜΑ ΕΤΑΙΡΕΙΑΣ",
  },
  COLORS: {
    PRIMARY: [15, 23, 42] as [number, number, number], // Slate 900
    SECONDARY: [100, 100, 100] as [number, number, number], // Gray
    ACCENT: [59, 130, 246] as [number, number, number], // Blue 500
    BACKGROUND_ALT: [248, 250, 252] as [number, number, number], // Slate 50
    WHITE: [255, 255, 255] as [number, number, number],
  },
  FONT_SIZES: {
    TITLE: 18,
    SUBTITLE: 12,
    BODY: 10,
    SMALL: 9,
    TINY: 8,
  }
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

/**
 * Βιβλιοθήκη Εικονιδίων (SVG Paths)
 */
export const ICONS: Record<string, string> = {
  dashboard: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
  entry: "M12 4v16m8-8H4",
  all: "M4 6h16M4 12h16m-7 6h7",
  paid: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  rejected: "M6 18L18 6M6 6l12 12",
  notes: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  maintenance: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  ai: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z",
  audit: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
};

/**
 * FULL_GARAGE_DEFAULTS: Οι πλήρεις προεπιλεγμένες ρυθμίσεις της εφαρμογής.
 * Χρησιμοποιούνται για την αρχικοποίηση της βάσης και ως fallback αν λείπει κάποια ρύθμιση.
 */
export const FULL_GARAGE_DEFAULTS: GarageSettings = {
  branding: {
    appName: "WARRANTY H&K",
    logoText: "H&K"
  },
  companyBrandMap: {
    "ΣΑΡΑΚΑΚΗΣ": ["HONDA", "MITSUBISHI", "VOLVO"],
    "ΤΕΟΜΟΤΟ": ["KAWASAKI", "PEUGEOT"],
    "KOSMOCAR": ["VOLKSWAGEN", "AUDI", "SKODA"]
  },
  companyExpiryRules: {
    "ΣΑΡΑΚΑΚΗΣ": "6 months",
    "ΤΕΟΜΟΤΟ": "END_OF_NEXT_MONTH",
    "KOSMOCAR": "12 months"
  },
  availableRoles: ['ADMIN', 'EMPLOYEE', 'USER'],
  menuConfig: [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'dashboard', roles: ['ADMIN'], category: 'main' },
    { id: 'entry', label: 'ΝΕΑ ΚΑΤΑΧΩΡΗΣΗ', icon: 'entry', roles: ['ADMIN'], category: 'main' },
    { id: 'all', label: 'ΟΛΕΣ ΟΙ ΕΓΓΥΗΣΕΙΣ', icon: 'all', roles: ['ADMIN'], category: 'main' },
    { id: 'paid', label: 'ΠΛΗΡΩΜΕΝΕΣ', icon: 'paid', roles: ['ADMIN'], category: 'views' },
    { id: 'rejected', label: 'ΑΠΟΡΡΙΦΘΕΙΣΕΣ', icon: 'rejected', roles: ['ADMIN'], category: 'views' },
    { id: 'expiryTracker', label: 'ΛΗΞΕΙΣ ΕΓΓΥΗΣΕΩΝ', icon: 'maintenance', roles: ['ADMIN'], category: 'views' },
    { id: 'notes', label: 'ΣΗΜΕΙΩΣΕΙΣ', icon: 'notes', roles: ['ADMIN'], category: 'views' },
    { id: 'vinSearch', label: 'ΑΝΑΖΗΤΗΣΗ VIN', icon: 'search', roles: ['ADMIN'], category: 'views' },
    { id: 'aiAssistant', label: 'AI ASSISTANT', icon: 'ai', roles: ['ADMIN'], category: 'views' },
    { id: 'auditLog', label: 'ΙΣΤΟΡΙΚΟ ΑΛΛΑΓΩΝ', icon: 'audit', roles: ['ADMIN', 'EMPLOYEE'], category: 'views' },
    { id: 'users', label: 'ΧΡΗΣΤΕΣ', icon: 'users', roles: ['ADMIN'], category: 'admin' },
    { id: 'maintenance', label: 'ΣΥΝΤΗΡΗΣΗ', icon: 'maintenance', roles: ['ADMIN'], category: 'admin' }
  ],
  statusConfigs: {
    'WAITING': { label: 'ΑΝΑΜΟΝΗ', color: '#f59e0b', allowedRoles: ['ADMIN'] },
    'WORKSHOP': { label: 'ΣΤΟ ΣΥΝΕΡΓΕΙΟ', color: '#3b82f6', allowedRoles: ['ADMIN'] },
    'COMPLETED': { label: 'ΟΛΟΚΛΗΡΩΘΗΚΕ', color: '#10b981', allowedRoles: ['ADMIN'] },
    'RETURNED': { label: 'ΕΠΙΣΤΡΑΦΗΚΕ', color: '#6366f1', allowedRoles: ['ADMIN'] },
    'ALERT': { label: 'ALERT', color: '#f43f5e', allowedRoles: ['ADMIN'] },
    'REJECTED': { label: 'ΑΠΟΡΡΙΦΘΗΚΕ', color: '#ef4444', allowedRoles: ['ADMIN'] }
  },
  statusOrder: ['WAITING', 'COMPLETED', 'WORKSHOP' , 'RETURNED', 'ALERT', 'REJECTED'],
  dashboardConfig: {
    globalStats: ['TOTAL', 'PAID', 'PENDING', 'REJECTED'],
    featuredStatuses: ['WAITING', 'WORKSHOP'],
    distributionStatuses: ['WAITING', 'WORKSHOP', 'COMPLETED', 'RETURNED', 'ALERT', 'REJECTED'],
    visibleCompanies: ['ΣΑΡΑΚΑΚΗΣ', 'KOSMOCAR'],
    showAuditLog: true
  },
  limits: {
    fetchLimit: 500,
    inventoryPageSize: 30,
    aiChatHistoryLimit: 50,
    dashboardAuditLogs: 5,
    auditLogFetchLimit: 100
  },
  expiryThresholds: {
    warningDays: 10,
    criticalDays: 7,
    soonDays: 30
  },
  rolePermissions: {
    'delete_entry': ['ADMIN'],
    'broadcast_notice': ['ADMIN'],
    'auditLog': ['ADMIN']
  }
};

export const UI_MESSAGES = {
  ERRORS: {
    SAVE_FAILED: "ΣΦΑΛΜΑ ΚΑΤΑ ΤΗΝ ΑΠΟΘΗΚΕΥΣΗ.",
    NOT_FOUND: "Η ΕΓΓΥΗΣΗ ΔΕΝ ΒΡΕΘΗΚΕ.",
    PERMISSION_DENIED: "ΔΕΝ ΕΧΕΤΕ ΔΙΚΑΙΩΜΑ ΓΙΑ ΑΥΤΗ ΤΗΝ ΕΝΕΡΓΕΙΑ.",
    GENERAL: "ΠΑΡΟΥΣΙΑΣΤΗΚΕ ΣΦΑΛΜΑ.",
    BATCH_UPDATE_FAILED: "ΣΦΑΛΜΑ ΚΑΤΑ ΤΗ ΜΑΖΙΚΗ ΕΝΗΜΕΡΩΣΗ.",
    BATCH_DELETE_FAILED: "ΣΦΑΛΜΑ ΚΑΤΑ ΤΗ ΜΑΖΙΚΗ ΔΙΑΓΡΑΦΗ.",
    DELETE_FAILED: "ΣΦΑΛΜΑ ΚΑΤΑ ΤΗ ΔΙΑΓΡΑΦΗ. ΔΟΚΙΜΑΣΤΕ ΞΑΝΑ.",
    ANALYSIS_FAILED: "ΑΠΟΤΥΧΙΑ ΑΝΑΛΥΣΗΣ ΕΓΓΡΑΦΟΥ.",
    SETTINGS_UPDATE_FAILED: "ΑΠΟΤΥΧΙΑ ΕΝΗΜΕΡΩΣΗΣ ΡΥΘΜΙΣΕΩΝ.",
    UNSUPPORTED_FILE: "ΜΗ ΥΠΟΣΤΗΡΙΖΟΜΕΝΟΣ ΤΥΠΟΣ ΑΡΧΕΙΟΥ. ΠΑΡΑΚΑΛΩ ΧΡΗΣΙΜΟΠΟΙΗΣΤΕ PDF Η ΕΙΚΟΝΑ."
  },
  SUCCESS: {
    SAVED: "Η ΕΓΓΡΑΦΗ ΑΠΟΘΗΚΕΥΤΗΚΕ ΕΠΙΤΥΧΩΣ.",
    DENSITY_CHANGED: "Η ΠΡΟΒΟΛΗ ΑΛΛΑΞΕ.",
    BATCH_UPDATED: (count: number) => `ΕΝΗΜΕΡΩΘΗΚΑΝ ${count} ΕΓΓΡΑΦΕΣ`,
    BATCH_DELETED: (count: number) => `ΔΙΑΓΡΑΦΗΚΑΝ ${count} ΕΓΓΡΑΦΕΣ`,
    DELETED: (id: string) => `Η ΕΓΓΥΗΣΗ ${id} ΔΙΑΓΡΑΦΗΚΕ ΕΠΙΤΥΧΩΣ.`,
    ANALYZED: "ΤΟ ΕΓΓΡΑΦΟ ΑΝΑΛΥΘΗΚΕ ΕΠΙΤΥΧΩΣ!",
    SETTINGS_UPDATED: "ΟΙ ΡΥΘΜΙΣΕΙΣ ΕΝΗΜΕΡΩΘΗΚΑΝ ΕΠΙΤΥΧΩΣ."
  },
  LABELS: {
    EDIT: "ΕΠΕΞΕΡΓΑΣΙΑ",
    NEW_ENTRY: "ΝΕΑ ΚΑΤΑΧΩΡΗΣΗ",
    AI_SCAN: "AI SCAN DOCUMENT",
    SELECT_OPTION: "ΕΠΙΛΕΞΤΕ",
    NOTES_SECTION: "ΠΑΡΑΤΗΡΗΣΕΙΣ",
    NOTES_PLACEHOLDER: "ΛΕΠΤΟΜΕΡΕΙΕΣ ΕΓΓΥΗΣΗΣ...",
    CANCEL: "ΑΚΥΡΩΣΗ",
    SAVE: "ΑΠΟΘΗΚΕΥΣΗ",
    PROCESSING: "ΕΠΕΞΕΡΓΑΣΙΑ...",
    VIN_WARNING: "ΠΡΟΕΙΔΟΠΟΙΗΣΗ VIN",
    FIX: "ΔΙΟΡΘΩΣΗ",
    CONTINUE: "ΣΥΝΕΧΕΙΑ",
    PAID: "PAID",
    UNPAID: "UNPAID",
    NO_PARTS: "ΧΩΡΙΣ ΑΝΤΑΛΛΑΚΤΙΚΑ",
    NO_DESCRIPTION: "ΧΩΡΙΣ ΠΕΡΙΓΡΑΦΗ",
    NO_RESULTS: "ΔΕΝ ΒΡΕΘΗΚΕ ΤΙΠΟΤΑ",
    LOAD_MORE: "ΠΡΟΒΟΛΗ ΠΕΡΙΣΣΟΤΕΡΩΝ",
    CLEAR_FILTERS: "ΚΑΘΑΡΙΣΜΟΣ",
    BULK_SELECT: "ΜΑΖΙΚΗ ΕΠΙΛΟΓΗ",
    EXPORT_PDF: "EXPORT PDF",
    SELECTED: "ΕΠΙΛΕΓΜΕΝΑ",
    STATUS: "ΚΑΤΑΣΤΑΣΗ",
    CHOOSE: "ΕΠΙΛΟΓΗ...",
    DELETE: "ΔΙΑΓΡΑΦΗ",
    PREVIOUS_VISITS: "ΠΡΟΗΓΟΥΜΕΝΕΣ ΕΠΙΣΚΕΨΕΙΣ",
    NO_REMARKS: "ΚΑΜΙΑ ΠΑΡΑΤΗΡΗΣΗ.",
    PARTS: "ΑΝΤΑΛΛΑΚΤΙΚΑ",
    CODE: "ΚΩΔΙΚΟΣ",
    DESCRIPTION: "ΠΕΡΙΓΡΑΦΗ",
    UPDATE: "ΕΝΗΜΕΡΩΣΗ",
    ADD: "ΠΡΟΣΘΗΚΗ",
    VIN_CHASSIS: "VIN (ΑΡ. ΠΛΑΙΣΙΟΥ)",
    HISTORY: "ΙΣΤΟΡΙΚΟ",
    COMPANY: "ΕΤΑΙΡΕΙΑ",
    BRAND_MODEL: "ΜΑΡΚΑ / ΜΟΝΤΕΛΟ",
    CUSTOMER: "ΠΕΛΑΤΗΣ",
    ENTRY_DATE: "ΗΜΕΡΟΜΗΝΙΑ ΚΑΤΑΧΩΡΗΣΗΣ",
    WARRANTY_ID: "ΑΡ. ΕΓΓΥΗΣΗΣ",
    NOTES: "ΣΗΜΕΙΩΣΕΙΣ",
    NO_NOTES: "ΔΕΝ ΥΠΑΡΧΟΥΝ ΣΗΜΕΙΩΣΕΙΣ",
    ADD_NOTE: "ΠΡΟΣΘΗΚΗ ΣΗΜΕΙΩΣΗΣ",
    TITLE: "ΤΙΤΛΟΣ",
    WRITE_NOTE: "ΓΡΑΨΤΕ ΤΗ ΣΗΜΕΙΩΣΗ ΕΔΩ...",
    CONFIRM_ACTION: "ΕΠΙΒΕΒΑΙΩΣΗ;",
    NO_TITLE: "ΧΩΡΙΣ ΤΙΤΛΟ"
  },
  CONFIRMATIONS: {
    DELETE_BATCH: (count: number) => `ΕΙΣΤΕ ΣΙΓΟΥΡΟΙ ΟΤΙ ΘΕΛΕΤΕ ΝΑ ΔΙΑΓΡΑΨΕΤΕ ${count} ΕΓΓΡΑΦΕΣ;`
  }
};

/**
 * AI_CONFIG: Ρυθμίσεις για το Google Gemini API.
 * Περιλαμβάνει τα μοντέλα και τα βασικά prompts (System Instructions).
 */
export const AI_CONFIG = {
  MODELS: {
    DEFAULT: 'gemini-3-flash-preview',
    OCR: 'gemini-3-flash-preview',
    ANALYSIS: 'gemini-3-flash-preview'
  },
  BASE_PROMPTS: {
    ASSISTANT: `You are a professional business consultant for Warranty H&K, a high-end vehicle garage.
    Respond strictly in GREEK.
    Be professional, data-driven, and concise.
    Format with bullet points for readability.`,
    
    OCR_WARRANTY: `You are a professional vehicle warranty document auditor. 
    Identify the DISTRIBUTOR (company) and BRAND based on the following DYNAMIC MAPPING RULES:
    
    {{rules}}

    DATA EXTRACTION REQUIREMENTS:
    - warrantyId: The unique ID of the document.
    - vin: Exactly 17 characters (Vehicle Identification Number).
    - fullName: Customer's full name.
    - parts: Array of objects {code, description, quantity}.

    CRITICAL INSTRUCTIONS:
    - EXCLUDE any items that represent LABOR, WORK, or SERVICE CODES (e.g. "ΕΡΓΑΣΙΑ", "LABOR", "WORK", "SERVICE", or codes like "99-99-99").
    - ONLY include physical spare parts (ΑΝΤΑΛΛΑΚΤΙΚΑ).
    - If a part description contains "LABOR" or "ΕΡΓΑΣΙΑ", DO NOT include it.

    OUTPUT: Return ONLY a valid JSON object matching the requested schema. If a field is not found, return an empty string or 0 for numbers.`,

    NOTE_ANALYSIS: `Analyze the following garage note content and provide:
    1. SENTIMENT: Positive, Negative, or Neutral.
    2. CATEGORY: Choose the best fit from this list: [{{categories}}].

    CONTENT: "{{content}}"

    OUTPUT: Return ONLY a valid JSON object with keys "sentiment" and "category".`
  }
};


export const ONBOARDING_DEFAULTS = {
  INITIAL_STATUSES: [EntryStatus.WAITING, EntryStatus.REJECTED],
  DEFAULT_ROLES: FULL_GARAGE_DEFAULTS.availableRoles,
  DEFAULT_USER_ROLE: 'USER'
};

export const DEFAULT_MENU = FULL_GARAGE_DEFAULTS.menuConfig;
export const DEFAULT_STATUS_CONFIGS = FULL_GARAGE_DEFAULTS.statusConfigs;
export const DEFAULT_PERMISSIONS = FULL_GARAGE_DEFAULTS.rolePermissions;

