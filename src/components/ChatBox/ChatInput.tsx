/**
 * ChatInput.tsx: Το πεδίο εισαγωγής μηνυμάτων του Chat.
 * Διαχειρίζεται την πληκτρολόγηση και την αποστολή νέων μηνυμάτων.
 */
import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    await onSendMessage(inputText);
    setInputText('');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 rounded-b-xl"
    >
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Πείτε κάτι..."
        className="flex-1 text-sm bg-gray-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
      />
      <button 
        type="submit"
        disabled={!inputText.trim()}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
      >
        <Send size={18} />
      </button>
    </form>
  );
};
