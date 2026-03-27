import { useState, useEffect } from 'react';

/**
 * useDebounce: Hook που καθυστερεί την ενημέρωση μιας τιμής.
 * Χρήσιμο για αναζητήσεις ώστε να μην εκτελείται το φιλτράρισμα σε κάθε πάτημα πλήκτρου.
 * 
 * @param value Η τιμή που θέλουμε να καθυστερήσουμε
 * @param delay Η καθυστέρηση σε milliseconds (προεπιλογή 300ms)
 * @returns Η καθυστερημένη τιμή
 */
export function useDebounce<T>(value: T, delay: number = 600): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
