import React, { useState, useEffect } from 'react';
import { DistributorRule } from '../../core/types';
import { AI_CONFIG } from '../../core/config';
import { useStore } from '../../store/useStore';
import { toast } from '../../utils/toast';
import { useSettingsActions } from '../../hooks/useSettingsActions';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Save, Plus, Trash2, BookOpen, MessageSquare, Info } from 'lucide-react';

interface AiEngineSettingsProps {
  activeTab: string;
}

/**
 * AiEngineSettings: Διαχειρίζεται τις ρυθμίσεις του AI, συμπεριλαμβανομένων των
 * Prompts και της Knowledge Base (Distributor Rules).
 */
export const AiEngineSettings: React.FC<AiEngineSettingsProps> = ({ activeTab }) => {
  const settings = useStore(s => s?.settings);
  const { updateAiPrompts, updateDistributorRules } = useSettingsActions();
  
  const [subTab, setSubTab] = useState<'prompts' | 'knowledge'>('prompts');
  const [selectedPrompt, setSelectedPrompt] = useState<'pdf' | 'bot'>('pdf');
  const [newAiRule, setNewAiRule] = useState<Omit<DistributorRule, 'id'>>({ company: '', brand: '', markers: '' });
  
  // Local state for prompts to avoid auto-updating
  const [localPrompts, setLocalPrompts] = useState({
    pdfExtraction: settings?.aiPrompts?.pdfExtraction || '',
    botInstructions: settings?.aiPrompts?.botInstructions || ''
  });

  // Sync local state when settings are loaded or updated from server
  useEffect(() => {
    if (settings?.aiPrompts) {
      setLocalPrompts({
        pdfExtraction: settings.aiPrompts.pdfExtraction || '',
        botInstructions: settings.aiPrompts.botInstructions || ''
      });
    }
  }, [settings?.aiPrompts]);

  if (activeTab !== 'ai_control') return null;

  const handleSavePrompt = async () => {
    try {
      await updateAiPrompts({
        pdfExtraction: localPrompts.pdfExtraction || AI_CONFIG.BASE_PROMPTS.OCR_WARRANTY,
        botInstructions: localPrompts.botInstructions || AI_CONFIG.BASE_PROMPTS.ASSISTANT
      });
      toast.success("ΟΙ ΟΔΗΓΙΕΣ ΑΠΟΘΗΚΕΥΤΗΚΑΝ!");
    } catch (error) {
      toast.error("ΣΦΑΛΜΑ ΚΑΤΑ ΤΗΝ ΑΠΟΘΗΚΕΥΣΗ");
    }
  };

  const addAiRule = () => {
    if (!newAiRule.company || !newAiRule.brand || !newAiRule.markers) return;
    const rules = settings.distributorRules || [];
    const updated = [...rules, { ...newAiRule, id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }];
    updateDistributorRules(updated);
    setNewAiRule({ company: '', brand: '', markers: '' });
  };

  const removeAiRule = (id: string) => {
    const rules = settings.distributorRules || [];
    updateDistributorRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="animate-slide-up space-y-8 pb-32">
      {/* Sub-Navigation */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl w-fit border border-white/5 shadow-2xl backdrop-blur-md">
        <button 
          onClick={() => setSubTab('prompts')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'prompts' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-white'}`}
        >
          AI PROMPTS
        </button>
        <button 
          onClick={() => setSubTab('knowledge')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'knowledge' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-white'}`}
        >
          KNOWLEDGE BASE
        </button>
      </div>

      {subTab === 'prompts' ? (
        <Card 
          title="AI SYNTAX ARCHITECT" 
          subtitle="CONFIGURE CORE SYSTEM INSTRUCTIONS"
          actions={<Button onClick={handleSavePrompt} icon={Save} size="sm" className="bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-900/40 border-none transition-all">COMMIT CHANGES</Button>}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-4">
            {/* Prompt Selector */}
            <div className="lg:col-span-1 space-y-3">
              {[
                { id: 'pdf', label: 'PDF ANALYZER', desc: 'EXTRACTION ENGINE', icon: BookOpen },
                { id: 'bot', label: 'ASSISTANT', desc: 'CONVERSATION FLOW', icon: MessageSquare },
              ].map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedPrompt(p.id as any)}
                  className={`w-full text-left p-6 rounded-[1.5rem] border transition-all relative overflow-hidden group ${selectedPrompt === p.id ? 'border-blue-500/50 bg-blue-600/5 shadow-2xl' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                >
                  {selectedPrompt === p.id && <div className="absolute right-0 top-0 w-16 h-16 bg-blue-600/10 rounded-full blur-2xl -mr-8 -mt-8"></div>}
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <p.icon size={18} className={selectedPrompt === p.id ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'} />
                    <span className={`text-[12px] font-black uppercase tracking-tighter ${selectedPrompt === p.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{p.label}</span>
                  </div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest relative z-10">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">
                    {selectedPrompt === 'pdf' ? 'ENTITY RECOGNITION TEMPLATE' : 'SYSTEM BEHAVIOR INSTRUCTIONS'}
                  </label>
                </div>
                <div className="flex gap-3">
                  <Badge variant="neutral" className="bg-slate-900 border-white/5 text-blue-400">{'{{rules}}'}</Badge>
                  <Badge variant="neutral" className="bg-slate-900 border-white/5 text-blue-400">{'{{garage_name}}'}</Badge>
                </div>
              </div>
              
              <textarea 
                className="w-full h-96 p-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] font-mono text-sm text-slate-100 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all leading-relaxed custom-scrollbar shadow-inner"
                value={selectedPrompt === 'pdf' ? localPrompts.pdfExtraction : localPrompts.botInstructions}
                onChange={e => {
                  const field = selectedPrompt === 'pdf' ? 'pdfExtraction' : 'botInstructions';
                  setLocalPrompts(prev => ({ ...prev, [field]: e.target.value }));
                }}
                placeholder="DEFINE INSTRUCTIONS..."
              />
              
              <div className="p-6 bg-blue-600/5 rounded-[2rem] border border-blue-500/20 flex gap-4 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Info size={18} className="text-blue-400 shrink-0 mt-1 relative z-10" />
                <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed italic relative z-10">
                  VARIABLE INJECTION ENABLED. THE <span className="text-blue-400">{'{{rules}}'}</span> TOKEN WILL BE REPLACED BY THE ACTIVE KNOWLEDGE BASE ENTITIES DURING INFERENCE.
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card title="NEURAL KNOWLEDGE BASE" subtitle="REGISTER RECOGNITION PATTERNS">
            <div className="space-y-8 bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">ENTITY SELECTION</label>
                  <select 
                    value={newAiRule.company} 
                    onChange={e => setNewAiRule({...newAiRule, company: e.target.value, brand: ''})} 
                    className="w-full px-6 py-4 bg-slate-950 border border-white/10 rounded-[1.5rem] font-black text-[12px] text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-950">SELECT DISTRIBUTOR...</option>
                    {Object.keys(settings.companyBrandMap || {}).map(c => (
                      <option key={c} value={c} className="bg-slate-950">{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">MODEL/BRAND VARIATION</label>
                  <select 
                    value={newAiRule.brand} 
                    onChange={e => setNewAiRule({...newAiRule, brand: e.target.value})} 
                    disabled={!newAiRule.company}
                    className="w-full px-6 py-4 bg-slate-950 border border-white/10 rounded-[1.5rem] font-black text-[12px] text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer disabled:opacity-20"
                  >
                    <option value="" className="bg-slate-950">SELECT BRAND...</option>
                    {newAiRule.company && settings.companyBrandMap[newAiRule.company]?.map(b => (
                      <option key={b} value={b} className="bg-slate-950">{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4">RECOGNITION MARKERS (CSS/TEXT PATTERNS)</label>
                <textarea 
                  placeholder="DEFINE KEYWORDS / ADDRESSES / IDENTIFIERS THAT THE AI SHOULD DETECT..." 
                  value={newAiRule.markers} 
                  onChange={e => setNewAiRule({...newAiRule, markers: e.target.value})} 
                  className="w-full px-6 py-6 bg-slate-950 border border-white/10 rounded-[2rem] font-bold text-sm text-white outline-none h-40 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all resize-none leading-relaxed shadow-inner placeholder:text-slate-800" 
                />
              </div>

              <button 
                onClick={addAiRule}
                className="w-full h-16 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 border-none italic"
              >
                <Plus size={20} />
                REGISTER KNOWLEDGE NODE
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(settings.distributorRules || []).map(rule => (
              <div key={rule.id} className="flex items-center gap-6 p-8 glass-dark border border-white/5 rounded-[2.5rem] hover:border-blue-500/30 transition-all group/rule shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover/rule:bg-blue-600/10 transition-all"></div>
                <div className="w-28 shrink-0 relative z-10">
                  <div className="text-[12px] font-black text-white uppercase tracking-tighter italic">{rule.company}</div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{rule.brand}</div>
                </div>
                <div className="flex-1 text-[11px] font-black text-slate-500 italic line-clamp-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 relative z-10 leading-relaxed">
                   "{rule.markers}"
                </div>
                <button 
                  onClick={() => removeAiRule(rule.id)} 
                  className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover/rule:opacity-100 relative z-10 border border-white/5"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
