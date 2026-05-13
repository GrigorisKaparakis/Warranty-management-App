/**
 * AuditHistoryTimeline.tsx: Χρονολόγιο ιστορικού εγγύησης.
 * Εμφανίζει όλες τις αλλαγές και ενέργειες που έχουν γίνει σε μια συγκεκριμένη εγγύηση.
 */
import React from 'react';
import { History } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Entry } from '../../core/types';
import { getActionColor } from '../../utils/auditUtils';

interface AuditHistoryTimelineProps {
  entry: Entry;
  entryLogs: any[];
}

export const AuditHistoryTimeline: React.FC<AuditHistoryTimelineProps> = ({ entry, entryLogs }) => {
  return (
    <Card title="ΙΣΤΟΡΙΚΟ" icon={History}>
      <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
        {entryLogs.length > 0 ? (
          entryLogs.map((log) => (
            <div key={log.id} className="relative pl-8 group">
              <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-125 bg-${getActionColor(log.action)}-500`} />
              <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">
                {new Date(log.timestamp).toLocaleString('el-GR')}
              </div>
              <div className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter mb-1">
                {log.action} • {log.userEmail.split('@')[0]}
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter leading-relaxed italic whitespace-pre-wrap">
                {log.details.split(' | ').map((detail, i) => (
                  <div key={i} className="py-0.5">• {detail}</div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="relative pl-8">
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-md" />
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">ΔΗΜΙΟΥΡΓΙΑ</div>
            <div className="text-xs font-bold text-zinc-900 uppercase">{new Date(entry.createdAt).toLocaleString('el-GR')}</div>
            <div className="text-[10px] font-bold text-zinc-400 italic uppercase tracking-tighter mt-0.5">ΑΠΟ: {entry.authorEmail?.split('@')[0] || 'SYSTEM'}</div>
          </div>
        )}
      </div>
    </Card>
  );
};
