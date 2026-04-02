/**
 * PDF_CONFIG: Ρυθμίσεις για την εξαγωγή PDF.
 */
export const PDF_CONFIG = {
  FONTS: {
    NOTO_SANS_URL: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
  },
  DEFAULTS: {
    COMPANY_NAME: "ΟΝΟΜΑ ΕΤΑΙΡΕΙΑΣ",
  },
  COLORS: {
    PRIMARY: [15, 23, 42] as [number, number, number], // Slate 900
    SECONDARY: [100, 100, 100] as [number, number, number], // Gray
    ACCENT: [59, 130, 246] as [number, number, number], // Blue 500
    BACKGROUND_ALT: [248, 250, 252] as [number, number, number], // Slate 50
    WHITE: [255, 255, 255] as [number, number, number],
  },
  FONT_SIZES: {
    TITLE: 18,
    SUBTITLE: 12,
    BODY: 10,
    SMALL: 9,
    TINY: 8,
  }
};

/**
 * AI_CONFIG: Ρυθμίσεις για το Google Gemini API.
 * Περιλαμβάνει τα μοντέλα και τα βασικά prompts (System Instructions).
 */
export const AI_CONFIG = {
  MODELS: {
    DEFAULT: 'gemini-3-flash-preview',
    OCR: 'gemini-3-flash-preview',
    ANALYSIS: 'gemini-3-flash-preview'
  },
  BASE_PROMPTS: {
    ASSISTANT: `You are a professional business consultant for Warranty H&K, a high-end vehicle garage.
    Respond strictly in GREEK.
    Be professional, data-driven, and concise.
    Format with bullet points for readability.`,
    
    OCR_WARRANTY: `You are a professional vehicle warranty document auditor. 
    Identify the DISTRIBUTOR (company) and BRAND based on the following DYNAMIC MAPPING RULES:
    
    {{rules}}

    DATA EXTRACTION REQUIREMENTS:
    - warrantyId: The unique ID of the document.
    - vin: Exactly 17 characters (Vehicle Identification Number).
    - fullName: Customer's full name.
    - parts: Array of objects {code, description, quantity}.

    CRITICAL INSTRUCTIONS:
    - EXCLUDE any items that represent LABOR, WORK, or SERVICE CODES (e.g. "ΕΡΓΑΣΙΑ", "LABOR", "WORK", "SERVICE", or codes like "99-99-99").
    - ONLY include physical spare parts (ΑΝΤΑΛΛΑΚΤΙΚΑ).
    - If a part description contains "LABOR" or "ΕΡΓΑΣΙΑ", DO NOT include it.

    OUTPUT: Return ONLY a valid JSON object matching the requested schema. If a field is not found, return an empty string or 0 for numbers.`,

    NOTE_ANALYSIS: `Analyze the following garage note content and provide:
    1. SENTIMENT: Positive, Negative, or Neutral.
    2. CATEGORY: Choose the best fit from this list: [{{categories}}].

    CONTENT: "{{content}}"

    OUTPUT: Return ONLY a valid JSON object with keys "sentiment" and "category".`
  }
};
