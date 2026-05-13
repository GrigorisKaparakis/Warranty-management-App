/**
 * apiKeyManager.ts: Ασφαλής ανάκτηση του Gemini API Key.
 * Διαχειρίζεται τα fallbacks μεταξύ των μεταβλητών περιβάλλοντος (Vite vs process.env).
 */
export const getApiKey = (): string => {
  // 1. Try Vite-prefixed environment variables (Browser/Build-time)
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (viteKey) return viteKey;

  // 2. Try process.env with safety check (Build-time defines or Node environments)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  }

  return '';
};
