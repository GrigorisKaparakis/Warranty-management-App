/**
 * useWarrantyVinHistory.ts: Hook για την παρακολούθηση ιστορικού βάσει VIN.
 * Αυτόματα ανακτά προηγούμενες εγγραφές και προτείνει στοιχεία (Μάρκα, Ιδιοκτήτη).
 */
import { useState, useEffect } from 'react';
import { Entry } from '../../core/types';
import { VALIDATION_RULES } from '../../core/config';
import { useStore } from '../../store/useStore';

export const useWarrantyVinHistory = (
  vin: string,
  editingEntry: any,
  setFormData: React.Dispatch<React.SetStateAction<any>>
) => {
  const entries = useStore(s => s.entries);
  const vehiclesRegistry = useStore(s => s.vehicles);
  const [vinHistory, setVinHistory] = useState<Entry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const cleanVin = vin.trim().toUpperCase();
    if (cleanVin.length === VALIDATION_RULES.VIN_LENGTH && !editingEntry) {
      const knownVehicle = vehiclesRegistry.find(v => v.vin === cleanVin);
      if (knownVehicle) {
        setFormData(prev => ({
          ...prev,
          brand: knownVehicle.brand || prev.brand,
          fullName: knownVehicle.ownerName || prev.fullName
        }));
      }
    }
    if (cleanVin.length >= 6) {
      const history = entries.filter(e => 
        e.vin.toUpperCase().endsWith(cleanVin) && 
        (!editingEntry || e.id !== editingEntry.id)
      ).sort((a,b) => b.createdAt - a.createdAt);
      setVinHistory(history);
    } else {
      setVinHistory([]);
      setShowHistory(false);
    }
  }, [vin, entries, editingEntry, vehiclesRegistry, setFormData]);

  return { vinHistory, showHistory, setShowHistory };
};
