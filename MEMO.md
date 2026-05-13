# 🗺️ Warranty H&K - Project Map & Architecture

Αυτό το αρχείο αποτελεί τον κεντρικό χάρτη της εφαρμογής. Εδώ περιγράφεται η δομή του κώδικα, η φιλοσοφία των αρχείων και οι αρμοδιότητες κάθε φακέλου.

---

## 🏗️ 1. Αρχιτεκτονική (Architecture)

Η εφαρμογή ακολουθεί μια δομή βασισμένη στο **React + Vite**, με **Firebase** για Backend και **Zustand** για State Management.

### Φιλοσοφία Φακέλων (Folder-as-Component)
Για να διατηρήσουμε τον κώδικα καθαρό, χρησιμοποιούμε το pattern **Folder-as-Component**. 
*   Κάθε σημαντικό component (Dashboard, Inventory, κλπ) έχει το δικό του φάκελο.
*   Το κύριο αρχείο είναι πάντα το `index.tsx`.
*   Τα δευτερεύοντα components του μένουν στον ίδιο φάκελο.

---

## 📂 2. Ανάλυση Δομής Αρχείων

### 📁 /src/components (UI Components)
-   `ui/`: Primitives (Buttons, Badges, Cards, PageHeaders).
-   `core/`: Κρίσιμα components (ErrorBoundary, StateManager, Overlays).
-   `layout/`: Στοιχεία layout (Sidebar, NoticeTicker, AppLayout).
-   `warranty/`: Components ειδικά για τη διαχείριση εγγυήσεων (Form, Card, Notes).
-   `maintenance/`: Διαχείριση βάσεων, ρυθμίσεων και AI.
-   `ChatBox/`: Σύστημα συνομιλίας (index.tsx + subcomponents).

### 📁 /src/screens (Βασικές Οθόνες - Screens)
Οθόνες που καλύπτουν ολόκληρο το viewport (εκτός AppLayout):
-   `LoginScreen.tsx`: Φόρμα εισόδου και υποδοχής.
-   `SplashScreen.tsx`: Οθόνη φόρτωσης (Loading).
-   `DisabledAccountScreen.tsx`: Οθόνη για απενεργοποιημένους λογαριασμούς.

### 📁 /src/views (Σελίδες - Views)
Κύριες σελίδες εντός του AppLayout:
-   `Dashboard/`: Στατιστικά, γραφήματα και επισκόπηση.
-   `Inventory/`: Κεντρική λίστα εγγυήσεων με φίλτρα και Batch Actions.
-   `WarrantyDetail/`: Αναλυτική προβολή και διαχείριση μιας εγγύησης.
-   `VehicleHistoryView/`: Ιστορικό εγγυήσεων ανά VIN.
-   `CustomerHistoryView.tsx`: Ιστορικό εγγυήσεων ανά κάτοχο/πελάτη.
-   `ExpiryTrackerView.tsx`: Παρακολούθηση λήξεων που δεν έχουν πληρωθεί.
-   `AuditLogView.tsx`: Ιστορικό ενεργειών (Logs).
-   `AiChat.tsx`: AI Assistant Page (Chat interface).
-   `Onboarding.tsx`: Οδηγός αρχικής ρύθμισης της εφαρμογής.

### 📁 /src/services (Backend & APIs)
-   `firebase/`: 
    -   `core.ts`: Αρχικοποίηση και κοινές αναφορές.
    -   `auth.ts`: Authentication και διαχείριση προφίλ.
    -   `db.ts`: Κεντρικό CRUD για εγγυήσεις.
    -   `registry.ts`: Διαχείριση μητρώων (Ανταλλακτικά, Οχήματα, Πελάτες).
    -   `entries/`: Υπο-μονάδες για Subscriptions, Batch operations και Restore.
    -   `aiFeedback.ts`: Αποθήκευση Feedback για τη βελτίωση του AI.
    -   `monitor.ts`: Παρακολούθηση Reads, Kill-Switch και Visibility-Aware Subscriptions.
    -   `audit-logger.ts`: Κεντρικό σύστημα καταγραφής ενεργειών (Audit Logs).
-   `gemini/`: 
    -   `index.ts`: Εξαγωγή δεδομένων από PDF/Images μέσω Gemini API.
-   `pdf.ts`: Δημιουργία PDF εγγράφων.

### 📁 /src/hooks (Custom React Hooks)
Οργανωμένα σε υποφακέλους ανά θεματική:
-   `core/`: `useAppState`, `useAppGlobalActions`, `useAppNavigation`, `useAppPermissions`, `useAppStats`, `useDebounce`, `useChatHook`.
-   `inventory/`: `useInventory`, `useInventoryFilters`, `useInventorySelection`, `useFilteredEntries`.
-   `warranty/`: `useWarrantyForm`, `useWarrantyFormState`, `useWarrantyCard`, `useWarrantyPDFScan`, `useWarrantyVinHistory`, `useWarrantyAIFeedback`.
-   `settings/`: `useSettingsActions`.

### 📁 /src/store (State Management)
-   `useStore.ts`: Κεντρικό Zustand store για global state (user, entries, settings, sidebar).

### 📁 /src/core (Core Config & Types)
-   `config.ts`: Ρυθμίσεις, μηνύματα και παράμετροι απόδοσης (π.χ. BATCH_SIZE).
-   `types.ts`: TypeScript Interfaces για όλη την εφαρμογή.
-   `constants.ts`: Σταθερές τιμές (π.χ. Brands, Companies).

### 📁 /src/utils (Helpers & Utilities)
-   `toast.ts`: Σύστημα ειδοποιήσεων.
-   `errorUtils.ts`: Διαχείριση σφαλμάτων Firebase.
-   `normalization.ts`: [NEW] Κεντρική κανονικοποίηση strings (trim, uppercase, ID formatting).
-   `visibilityManager.ts`: [NEW] Διαχείριση ορατότητας παραθύρου με Grace Period (60s) για οικονομία reads.
-   `warrantyLogic.ts`: Επιχειρηματική λογική (π.χ. υπολογισμός λήξης).
-   `formatters.ts`: Μορφοποίηση ημερομηνιών και κειμένων.

---

## ⚡ 3. Performance & Cost Optimization

Η εφαρμογή περιλαμβάνει προηγμένους μηχανισμούς για τη μείωση του κόστους στο Firebase:
1.  **Visibility-Aware Listeners**: Όλα τα real-time subscriptions σταματούν αυτόματα αν ο χρήστης αλλάξει tab για πάνω από 60 δευτερόλεπτα.
2.  **Cached Role Checks**: Οι έλεγχοι δικαιωμάτων γίνονται μέσω του Zustand store, αποφεύγοντας περιττά reads στη βάση.
3.  **Server-side Filtering**: Το Presence και οι αναζητήσεις φιλτράρονται στη βάση (where clauses) για ελαχιστοποίηση του bandwidth.

---

## 🛡️ 4. Security & Maintenance

1.  **Admin Safety Guards**: Απαγόρευση απενεργοποίησης/διαγραφής του τρέχοντος Admin από τον εαυτό του.
2.  **Audit Log Pruning**: Δυνατότητα μαζικής διαγραφής παλαιών αρχείων καταγραφής (π.χ. >30 ημέρες) από τον Admin.
3.  **Strict Normalization**: Αυτόματη μετατροπή όλων των IDs (VIN, Part Codes) σε Upper Case για αποφυγή διπλοεγγραφών.

---

## 📜 5. Κανόνες Ανάπτυξης (Development Rules)

1.  **File Headers:** Κάθε αρχείο ΠΡΕΠΕΙ να ξεκινά με ένα επεξηγηματικό JSDoc σχόλιο.
2.  **Naming:** PascalCase για Components, camelCase για hooks/variables.
3.  **Logic Separation:** Το UI δεν πρέπει να έχει fetches. Όλα τα fetches και το complex state ανήκουν σε Hooks ή Services.
4.  **Registry Consistency:** Όλα τα registries χρησιμοποιούν το `RegistryTabWrapper` για ομοιόμορφο UI.

---

*Τελευταία Ενημέρωση: 10 Μαΐου 2026*
