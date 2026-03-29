
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Entry, Part } from '../core/types';
import { EntryStatus, VALIDATION_RULES, UI_MESSAGES } from '../core/config';
import { FirestoreService } from '../services/firebase/db';
import { extractWarrantyFromPDF } from '../services/gemini';
import { AIFeedbackService } from '../services/firebase/aiFeedback';
import { useStore } from '../store/useStore';
import { toast } from '../utils/toast';
import { getCompletionUpdates } from '../utils/warrantyLogic';
import { formatError } from '../utils/errorUtils';

export const useWarrantyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editingEntry = useStore(s => s.editingEntry);
  const setEditingEntry = useStore(s => s.setEditingEntry);
  const aiExtractedData = useStore(s => s.aiExtractedData);
  const setAiExtractedData = useStore(s => s.setAiExtractedData);
  const originalAiData = useStore(s => s.originalAiData);
  const setOriginalAiData = useStore(s => s.setOriginalAiData);

  const user = useStore(s => s.user);
  const entries = useStore(s => s.entries);
  const settings = useStore(s => s.settings);
  const vehiclesRegistry = useStore(s => s.vehicles);

  const [isLoading, setIsLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [vinHistory, setVinHistory] = useState<Entry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [pendingSave, setPendingSave] = useState<any>(null);
  
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  
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
        setFormParts(aiExtractedData.parts.map((p: any) => ({
          ...p,
          code: (p.code || '').trim().toUpperCase(),
          description: (p.description || '').trim(),
          isReady: false
        })));
      }
      // Clear AI data after consumption to prevent re-filling if navigating back
      setAiExtractedData(null);
    }
  }, [aiExtractedData, editingEntry, setAiExtractedData]);

  // Edit entry fill
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
    }
  }, [editingEntry]);

  // VIN History & Auto-fill
  useEffect(() => {
    const cleanVin = formData.vin.trim().toUpperCase();
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
  }, [formData.vin, entries, editingEntry, vehiclesRegistry]);

  const handleScanPDF = async (file: File) => {
    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ΤΟ ΑΡΧΕΙΟ ΕΙΝΑΙ ΠΟΛΥ ΜΕΓΑΛΟ (MAX 10MB)");
      return;
    }

    // API Key selection check for Pro models in public environment
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      setScanStatus("ΑΠΑΙΤΕΙΤΑΙ ΕΝΕΡΓΟΠΟΙΗΣΗ API KEY...");
      try {
        await window.aistudio.openSelectKey();
        // After opening, we assume success and proceed as per guidelines
      } catch (e) {
        console.error("Key selection failed:", e);
        setScanStatus(null);
        return;
      }
    }

    setIsLoading(true);
    setScanStatus("ΠΡΟΕΤΟΙΜΑΣΙΑ ΑΡΧΕΙΟΥ...");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setScanStatus("ΑΝΑΛΥΣΗ ΜΕ AI (GEMINI 3.1 PRO)...");
      const data = await extractWarrantyFromPDF(
        base64, 
        file.type, 
        settings.distributorRules || [], 
        settings.aiPrompts?.pdfExtraction,
        formData.company // Pass current company as hint if available
      );

      setScanStatus("ΕΠΕΞΕΡΓΑΣΙΑ ΔΕΔΟΜΕΝΩΝ...");

      setAiExtractedData(data);
      setOriginalAiData(data);
      
      toast.success(UI_MESSAGES.SUCCESS.ANALYZED);
    } catch (err) {
      console.error("AI Scan failed:", err);
      toast.error(UI_MESSAGES.ERRORS.ANALYSIS_FAILED);
    } finally {
      setIsLoading(false);
      setScanStatus(null);
    }
  };

  const executeSave = async (payload: any) => {
    setIsLoading(true);
    try {
      // AI Feedback Loop: Σύγκριση αρχικών δεδομένων AI με τα τελικά δεδομένα
      if (originalAiData && !editingEntry) {
        const discrepancies: string[] = [];
        
        const homoglyphMap: Record<string, string> = {
          'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X'
        };
        const normalizeHomoglyphs = (str: string) => 
          str.split('').map(char => homoglyphMap[char] || char).join('');

        const norm = (val: any) => normalizeHomoglyphs((val || "").toString().trim().toUpperCase());
        const normName = (val: any) => normalizeHomoglyphs((val || "").toString().trim().toUpperCase()).split(/\s+/).sort().join(" ");

        if (norm(originalAiData.vin) !== norm(formData.vin)) discrepancies.push("VIN");
        if (norm(originalAiData.warrantyId) !== norm(formData.warrantyId)) discrepancies.push("WarrantyID");
        if (normName(originalAiData.fullName) !== normName(formData.fullName)) discrepancies.push("FullName");
        if (norm(originalAiData.company) !== norm(formData.company)) discrepancies.push("Company");
        if (norm(originalAiData.brand) !== norm(formData.brand)) discrepancies.push("Brand");
        
        // Σύγκριση ανταλλακτικών για εύρεση διαγραφών (π.χ. κωδικοί εργασίας)
        const originalCodes = (originalAiData.parts || []).map((p: any) => p.code?.trim().toUpperCase());
        const finalCodes = formParts.map(p => p.code?.trim().toUpperCase());
        
        const deletedCodes = originalCodes.filter(code => !finalCodes.includes(code));
        const addedCodes = finalCodes.filter(code => !originalCodes.includes(code));

        if (deletedCodes.length > 0) discrepancies.push(`DeletedParts: ${deletedCodes.join(', ')}`);
        if (addedCodes.length > 0) discrepancies.push(`AddedParts: ${addedCodes.join(', ')}`);

        console.log("AI Discrepancy Check:", {
          original: {
            vin: originalAiData.vin,
            warrantyId: originalAiData.warrantyId,
            fullName: originalAiData.fullName,
            company: originalAiData.company,
            brand: originalAiData.brand
          },
          final: {
            vin: formData.vin,
            warrantyId: formData.warrantyId,
            fullName: formData.fullName,
            company: formData.company,
            brand: formData.brand
          },
          discrepancies
        });

        if (discrepancies.length > 0) {
          await AIFeedbackService.saveFeedback({
            company: formData.company || originalAiData.company,
            originalData: originalAiData,
            correctedData: {
              vin: formData.vin,
              warrantyId: formData.warrantyId,
              fullName: formData.fullName,
              company: formData.company,
              brand: formData.brand,
              parts: formParts
            },
            discrepancies
          });
          console.log("AI Feedback saved for learning:", discrepancies);
        }
      }

      if (editingEntry) await FirestoreService.updateEntry(editingEntry.id, payload, editingEntry);
      else await FirestoreService.addEntry(payload);
      
      // Registry updates
      await Promise.all([
        ...formParts.map(p => FirestoreService.upsertPart(p.code, p.description, formData.brand)),
        FirestoreService.upsertVehicle(formData.vin, formData.brand, formData.fullName),
        FirestoreService.upsertCustomer(formData.fullName, formData.vin)
      ].map(p => p.catch(e => console.error("Registry update failed:", e))));

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
    
    // Αρχικές τιμές από το υπάρχον έγγραφο (αν υπάρχει)
    let readyAt = editingEntry?.readyAt || null;
    let expiryAt = editingEntry?.expiryAt || null;
    let finalParts = formParts.map((p, idx) => ({ 
      ...p, 
      id: (p as any).id || `p-${Date.now()}-${idx}`,
      isReady: p.isReady
    }));

    // Αν η κατάσταση είναι COMPLETED, χρησιμοποιούμε την κεντρική λογική
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
      userId: user.uid,
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
