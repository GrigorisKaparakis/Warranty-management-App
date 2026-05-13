/**
 * ResultsTimeline.tsx: Χρονολόγιο αποτελεσμάτων ιστορικού.
 * Εμφανίζει τις εγγυήσεις ενός οχήματος σε κατακόρυφη χρονική σειρά με προεπισκόπηση στοιχείων.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, User } from 'lucide-react';
import { Entry } from '../../core/types';
import { useStore } from '../../store/useStore';
import { Badge } from '../../components/ui/Badge';

interface ResultsTimelineProps {
  results: Entry[];
}

export const ResultsTimeline: React.FC<ResultsTimelineProps> = ({ results }) => {
  const settings = useStore(s => s.settings);

  const getStatusConfig = (status: string) => {
    return settings.statusConfigs?.[status] || { label: status, color: '#64748b' };
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 px-6">
        <div className="h-px flex-1 bg-zinc-100" />
        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">ΑΠΟΤΕΛΕΣΜΑΤΑ ({results.length})</span>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-10 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-100 before:via-zinc-100 before:to-transparent">
        {results.map((entry) => {
          const config = getStatusConfig(entry.status);
          return (
            <div key={entry.id} className="relative flex items-start gap-12 group">
              {/* Timeline Dot */}
              <div className="absolute left-10 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white bg-blue-600 shadow-sm z-10 group-hover:scale-150 transition-transform" />
              
              {/* Date */}
              <div className="min-w-[80px] pt-1 text-right">
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                  {new Date(entry.createdAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })}
                </div>
                <div className="text-lg font-black text-zinc-900 tracking-tighter">{new Date(entry.createdAt).getFullYear()}</div>
              </div>

              {/* Content */}
              <Link 
                to={`/warranty/${entry.id}`}
                className="flex-1 p-8 bg-white rounded-[2.5rem] border border-zinc-100 hover:border-zinc-900 hover:shadow-2xl hover:shadow-zinc-200 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">#{entry.warrantyId}</span>
                      <Badge 
                        variant="neutral"
                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                        className="text-[9px] px-2.5 py-0.5 border-none font-black"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-600">
                      <User size={14} className="text-zinc-400" />
                      <span className="text-sm font-black uppercase tracking-tight">{entry.fullName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{entry.brand}</div>
                      <div className="text-xs font-black text-zinc-900 uppercase tracking-tight">{entry.company}</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:text-zinc-900 group-hover:border-zinc-900 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>

                {/* Parts & Notes Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-50">
                  <div>
                    <div className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-4">ΑΝΤΑΛΛΑΚΤΙΚΑ</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.parts.map((p, pIdx) => (
                        <div key={p.id || `p-${pIdx}`} className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-xl">
                          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{p.code} <span className="text-zinc-400 ml-1">x{p.quantity}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-4">ΠΑΡΑΤΗΡΗΣΕΙΣ</div>
                    <p className="text-[11px] font-medium text-zinc-500 italic leading-relaxed line-clamp-2">{entry.notes || 'Δεν υπάρχουν σημειώσεις.'}</p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
