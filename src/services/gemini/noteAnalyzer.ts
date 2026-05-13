/**
 * noteAnalyzer.ts: Υπηρεσία ανάλυσης σημειώσεων (Sentiment & Categorization).
 * Χρησιμοποιεί το Gemini API για να κατηγοριοποιήσει αυτόματα τις παρατηρήσεις των χρηστών.
 */
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "../../core/config";
import { getApiKey } from "./apiKeyManager";

export const analyzeNote = async (content: string, categories: string[] = []) => {
  const activeApiKey = getApiKey();

  if (!activeApiKey) {
    console.warn("Gemini API Key is missing for note analysis.");
    return { sentiment: 'Neutral', category: 'ΑΛΛΟ' };
  }

  const ai = new GoogleGenAI({ apiKey: activeApiKey });

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
