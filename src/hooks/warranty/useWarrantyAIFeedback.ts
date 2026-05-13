/**
 * useWarrantyAIFeedback.ts: Hook για τη σύγκριση δεδομένων AI και χειροκίνητων διορθώσεων.
 * Βοηθά στη βελτίωση του AI μοντέλου αποθηκεύοντας τις αποκλίσεις (discrepancies).
 */
import { AIFeedbackService } from '../../services/firebase/aiFeedback';
import { Part } from '../../core/types';

export const useWarrantyAIFeedback = () => {
  const compareAndSaveFeedback = async (
    originalAiData: any,
    formData: any,
    formParts: Omit<Part, 'id'>[],
    editingEntry: any
  ) => {
    if (originalAiData && !editingEntry) {
      try {
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
        
        const originalCodes = (originalAiData.parts || []).map((p: any) => p.code?.trim().toUpperCase());
        const finalCodes = formParts.map(p => p.code?.trim().toUpperCase());
        
        const deletedCodes = originalCodes.filter(code => !finalCodes.includes(code));
        const addedCodes = finalCodes.filter(code => !originalCodes.includes(code));

        if (deletedCodes.length > 0) discrepancies.push(`DeletedParts: ${deletedCodes.join(', ')}`);
        if (addedCodes.length > 0) discrepancies.push(`AddedParts: ${addedCodes.join(', ')}`);

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
          console.log("AI Feedback saved:", discrepancies);
        }
      } catch (fbErr) {
        console.error("AI Feedback loop failed (non-blocking):", fbErr);
      }
    }
  };

  return { compareAndSaveFeedback };
};
