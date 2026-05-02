
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { GoogleGenAI } from '@google/genai';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Zap,
  ShieldCheck,
  BrainCircuit,
  X
} from 'lucide-react';
import Markdown from 'react-markdown';
import { UI_LIMITS, AI_CONFIG } from '../core/config';
import { Message } from '../store/slices/aiSlice';

/**
 * AiAssistantView: Παρέχει μια διεπαφή συνομιλίας με το Gemini AI
 * για ερωτήσεις σχετικά με τις εγγυήσεις και τα δεδομένα του συνεργείου.
 */
export const AiAssistantView: React.FC = () => {
  // Raw state from useStore
  const entries = useStore(s => s.entries);
  const settings = useStore(s => s.settings);
  const chatHistory = useStore(s => s.chatHistory);
  const setChatHistory = useStore(s => s.setChatHistory);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const dataAnalytics = useMemo(() => {
    const total = entries.length;
    if (total === 0) return "No data available yet.";

    const brands: Record<string, number> = {};
    const companies: Record<string, number> = {};
    const statuses: Record<string, number> = {};
    let paidCount = 0;

    entries.forEach(e => {
      brands[e.brand] = (brands[e.brand] || 0) + 1;
      companies[e.company] = (companies[e.company] || 0) + 1;
      statuses[e.status] = (statuses[e.status] || 0) + 1;
      if (e.isPaid) paidCount++;
    });

    const topBrand = Object.entries(brands).sort((a,b) => b[1]-a[1])[0];
    const topCompany = Object.entries(companies).sort((a,b) => b[1]-a[1])[0];

    const limit = settings.limits?.fetchLimit || UI_LIMITS.FETCH_LIMIT;
    const detailedEntries = entries.slice(0, limit).map(e => {
      const partsList = e.parts.map(p => `${p.description} (${p.isReady ? 'Ήρθε' : 'Αναμονή'})`).join(', ');
      return `ID: ${e.warrantyId}, VIN: ${e.vin}, Brand: ${e.brand}, Status: ${e.status}, Parts: [${partsList}], Created: ${new Date(e.createdAt).toLocaleDateString()}`;
    }).join('\n');

    return {
      total,
      paidCount,
      unpaidCount: total - paidCount,
      topBrand: topBrand ? `${topBrand[0]} (${topBrand[1]})` : 'N/A',
      topCompany: topCompany ? `${topCompany[0]} (${topCompany[1]})` : 'N/A',
      statusBreakdown: statuses,
      detailedEntries,
      limit
    };
  }, [entries, settings.limits?.fetchLimit]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined) || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);
      
      if (!apiKey) {
        throw new Error('Gemini API Key is missing. Please check your environment variables.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const customInstructions = (settings.aiPrompts?.botInstructions || AI_CONFIG.BASE_PROMPTS.ASSISTANT)
        .replaceAll('{{garage_name}}', settings.branding?.appName || 'Warranty H&K');

      const prompt = `${customInstructions}
      
      CURRENT SYSTEM DATA (Last ${typeof dataAnalytics === 'string' ? '0' : dataAnalytics.limit} entries):
      ${typeof dataAnalytics === 'string' ? 'None' : dataAnalytics.detailedEntries}

      SUMMARY STATS:
      - Total: ${typeof dataAnalytics === 'string' ? '0' : dataAnalytics.total}
      - Paid: ${typeof dataAnalytics === 'string' ? '0' : dataAnalytics.paidCount}
      - Pending: ${typeof dataAnalytics === 'string' ? '0' : dataAnalytics.unpaidCount}

      USER QUESTION: ${input}`;

      const response = await ai.models.generateContent({
        model: AI_CONFIG.MODELS.DEFAULT,
        contents: prompt,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        text: response.text || 'Λυπάμαι, δεν μπόρεσα να επεξεργαστώ το αίτημά σας.',
        timestamp: Date.now()
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        text: 'Παρουσιάστηκε σφάλμα κατά την επικοινωνία με την τεχνητή νοημοσύνη. Παρακαλώ δοκιμάστε ξανά αργότερα.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-zinc-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BrainCircuit size={32} className="text-white relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-blue-600" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AI ASSISTANT</span>
            </div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">H&K INTELLIGENCE</h1>
          </div>
        </div>
        
        <Button 
          variant="neutral" 
          size="icon"
          onClick={() => setChatHistory([{
            role: 'assistant',
            text: 'Η συνομιλία καθαρίστηκε. Πώς μπορώ να σας βοηθήσω;',
            timestamp: Date.now()
          }])}
          className="w-12 h-12 rounded-2xl border-zinc-100 bg-white text-zinc-400 hover:text-rose-500 hover:border-rose-100 transition-all"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-100 overflow-hidden bg-zinc-50/30">
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {chatHistory.map((message, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-6 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                message.role === 'assistant' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-100 text-zinc-400'
              }`}>
                {message.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              
              <div className={`max-w-[80%] space-y-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                  message.role === 'assistant' 
                    ? 'bg-white text-zinc-800 border border-zinc-100 rounded-tl-none' 
                    : 'bg-zinc-900 text-white rounded-tr-none'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{message.text}</Markdown>
                  </div>
                </div>
                <div className="text-[9px] font-black text-zinc-300 uppercase tracking-widest px-2">
                  {new Date(message.timestamp).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-6 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-zinc-100 flex gap-2">
                <div className="w-2 h-2 bg-zinc-200 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-zinc-200 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-zinc-200 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-zinc-100">
          <div className="relative flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Ρωτήστε οτιδήποτε για τις εγγυήσεις..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="flex-1 pl-8 pr-20 py-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-300"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xl hover:shadow-zinc-200 active:scale-90 transition-all disabled:opacity-20"
            >
              <Send size={20} />
            </Button>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Zap size={10} className="text-amber-500" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">REAL-TIME DATA</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={10} className="text-emerald-500" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">SECURE ANALYTICS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
