import { GoogleGenerativeAI } from "@google/generative-ai";

const GENAI_KEY = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(GENAI_KEY);

/**
 * AiService: Handles all generative AI logic for the Dashboard.
 */
export const AiService = {
  async generateStatsSummary(stats: any) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        Analyze these warranty management stats and provide a 1-sentence proactive insight in GREEK:
        Total: ${stats.total}
        Pending: ${stats.counts?.PENDING || 0}
        Paid: ${stats.counts?.PAID || 0}
        Unpaid: ${stats.counts?.UNPAID || 0}
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("AI Insight Error:", error);
      return "ΣΥΣΤΗΜΑ ΕΤΟΙΜΟ. ΠΕΡΙΜΕΝΩ ΝΕΑ ΔΕΔΟΜΕΝΑ ΓΙΑ ΑΝΑΛΥΣΗ.";
    }
  }
};
