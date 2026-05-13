/**
 * useWarrantyFormState.ts: Hook διαχείρισης της εσωτερικής κατάστασης (State) της φόρμας.
 * Διαχειρίζεται το φόρτωμα δεδομένων για επεξεργασία, την κατανάλωση AI δεδομένων και τα πεδία της φόρμας.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Entry, Part } from '../../core/types';
import { EntryStatus, UI_MESSAGES } from '../../core/config';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';

export const useWarrantyFormState = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editingEntry = useStore(s => s.editingEntry);
  const setEditingEntry = useStore(s => s.setEditingEntry);
  const aiExtractedData = useStore(s => s.aiExtractedData);
  const setAiExtractedData = useStore(s => s.setAiExtractedData);
  const entries = useStore(s => s.entries);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [isLoading, setIsLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    warrantyId: '', vin: '', company: '', brand: '', fullName: '', notes: '', isPaid: false, 
    status: 'WAITING' as EntryStatus, createdAt: getTodayStr()
  });
  
  const [formParts, setFormParts] = useState<Omit<Part, 'id'>[]>([]);

  // Load entry from URL
  useEffect(() => {
    if (id && entries.length > 0) {
      const found = entries.find(e => e.id === id);
      if (found) setEditingEntry(found);
      else {
        toast.error(UI_MESSAGES.ERRORS.NOT_FOUND);
        navigate('/warranty/inventory');
      }
    }
  }, [id, entries, setEditingEntry, navigate]);

  // AI Data fill
  useEffect(() => {
    if (aiExtractedData && !editingEntry) {
      setFormData(prev => ({
        ...prev,
        vin: (aiExtractedData.vin || prev.vin).trim().toUpperCase(),
        warrantyId: (aiExtractedData.warrantyId || prev.warrantyId).trim().toUpperCase(),
        fullName: (aiExtractedData.fullName || prev.fullName).trim(),
        brand: (aiExtractedData.brand || prev.brand).trim().toUpperCase(),
        company: (aiExtractedData.company || prev.company).trim().toUpperCase()
      }));
      if (aiExtractedData.parts) {
        const partsArray = Array.isArray(aiExtractedData.parts) 
          ? aiExtractedData.parts 
          : Object.values(aiExtractedData.parts);
          
        setFormParts(partsArray.map((p: any) => ({
          ...p,
          code: (p.code || '').trim().toUpperCase(),
          description: (p.description || '').trim(),
          isReady: false
        })));
      }
      // Clear AI data after consumption
      setAiExtractedData(null);
    }
  }, [aiExtractedData, editingEntry, setAiExtractedData]);

  // Edit entry fill or clear
  useEffect(() => {
    if (editingEntry) {
      setFormData({
        warrantyId: editingEntry.warrantyId,
        vin: editingEntry.vin,
        company: editingEntry.company,
        brand: editingEntry.brand,
        fullName: editingEntry.fullName,
        notes: editingEntry.notes || '',
        isPaid: editingEntry.isPaid,
        status: editingEntry.status as EntryStatus,
        createdAt: new Date(editingEntry.createdAt).toISOString().split('T')[0]
      });
      setFormParts(editingEntry.parts);
    } else {
      setFormData({
        warrantyId: '', 
        vin: '', 
        company: '', 
        brand: '', 
        fullName: '', 
        notes: '', 
        isPaid: false, 
        status: 'WAITING' as EntryStatus, 
        createdAt: getTodayStr()
      });
      setFormParts([]);
    }
  }, [editingEntry]);

  return {
    formData, setFormData,
    formParts, setFormParts,
    isLoading, setIsLoading,
    scanStatus, setScanStatus,
    pendingSave, setPendingSave,
    editingEntry, setEditingEntry,
    setAiExtractedData,
    navigate
  };
};
