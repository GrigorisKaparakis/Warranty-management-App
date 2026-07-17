
import React, { useEffect } from 'react';
import { MigrationScreen } from '@/screens/MigrationScreen';

/**
 * App: Το κεντρικό component (Root) της εφαρμογής.
 * Πλέον εμφανίζει αποκλειστικά τη σελίδα ενημέρωσης για τη μεταφορά της πλατφόρμας.
 */
const App: React.FC = () => {
  useEffect(() => {
    document.title = "H&K Warranty - Μεταφορά Συστήματος";
  }, []);

  return <MigrationScreen />;
};

export default App;

