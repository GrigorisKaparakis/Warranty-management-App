
import { GoogleGenAI, Type } from "@google/genai";
import { AIFeedback, DistributorRule } from "../core/types";
import { AI_CONFIG } from "../core/config";
import { AIFeedbackService } from "./firebase/aiFeedback";

const homoglyphMap: Record<string, string> = {
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X'
};
const normalizeHomoglyphs = (str: string) => 
  str.split('').map(char => homoglyphMap[char] || char).join('');

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
  // Use import.meta.env for Vite, with fallback to process.env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined) || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);
  
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
            warrantyId: { type: Type.STRING, description: "The unique ID or Claim Number of the document" },
            vin: { type: Type.STRING, description: "The 17-character Vehicle Identification Number. MUST BE EXACTLY 17 CHARACTERS." },
            fullName: { type: Type.STRING, description: "Customer's full name" },
            brand: { type: Type.STRING, description: "Vehicle brand (e.g. HONDA, DUCATI, KAWASAKI). Use the provided rules." },
            company: { type: Type.STRING, description: "Distributor company (e.g. ΣΑΡΑΚΑΚΗΣ, KOSMOCAR). Use the provided rules." },
            createdAt: { type: Type.STRING, description: "The date the document was issued in ISO format (YYYY-MM-DD) or empty string if not found." },
            parts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING, description: "The part number or reference code" },
                  description: { type: Type.STRING, description: "Short description of the part" },
                  quantity: { type: Type.NUMBER, description: "Number of units" }
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

    let result;
    try {
      const text = response.text;
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      result = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", response.text);
      throw new Error("Το AI επέστρεψε μη έγκυρο format δεδομένων. Παρακαλώ δοκιμάστε ξανά.");
    }
    
    // Cleanup and Normalization
    if (result.fullName) result.fullName = result.fullName.replace(/\n/g, ' ').trim().toUpperCase();
    if (result.warrantyId) result.warrantyId = result.warrantyId.replace(/\n/g, '').replace(/[^A-Z0-9-]/g, '').trim().toUpperCase();
    if (result.vin) {
      result.vin = result.vin.replace(/\s/g, '').replace(/[^A-Z0-9]/g, '').trim().toUpperCase();
      if (result.vin.length > 17) result.vin = result.vin.slice(-17);
    }
    if (result.brand) result.brand = result.brand.trim().toUpperCase();
    if (result.company) result.company = result.company.trim().toUpperCase();
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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined) || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);
  
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
