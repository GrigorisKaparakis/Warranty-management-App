import { GarageSettings } from '../types';

/**
 * Καταστάσεις στις οποίες μπορεί να βρίσκεται μια εγγύηση (Enum).
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
    "ΣΑΡΑΚΑΚΗΣ": ["HONDA"],
    "KSR": ["KAWASAKI"],
    "KOSMOCAR": ["DUCATI"]
  },
  companyExpiryRules: {
    "ΣΑΡΑΚΑΚΗΣ": "6 months",
    "KSR": "END_OF_NEXT_MONTH",
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
    inventorySearchDelay: 600,
    partSuggestionsDelay: 500,
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

export const ONBOARDING_DEFAULTS = {
  INITIAL_STATUSES: [EntryStatus.WAITING, EntryStatus.REJECTED],
  DEFAULT_ROLES: FULL_GARAGE_DEFAULTS.availableRoles,
  DEFAULT_USER_ROLE: 'USER'
};

export const DEFAULT_MENU = FULL_GARAGE_DEFAULTS.menuConfig;
export const DEFAULT_STATUS_CONFIGS = FULL_GARAGE_DEFAULTS.statusConfigs;
export const DEFAULT_PERMISSIONS = FULL_GARAGE_DEFAULTS.rolePermissions;
