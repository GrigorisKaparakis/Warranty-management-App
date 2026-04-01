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
    <div className="animate-slide-up space-y-6">
      {/* Sub-Navigation */}
      <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl w-fit">
        <button 
          onClick={() => setSubTab('prompts')}
          className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${subTab === 'prompts' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          AI PROMPTS
        </button>
        <button 
          onClick={() => setSubTab('knowledge')}
          className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${subTab === 'knowledge' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          KNOWLEDGE BASE
        </button>
      </div>

      {subTab === 'prompts' ? (
        <Card 
          title="ΔΙΑΧΕΙΡΙΣΗ AI PROMPTS" 
          subtitle="ΟΡΙΣΤΕ ΤΙΣ ΟΔΗΓΙΕΣ ΓΙΑ ΤΟ AI"
          actions={<Button onClick={handleSavePrompt} icon={Save} size="sm">ΑΠΟΘΗΚΕΥΣΗ</Button>}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Prompt Selector */}
            <div className="lg:col-span-1 space-y-2">
              {[
                { id: 'pdf', label: 'PDF ANALYZER', desc: 'ΑΝΑΛΥΣΗ ΕΓΓΡΑΦΩΝ', icon: BookOpen },
                { id: 'bot', label: 'CHAT ASSISTANT', desc: 'ΟΔΗΓΙΕΣ BOT', icon: MessageSquare },
              ].map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedPrompt(p.id as any)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedPrompt === p.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p.icon size={14} className={selectedPrompt === p.id ? 'text-zinc-900' : 'text-zinc-400'} />
                    <span className="text-[10px] font-bold text-zinc-900 uppercase">{p.label}</span>
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {selectedPrompt === 'pdf' ? 'PDF Extraction Template' : 'Bot System Instructions'}
                </label>
                <div className="flex gap-2">
                  <Badge variant="neutral">{'{{rules}}'}</Badge>
                  <Badge variant="neutral">{'{{garage_name}}'}</Badge>
                </div>
              </div>
              
              <textarea 
                className="w-full h-80 p-6 bg-zinc-50 border border-zinc-100 rounded-2xl font-mono text-xs outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all leading-relaxed"
                value={selectedPrompt === 'pdf' ? localPrompts.pdfExtraction : localPrompts.botInstructions}
                onChange={e => {
                  const field = selectedPrompt === 'pdf' ? 'pdfExtraction' : 'botInstructions';
                  setLocalPrompts(prev => ({ ...prev, [field]: e.target.value }));
                }}
                placeholder="ΕΙΣΑΓΕΤΕ ΤΙΣ ΟΔΗΓΙΕΣ..."
              />
              
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <Info size={16} className="text-amber-600 shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed italic">
                  ΧΡΗΣΙΜΟΠΟΙΗΣΤΕ ΤΙΣ ΜΕΤΑΒΛΗΤΕΣ ΓΙΑ ΝΑ ΕΙΣΑΧΘΟΥΝ ΑΥΤΟΜΑΤΑ ΟΙ ΚΑΝΟΝΕΣ ΤΗΣ KNOWLEDGE BASE.
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card title="KNOWLEDGE BASE" subtitle="ΚΑΝΟΝΕΣ ΑΝΑΓΝΩΡΙΣΗΣ ΔΙΑΝΟΜΕΩΝ">
            <div className="space-y-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">ΕΤΑΙΡΕΙΑ (ΔΙΑΝΟΜΕΑΣ)</label>
                  <select 
                    value={newAiRule.company} 
                    onChange={e => setNewAiRule({...newAiRule, company: e.target.value, brand: ''})} 
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  >
                    <option value="">ΕΠΙΛΕΞΤΕ ΕΤΑΙΡΕΙΑ...</option>
                    {Object.keys(settings.companyBrandMap || {}).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">ΜΑΡΚΑ / ΜΟΝΤΕΛΟ</label>
                  <select 
                    value={newAiRule.brand} 
                    onChange={e => setNewAiRule({...newAiRule, brand: e.target.value})} 
                    disabled={!newAiRule.company}
                    className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all disabled:opacity-50"
                  >
                    <option value="">ΕΠΙΛΕΞΤΕ ΜΑΡΚΑ...</option>
                    {newAiRule.company && settings.companyBrandMap[newAiRule.company]?.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">MARKERS (ΛΕΞΕΙΣ ΚΛΕΙΔΙΑ ΓΙΑ ΤΟ AI)</label>
                <textarea 
                  placeholder="ΕΙΣΑΓΕΤΕ ΤΑ ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ ΠΟΥ ΕΝΤΟΠΙΖΕΙ ΤΟ AI ΣΤΟ PDF (Π.Χ. ΔΙΕΥΘΥΝΣΗ, ΑΦΜ, ΛΟΓΟΤΥΠΟ)..." 
                  value={newAiRule.markers} 
                  onChange={e => setNewAiRule({...newAiRule, markers: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl font-medium text-xs outline-none h-32 focus:ring-2 focus:ring-zinc-900/5 transition-all resize-none leading-relaxed" 
                />
              </div>

              <Button onClick={addAiRule} icon={Plus} className="w-full py-4">ΠΡΟΣΘΗΚΗ ΣΤΗ ΓΝΩΣΗ AI</Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(settings.distributorRules || []).map(rule => (
              <div key={rule.id} className="flex items-center gap-4 p-4 bg-white border border-zinc-100 rounded-xl hover:border-zinc-200 transition-all group">
                <div className="w-24 shrink-0">
                  <div className="text-[10px] font-bold text-zinc-900 uppercase">{rule.company}</div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase">{rule.brand}</div>
                </div>
                <div className="flex-1 text-[10px] font-medium text-zinc-500 italic line-clamp-2">"{rule.markers}"</div>
                <button onClick={() => removeAiRule(rule.id)} className="text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
