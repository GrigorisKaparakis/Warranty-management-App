/**
 * normalization.ts: Κεντρικές συναρτήσεις για την ομογενοποίηση κειμένων.
 * Διασφαλίζουν ότι VIN, κωδικοί και ονόματα αποθηκεύονται με το ίδιο φορμάτ (Uppercase/Trim)
 * για να αποφεύγονται διπλοεγγραφές και σφάλματα στην αναζήτηση.
 */

/**
 * Καθαρίζει ένα κείμενο από κενά και το μετατρέπει σε κεφαλαία.
 */
export const normalizeString = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.trim().toUpperCase();
};

/**
 * Ειδικός καθαρισμός για VIN: Αφαιρεί όλα τα κενά και μετατρέπει σε κεφαλαία.
 */
export const normalizeVin = (vin: string | undefined | null): string => {
  if (!vin) return '';
  return vin.replace(/\s/g, '').toUpperCase();
};

/**
 * Δημιουργεί ένα ID ασφαλές για χρήση ως Document ID στο Firestore.
 * Αντικαθιστά επικίνδυνους χαρακτήρες (/, #, $, .) με παύλες.
 */
export const createFirestoreId = (text: string): string => {
  return normalizeString(text).replace(/[\/\.\#\$\s]/g, '-');
};

/**
 * Κανονικοποιεί την περιγραφή ενός ανταλλακτικού.
 * Αντικαθιστά κενά ή default τιμές ιστορικού με παύλα (-).
 */
export const normalizeDescription = (desc: string | undefined | null): string => {
  const clean = (desc || '').trim();
  if (!clean || clean === 'ΠΕΡΙΓΡΑΦΗ ΑΠΟ ΙΣΤΟΡΙΚΟ') return '-';
  return clean;
};
