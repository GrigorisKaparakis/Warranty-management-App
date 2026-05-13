/**
 * useWarrantyForm.ts: Ο κεντρικός ενορχηστρωτής (Orchestrator) της φόρμας εγγύησης.
 * Συνδυάζει το state, το PDF scanning και το VIN history για τη διαχείριση της εγγραφής.
 */
import { FirestoreService } from '../../services/firebase/db';
import { VALIDATION_RULES, UI_MESSAGES } from '../../core/config';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';
import { getCompletionUpdates } from '../../utils/warrantyLogic';
import { formatError } from '../../utils/errorUtils';

// Sub-hooks
import { useWarrantyFormState } from './useWarrantyFormState';
import { useWarrantyPDFScan } from './useWarrantyPDFScan';
import { useWarrantyAIFeedback } from './useWarrantyAIFeedback';
import { useWarrantyVinHistory } from './useWarrantyVinHistory';

export const useWarrantyForm = () => {
  const user = useStore(s => s.user);
  const settings = useStore(s => s.settings);
  const triggerRefetch = useStore(s => s.triggerRefetch);
  const originalAiData = useStore(s => s.originalAiData);
  const setOriginalAiData = useStore(s => s.setOriginalAiData);

  const {
    formData, setFormData,
    formParts, setFormParts,
    isLoading, setIsLoading,
    scanStatus, setScanStatus,
    pendingSave, setPendingSave,
    editingEntry, setEditingEntry,
    setAiExtractedData,
    navigate
  } = useWarrantyFormState();

  const { handleScanPDF } = useWarrantyPDFScan(setIsLoading, setScanStatus, formData.company);
  const { compareAndSaveFeedback } = useWarrantyAIFeedback();
  const { vinHistory, showHistory, setShowHistory } = useWarrantyVinHistory(formData.vin, editingEntry, setFormData);

  const executeSave = async (payload: any) => {
    setIsLoading(true);
    try {
      // AI Feedback Loop
      await compareAndSaveFeedback(originalAiData, formData, formParts, editingEntry);

      if (editingEntry) await FirestoreService.updateEntry(editingEntry.id, payload, editingEntry);
      else await FirestoreService.addEntry(payload);
      
      // Registry updates
      const registryUpdates = [
        ...formParts.map(p => FirestoreService.upsertPart(p.code, p.description, formData.brand)),
        FirestoreService.upsertVehicle(formData.vin, formData.brand, formData.fullName),
        FirestoreService.upsertCustomer(formData.fullName, formData.vin)
      ];

      const results = await Promise.allSettled(registryUpdates);
      const failures = results.filter(r => r.status === 'rejected');
      
      if (failures.length > 0) {
        console.error("Some registry updates failed:", failures);
        toast.warning("Η ΕΓΓΡΑΦΗ ΑΠΟΘΗΚΕΥΤΗΚΕ, ΑΛΛΑ ΥΠΗΡΞΑΝ ΣΦΑΛΜΑΤΑ ΣΤΗΝ ΕΝΗΜΕΡΩΣΗ ΤΩΝ ΜΗΤΡΩΩΝ.");
      }

      triggerRefetch();
      toast.success(UI_MESSAGES.SUCCESS.SAVED);
      const savedId = editingEntry?.id;
      setAiExtractedData(null);
      setOriginalAiData(null);
      setEditingEntry(null);
      navigate(savedId ? `/warranty/${savedId}` : '/warranty/inventory');
    } catch (err) { 
      console.error("Save failed:", err);
      toast.error(formatError(err));
    } finally { setIsLoading(false); }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    let readyAt = editingEntry?.readyAt || null;
    let expiryAt = editingEntry?.expiryAt || null;
    let finalParts = formParts.map((p, idx) => ({ 
      ...p, 
      id: (p as any).id || `p-${Date.now()}-${idx}`,
      isReady: p.isReady
    }));

    if (formData.status === 'COMPLETED') {
      const completionUpdates = getCompletionUpdates(
        { ...editingEntry, ...formData, parts: finalParts } as any, 
        settings
      );
      readyAt = completionUpdates.readyAt || readyAt;
      expiryAt = completionUpdates.expiryAt || expiryAt;
      finalParts = completionUpdates.parts as any;
    }

    const payload = {
      ...formData,
      parts: finalParts,
      createdAt: new Date(formData.createdAt).getTime(),
      userId: user?.uid,
      readyAt,
      expiryAt
    };

    if (formData.vin.length !== VALIDATION_RULES.VIN_LENGTH) setPendingSave(payload);
    else executeSave(payload);
  };

  return {
    formData, setFormData,
    formParts, setFormParts,
    isLoading, setIsLoading,
    scanStatus,
    vinHistory, showHistory, setShowHistory,
    pendingSave, setPendingSave,
    handleScanPDF, handleSave, executeSave,
    settings, editingEntry, setEditingEntry, setAiExtractedData, navigate
  };
};
