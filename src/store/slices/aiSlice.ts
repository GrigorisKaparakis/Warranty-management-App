/**
 * aiSlice.ts: Διαχείριση της κατάστασης που αφορά την Τεχνητή Νοημοσύνη (Gemini).
 * Περιλαμβάνει τα εξαχθέντα δεδομένα από OCR και το ιστορικό του Chat.
 */

import { StateCreator } from 'zustand';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface AISlice {
  aiExtractedData: any;
  originalAiData: any; // Τα αρχικά δεδομένα για σύγκριση (Feedback)
  setAiExtractedData: (data: any) => void;
  setOriginalAiData: (data: any) => void;
  chatHistory: Message[];
  setChatHistory: (history: Message[] | ((prev: Message[]) => Message[])) => void;
}

export const createAISlice: StateCreator<AISlice> = (set) => ({
  aiExtractedData: null,
  originalAiData: null,
  setAiExtractedData: (aiExtractedData) => set({ aiExtractedData }),
  setOriginalAiData: (originalAiData) => set({ originalAiData }),
  chatHistory: [
    {
      role: 'assistant',
      text: 'Γεια σας! Είμαι ο ψηφιακός βοηθός της H&K. Πώς μπορώ να σας βοηθήσω σήμερα με το αρχείο των εγγυήσεων;',
      timestamp: Date.now()
    }
  ],
  setChatHistory: (history) => set((state) => ({ 
    chatHistory: typeof history === 'function' ? history(state.chatHistory) : history 
  })),
});
