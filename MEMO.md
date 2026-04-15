# 📝 PROJECT MEMO: Warranty H&K - Πλήρης Ανάλυση Εφαρμογής

Αυτό το έγγραφο αποτελεί την κεντρική πηγή τεκμηρίωσης για την εφαρμογή **Warranty H&K**. Περιλαμβάνει την ανάλυση της δομής, της αρχιτεκτονικής, των εργαλείων και των λειτουργιών του συστήματος.

---

## 🏗️ 1. Αρχιτεκτονική & Φιλοσοφία (Refactoring Logic)

Η εφαρμογή ακολουθεί το πρότυπο **Separation of Concerns (Διαχωρισμός Αρμοδιοτήτων)**, διαχωρίζοντας τη λογική (Logic) από την εμφάνιση (UI).

### 🔄 Custom Hooks (Η "Λογική")
Τα hooks διαχειρίζονται όλη τη λειτουργικότητα. Αν αλλάξει ο τρόπος επεξεργασίας των δεδομένων, η αλλαγή γίνεται στο hook και όχι στο component.
*   **`useWarrantyForm.ts`**: Διαχείριση φόρμας, AI OCR scanning, επικύρωση VIN και αποθήκευση.
*   **`useInventory.ts`**: Φιλτράρισμα, ταξινόμηση, σελιδοποίηση και μαζικές ενέργειες (Bulk Actions).
*   **`useWarrantyCard.ts`**: Ενέργειες ανά εγγραφή (αλλαγή status, πληρωμή, αντιγραφή στοιχείων).
*   **`useAppState.ts`**: Κεντρικό hook για πρόσβαση στο παγκόσμιο state (Zustand) και υπολογισμένες τιμές (π.χ. αν ο χρήστης είναι Admin).

### 🎨 Components (Η "Εμφάνιση")
Τα components είναι πλέον "Presentational" (χαζά), παίρνοντας δεδομένα από τα hooks.
*   **`WarrantyForm.tsx`**: Καθαρό JSX για τη φόρμα εισαγωγής.
*   **`Inventory.tsx`**: Προβολή της λίστας και των φίλτρων.
*   **`WarrantyCard.tsx`**: Οπτική αναπαράσταση μιας εγγύησης.

---

## 📂 2. Ανάλυση Δομής Αρχείων

### 📁 / (Root)
*   **`App.tsx`**: Κεντρικό component, διαχείριση Routing και Auth State.
*   **`index.tsx`**: Το entry point της εφαρμογής React.
*   **`index.css`**: Κεντρικό αρχείο στυλ (Tailwind CSS).
*   **`firebase-blueprint.json`**: Ορισμός δομής Firestore (Entities & Collections).
*   **`firestore.rules`**: Κανόνες ασφαλείας για τη βάση δεδομένων.
*   **`metadata.json`**: Ρυθμίσεις πλατφόρμας (Permissions, App Name).
*   **`CHANGELOG.md`**: Ιστορικό εκδόσεων και αλλαγών.
*   **`MEMO.md`**: Το παρόν έγγραφο τεκμηρίωσης.
*   **`package.json`**: Διαχείριση εξαρτήσεων και scripts.
*   **`vite.config.ts`**: Ρυθμίσεις του Vite build tool.

### 📁 /src/core
*   **`config/`**: Κεντρική παραμετροποίηση χωρισμένη σε 6 αρχεία:
    *   `defaults.ts`: Προεπιλεγμένες τιμές εφαρμογής.
    *   `icons.ts`: Κεντρική διαχείριση εικονιδίων (Lucide).
    *   `messages.ts`: Κείμενα και μηνύματα συστήματος (UI_MESSAGES).
    *   `services.ts`: Ρυθμίσεις εξωτερικών υπηρεσιών.
    *   `ui.ts`: Ρυθμίσεις εμφάνισης και layout.
    *   `index.ts`: Export όλων των παραπάνω.
*   **`types.ts`**: TypeScript Interfaces για όλη την εφαρμογή (Entry, User, Settings κλπ).

### 📁 /src/services (Εργαλεία & Υπηρεσίες)
*   **`gemini.ts`**: Η "καρδιά" του AI. OCR ανάλυση PDF/Εικόνων και AI Assistant.
*   **`pdf.ts`**: Δημιουργία επαγγελματικών PDF εγγράφων.
*   **`firebase/`**: (11 αρχεία)
    *   `core.ts`: Αρχικοποίηση Firebase SDK.
    *   `auth.ts`: Login/Logout και διαχείριση χρήστη.
    *   `db.ts`: Βασικές CRUD λειτουργίες Firestore.
    *   `entries.ts`: Εξειδικευμένες λειτουργίες για τις εγγυήσεις.
    *   `registry.ts`: Διαχείριση μητρώων (Οχήματα, Πελάτες, Ανταλλακτικά).
    *   `notes.ts`: Λειτουργίες για το Note Board.
    *   `aiFeedback.ts`: Αποθήκευση feedback για τις απαντήσεις του AI.
    *   `monitor.ts`: **Κρίσιμο εργαλείο** παρακολούθησης reads και real-time updates.
    *   `admin/`:
        *   `BaseAdminService.ts`: Βασική κλάση για admin λειτουργίες.
        *   `MaintenanceService.ts`: Εργαλεία διαχείρισης, καθαρισμού και migrations.
        *   `index.ts`: Export των admin services.

### 📁 /src/views (Σελίδες - 9 αρχεία)
*   **`Dashboard.tsx`**: Στατιστικά, γραφήματα και πρόσφατη δραστηριότητα.
*   **`Inventory.tsx`**: Η κεντρική λίστα εγγυήσεων.
*   **`WarrantyDetailView.tsx`**: Αναλυτική προβολή μιας συγκεκριμένης εγγύησης.
*   **`AiChat.tsx`**: AI Assistant για ερωτήσεις πάνω στα δεδομένα.
*   **`AuditLogView.tsx`**: Ιστορικό αλλαγών (ποιος, πότε, τι άλλαξε).
*   **`ExpiryTrackerView.tsx`**: Παρακολούθηση εγγυήσεων που λήγουν.
*   **`VehicleHistoryView.tsx`**: Ιστορικό εγγυήσεων ανά αριθμό πλαισίου (VIN).
*   **`CustomerHistoryView.tsx`**: Ιστορικό εγγυήσεων ανά πελάτη.
*   **`Onboarding.tsx`**: Οδηγός αρχικής παραμετροποίησης.

### 📁 /src/utils (Βοηθητικά Εργαλεία)
*   **`dateUtils.ts`**: Διαχείριση ημερομηνιών και format.
*   **`auditUtils.ts`**: Logic για τη δημιουργία audit logs και smart diffs.
*   **`errorUtils.ts`**: Κεντρική διαχείριση και μορφοποίηση σφαλμάτων.
*   **`toast.ts`**: Wrapper για το σύστημα ειδοποιήσεων (Sonner).
*   **`warrantyLogic.ts`**: Υπολογισμοί και κανόνες για τις εγγυήσεις.

### 📁 /src/store (Global State - Zustand)
*   **`useStore.ts`**: Ο κεντρικός store που ενώνει όλα τα slices.
*   **`slices/`**: Διαχωρισμός state ανά θεματική:
    *   `authSlice.ts`: State χρήστη και δικαιωμάτων.
    *   `warrantySlice.ts`: State εγγυήσεων και φίλτρων.
    *   `settingsSlice.ts`: Ρυθμίσεις εφαρμογής και branding.
    *   `uiSlice.ts`: State για modals, sidebar και overlays.
    *   `aiSlice.ts`: Ιστορικό chat και AI states.

### 📁 /src/hooks (Custom Logic)
*   **`useAppState.ts`**: Πρόσβαση στο global state και υπολογισμένες τιμές.
*   **`useInventory.ts`**: Logic για τη λίστα (φίλτρα, pagination, bulk actions).
*   **`useWarrantyForm.ts`**: Διαχείριση φόρμας, OCR και validation.
*   **`useWarrantyCard.ts`**: Ενέργειες ανά εγγραφή.
*   **`useAppNavigation.ts`**: Διαχείριση πλοήγησης και μενού.
*   **`useAppPermissions.ts`**: Έλεγχος δικαιωμάτων (RBAC).
*   **`useAppStats.ts`**: Υπολογισμός στατιστικών για το dashboard.
*   **`useFilteredEntries.ts`**: Εξειδικευμένο φιλτράρισμα δεδομένων.
*   **`useInventoryFilters.ts`**: Logic για τα UI φίλτρα.
*   **`useInventorySelection.ts`**: Διαχείριση επιλογής πολλαπλών εγγραφών.
*   **`useSettingsActions.ts`**: Ενέργειες για τις ρυθμίσεις admin.
*   **`useDebounce.ts`**: Utility hook για καθυστέρηση εκτέλεσης (search).
*   **`useAppFileDrop.ts`**: Διαχείριση drag & drop αρχείων σε όλη την εφαρμογή.

### 📁 /src/components (UI Components)
*   **`core/`**: Κεντρικά components συστήματος (ErrorBoundary, StateManager).
*   **`layout/`**: Στοιχεία layout (Sidebar, NoticeTicker, Header).
*   **`ui/`**: Επαναχρησιμοποιήσιμα UI στοιχεία (Modals, Tables, Buttons, Inputs).
*   **`warranty/`**: Components ειδικά για τις εγγυήσεις (WarrantyCard, WarrantyForm, NoteBoard).
*   **`maintenance/`**: Components για το Admin Panel (Settings, Tools, Security).

---

## 🛠️ 3. Κύρια Εργαλεία & Λειτουργίες

### 🤖 AI Engine (Google Gemini)
*   **OCR Scanning**: Αυτόματη ανάγνωση PDF ή φωτογραφιών εγγύησης. Εξάγει VIN, ανταλλακτικά και στοιχεία πελάτη με βάση δυναμικούς κανόνες (Distributor Rules).
*   **AI Assistant**: Συνομιλία με το Gemini που έχει πρόσβαση στα δεδομένα των εγγυήσεων για ανάλυση και απαντήσεις.
*   **Sentiment Analysis**: Αυτόματη ανάλυση συναισθήματος και κατηγοριοποίηση στις σημειώσεις (Note Board).

### 📊 Διαχείριση Δεδομένων (Firestore)
*   **Dynamic Registries**: Αυτόματη ενημέρωση μητρώων για Οχήματα, Πελάτες και Ανταλλακτικά κατά την αποθήκευση μιας εγγύησης.
*   **Audit Logs**: Πλήρες ιστορικό αλλαγών με "Smart Diff" (σύγκριση παλιάς και νέας τιμής).

### ⚙️ Maintenance Panel (Admin)
*   **AppSettings**: Αλλαγή λογοτύπου, χρωμάτων και καταστάσεων (Statuses).
*   **Database Settings**: Επεξεργασία των μητρώων (Registry).
*   **Security Settings**: Διαχείριση δικαιωμάτων ανά ρόλο (RBAC).
*   **Data Tools**: Εργαλεία για μαζικές διορθώσεις και migrations.

---

## 🚀 4. Future Roadmap (Μελλοντικά Βήματα)

### 📅 ΕΚΔΟΣΗ 1.1.1 (ΝΕΕΣ ΛΕΙΤΟΥΡΓΙΕΣ)
1.  **Virtual Scrolling**: Ενσωμάτωση `react-virtuoso` για ομαλή διαχείριση χιλιάδων εγγραφών.
2.  **Dark Mode**: Υποστήριξη σκοτεινής εμφάνισης για χρήση σε περιβάλλοντα συνεργείου.
3.  **Excel/CSV Export**: Εξαγωγή φιλτραρισμένων λιστών για λογιστική χρήση.

---
*Τελευταία ενημέρωση: 2 Απριλίου 2026*
