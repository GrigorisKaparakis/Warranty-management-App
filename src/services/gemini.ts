
import { GoogleGenAI, Type } from "@google/genai";
import { AIFeedback, DistributorRule } from "../core/types";
import { AI_CONFIG } from "../core/config";
import { AIFeedbackService } from "./firebase/aiFeedback";

/**
 * extractWarrantyFromPDF: Η "μαγεία" του OCR.
 * Μετατρέπει μια εικόνα ή PDF σε δομημένα δεδομένα (VIN, Ανταλλακτικά κλπ).
 * Χρησιμοποιεί τους Δυναμικούς Κανόνες (DistributorRules) και το AI Feedback.
 */
export const extractWarrantyFromPDF = async (
  base64Data: string, 
  mimeType: string, 
  rules: DistributorRule[] = [], 
  customPrompt?: string,
  companyHint?: string
) => {
  // Use GEMINI_API_KEY with fallback to API_KEY for maximum compatibility
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please check your environment variables or select a key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Μετατροπή των κανόνων σε κείμενο για το Prompt
  const rulesString = rules.length > 0 
    ? rules.map((r, i) => `${i+1}. ${r.company} / ${r.brand}: ${r.markers}`).join('\n  ')
    : "No specific distributor rules provided. Use general vehicle warranty detection.";

  const prompt = customPrompt 
    ? customPrompt
        .replaceAll('{{rules}}', rulesString)
        .replaceAll('{{garage_name}}', import.meta.env.VITE_APP_NAME || 'Warranty H&K')
    : AI_CONFIG.BASE_PROMPTS.OCR_WARRANTY
        .replace('{{rules}}', rulesString)
        .replace('{{garage_name}}', import.meta.env.VITE_APP_NAME || 'Warranty H&K');

  // Ανάκτηση προηγούμενων λαθών/διορθώσεων για βελτίωση της ακρίβειας (Few-Shot Learning)
  let feedbackString = "";
  const recentFeedback = companyHint 
    ? await AIFeedbackService.getFeedbackForCompany(companyHint)
    : await AIFeedbackService.getRecentFeedback(5);

  if (recentFeedback.length > 0) {
    feedbackString = "\nPAST CORRECTIONS (Learn from these mistakes):\n";
    recentFeedback.forEach((f, i) => {
      feedbackString += `Example ${i+1} (${f.company || 'General'}):\n`;
      feedbackString += `- AI initially extracted: ${JSON.stringify(f.originalData)}\n`;
      feedbackString += `- User corrected it to: ${JSON.stringify(f.correctedData)}\n`;
      feedbackString += `- Key errors to avoid: ${f.discrepancies.join(', ')}\n\n`;
    });
  }

  const enhancedPrompt = `
    THINKING STEP:
    1. Analyze the provided document (PDF or Image).
    2. Look for keywords like "VIN", "Chassis No", "Frame No", "Warranty ID", "Claim Number".
    3. Identify the customer name, usually near the top.
    4. List all parts with their codes and descriptions.
    5. Match the document to the following DISTRIBUTOR RULES to identify the 'company' and 'brand':
    ${rulesString}

    ${feedbackString}

    CORE INSTRUCTION:
    ${prompt}

    IMPORTANT:
    - If a field is missing, return an empty string.
    - For parts, if quantity is missing, default to 1.
    - Return ONLY the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.MODELS.OCR,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: enhancedPrompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            warrantyId: { type: Type.STRING, description: "The unique ID of the document" },
            vin: { type: Type.STRING, description: "Exactly 17 characters VIN" },
            fullName: { type: Type.STRING, description: "Customer's full name" },
            brand: { type: Type.STRING, description: "Vehicle brand (e.g. HONDA)" },
            company: { type: Type.STRING, description: "Distributor company (e.g. ΣΑΡΑΚΑΚΗΣ)" },
            parts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING },
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER }
                },
                required: ["code", "description", "quantity"]
              }
            }
          },
          required: ["warrantyId", "vin", "fullName", "brand", "company", "parts"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(response.text.trim());
    if (result.fullName) result.fullName = result.fullName.replace(/\n/g, ' ').trim();
    if (result.warrantyId) result.warrantyId = result.warrantyId.replace(/\n/g, '').trim();
    if (result.vin) result.vin = result.vin.replace(/\n/g, '').trim();
    return result;
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw error;
  }
};

/**
 * analyzeNote: Αναλύει μια σημείωση για να βρει Sentiment και Κατηγορία.
 */
export const analyzeNote = async (content: string, categories: string[] = []) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing for note analysis.");
    return { sentiment: 'Neutral', category: 'ΑΛΛΟ' };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const categoriesList = categories.length > 0 ? categories.join(', ') : 'ΕΠΙΣΚΕΥΗ, ΣΥΝΤΗΡΗΣΗ, ΕΓΓΥΗΣΗ, ΑΛΛΟ';

  const prompt = AI_CONFIG.BASE_PROMPTS.NOTE_ANALYSIS
    .replace('{{categories}}', categoriesList)
    .replace('{{content}}', content);

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.MODELS.ANALYSIS,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Note Analysis failed:", error);
    return { sentiment: 'Neutral', category: 'ΑΛΛΟ' };
  }
};
