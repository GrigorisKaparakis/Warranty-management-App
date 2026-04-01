
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
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      
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
    <div className="p-8 md:p-12 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/20 relative overflow-hidden group border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-transparent opacity-100 transition-opacity" />
            <BrainCircuit size={40} className="text-white relative z-10" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full blur-xl opacity-50"></div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={14} className="text-blue-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AI CO-PILOT</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">H&K INTELLIGENCE</h1>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="icon"
          onClick={() => setChatHistory([{
            role: 'assistant',
            text: 'Η συνομιλία καθαρίστηκε. Πώς μπορώ να σας βοηθήσω;',
            timestamp: Date.now()
          }])}
          className="w-14 h-14 rounded-2xl border-white/10 bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-600/10 transition-all shadow-xl"
        >
          <Trash2 size={22} />
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col rounded-[3rem] border border-white/5 shadow-2xl shadow-black/40 overflow-hidden glass-dark relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/[0.02] to-transparent pointer-events-none"></div>
        <div className="flex-1 overflow-y-auto p-10 space-y-10 relative z-10 scrollbar-hide">
          {chatHistory.map((message, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-8 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
            >
              <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 shadow-2xl ${
                message.role === 'assistant' ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-slate-800 text-slate-400 border border-white/5'
              }`}>
                {message.role === 'assistant' ? <Bot size={24} /> : <User size={24} />}
              </div>
              
              <div className={`max-w-[75%] space-y-3 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-8 rounded-[2.5rem] text-[13px] font-medium leading-relaxed tracking-wide shadow-2xl ${
                  message.role === 'assistant' 
                    ? 'bg-slate-900 text-slate-100 border border-white/5 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/10'
                }`}>
                  <div className="markdown-body prose prose-invert max-w-none">
                    <Markdown>{message.text}</Markdown>
                  </div>
                </div>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4">
                  {new Date(message.timestamp).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-8 animate-pulse">
              <div className="w-14 h-14 rounded-[1.2rem] bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={24} className="text-white" />
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] rounded-tl-none border border-white/5 flex gap-2 shadow-2xl">
                <div className="w-2.5 h-2.5 bg-blue-500/40 rounded-full animate-bounce shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                <div className="w-2.5 h-2.5 bg-blue-500/40 rounded-full animate-bounce [animation-delay:0.2s] shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                <div className="w-2.5 h-2.5 bg-blue-500/40 rounded-full animate-bounce [animation-delay:0.4s] shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-10 bg-black/40 border-t border-white/5 backdrop-blur-3xl relative z-10">
          <div className="relative flex items-center gap-6">
            <input 
              type="text" 
              placeholder="Ρωτήστε οτιδήποτε για τις εγγυήσεις..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="flex-1 pl-10 pr-24 py-6 bg-slate-950 border border-white/10 rounded-[2.5rem] text-[14px] font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all placeholder:text-slate-700 shadow-2xl uppercase tracking-tighter"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-10 border-none"
            >
              <Send size={24} />
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-10">
            <div className="flex items-center gap-3">
              <Zap size={14} className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">REAL-TIME OS DATA</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={14} className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">SECURE SYSTEM ANALYTICS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
