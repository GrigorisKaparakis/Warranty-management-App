
import { useNavigate } from 'react-router-dom';
import { FirestoreService } from '../services/firebase/db';
import { UI_MESSAGES } from '../core/config';
import { extractWarrantyFromPDF } from '../services/gemini';
import { useStore } from '../store/useStore';
import { toast } from '../utils/toast';

/**
 * useAppFileDrop: Hook για τη διαχείριση του Drag & Drop και της AI ανάλυσης.
 */
export const useAppFileDrop = () => {
  const navigate = useNavigate();
  const settings = useStore(s => s?.settings);
  const setIsLoading = useStore(s => s?.setIsLoading);
  const setEditingEntry = useStore(s => s?.setEditingEntry);
  const setDeletingEntry = useStore(s => s?.setDeletingEntry);
  const setAiExtractedData = useStore(s => s?.setAiExtractedData);
  const setOriginalAiData = useStore(s => s?.setOriginalAiData);
  const setDragActive = useStore(s => s?.setDragActive);
  const setDragCounter = useStore(s => s?.setDragCounter);

  const handleFinalDelete = async (deletingEntry: {id: string, warrantyId: string} | null) => {
    if (!deletingEntry) return;
    try {
      await FirestoreService.deleteEntry(deletingEntry.id, deletingEntry.warrantyId);
      toast.success(UI_MESSAGES.SUCCESS.DELETED(deletingEntry.warrantyId));
      setDeletingEntry(null);
    } catch (e) {
      toast.error(UI_MESSAGES.ERRORS.DELETE_FAILED);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter") {
      setDragCounter(prev => prev + 1);
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragCounter(prev => {
        const next = prev - 1;
        if (next <= 0) setDragActive(false);
        return next;
      });
    } else if (e.type === "dragover") {
      setDragActive(true);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDragCounter(0);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("ΤΟ ΑΡΧΕΙΟ ΕΙΝΑΙ ΠΟΛΥ ΜΕΓΑΛΟ (MAX 10MB)");
        return;
      }

      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
          try {
            await window.aistudio.openSelectKey();
          } catch (e) {
            console.error("Key selection failed:", e);
            return;
          }
        }

        setIsLoading(true);
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const data = await extractWarrantyFromPDF(base64, file.type, settings.distributorRules || [], settings.aiPrompts?.pdfExtraction);
          setAiExtractedData(data);
          setOriginalAiData(data);
          setEditingEntry(null);
          navigate('/warranty/new');
          toast.success(UI_MESSAGES.SUCCESS.ANALYZED);
        } catch (err) {
          console.error("Drop analysis failed:", err);
          toast.error(UI_MESSAGES.ERRORS.ANALYSIS_FAILED);
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.info(UI_MESSAGES.ERRORS.UNSUPPORTED_FILE);
      }
    }
  };

  return {
    handleFinalDelete,
    handleDrag,
    handleDrop
  };
};
