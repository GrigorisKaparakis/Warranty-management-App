/**
 * useWarrantyPDFScan.ts: Hook για τη σάρωση εγγυήσεων μέσω AI (PDF Analysis).
 * Διαχειρίζεται το ανέβασμα του αρχείου, την επικοινωνία με το Gemini API και την εξαγωγή δεδομένων.
 */
import { useRef } from 'react';
import { extractWarrantyFromPDF } from '../../services/gemini';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';
import { UI_MESSAGES } from '../../core/config';

export const useWarrantyPDFScan = (
  setIsLoading: (val: boolean) => void,
  setScanStatus: (status: string | null) => void,
  companyHint: string
) => {
  const settings = useStore(s => s.settings);
  const setAiExtractedData = useStore(s => s.setAiExtractedData);
  const setOriginalAiData = useStore(s => s.setOriginalAiData);
  const currentScanIdRef = useRef<number>(0);

  const handleScanPDF = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ΤΟ ΑΡΧΕΙΟ ΕΙΝΑΙ ΠΟΛΥ ΜΕΓΑΛΟ (MAX 10MB)");
      return;
    }

    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      setScanStatus("ΑΠΑΙΤΕΙΤΑΙ ΕΝΕΡΓΟΠΟΙΗΣΗ API KEY...");
      try {
        await window.aistudio.openSelectKey();
      } catch (e) {
        console.error("Key selection failed:", e);
        setScanStatus(null);
        return;
      }
    }

    setIsLoading(true);
    setScanStatus("ΠΡΟΕΤΟΙΜΑΣΙΑ ΑΡΧΕΙΟΥ...");

    const scanId = ++currentScanIdRef.current;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 60000);

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
        companyHint,
        abortController.signal
      );

      if (scanId !== currentScanIdRef.current) return;
      
      clearTimeout(timeoutId);
      setScanStatus("ΕΠΕΚΤΑΣΗ ΔΕΔΟΜΕΝΩΝ & ΕΛΕΓΧΟΣ...");
      
      setAiExtractedData(data);
      setOriginalAiData(data);
      
      toast.success(UI_MESSAGES.SUCCESS.ANALYZED);
    } catch (err: any) {
      if (scanId !== currentScanIdRef.current) return;
      
      if (err.name === 'AbortError' || err.message === 'Aborted') {
        toast.error("Η ΑΝΑΛΥΣΗ ΚΑΘΥΣΤΕΡΗΣΕ ΠΟΛΥ (TIMEOUT). ΔΟΚΙΜΑΣΤΕ ΞΑΝΑ.");
      } else {
        console.error("AI Scan failed:", err);
        toast.error(UI_MESSAGES.ERRORS.ANALYSIS_FAILED);
      }
    } finally {
      clearTimeout(timeoutId);
      if (scanId === currentScanIdRef.current) {
        setIsLoading(false);
        setScanStatus(null);
      }
    }
  };

  return { handleScanPDF };
};
