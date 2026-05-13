/**
 * AuditActivityCard.tsx: Κάρτα πρόσφατης δραστηριότητας.
 * Εμφανίζει τα τελευταία logs ενεργειών (Audit Logs) στο Dashboard.
 */
import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { UI_LIMITS } from '../../core/config';
import { getActionColor } from '../../utils/auditUtils';

interface AuditActivityCardProps {
  canSeeAudit: boolean;
  auditLogs: any[];
  settings: any;
}

export const AuditActivityCard: React.FC<AuditActivityCardProps> = ({ canSeeAudit, auditLogs, settings }) => {
  if (settings.dashboardConfig?.showAuditLog === false) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card title="ΠΡΟΣΦΑΤΗ ΔΡΑΣΤΗΡΙΟΤΗΤΑ" icon={Activity}>
        <div className="space-y-4">
          {canSeeAudit ? (
            <>
              {auditLogs.slice(0, settings.limits?.dashboardAuditLogs || UI_LIMITS.DASHBOARD_AUDIT_LOGS).map(log => (
                <div key={log.id} className="flex gap-6 items-start p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-all">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 bg-${getActionColor(log.action)}-500 shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="text-[10px] font-black text-zinc-900 uppercase">
                        {log.userEmail.split('@')[0]}
                      </div>
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">•</span>
                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                        {log.targetWarrantyId}
                      </div>
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">•</span>
                      <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleString('el-GR')}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter leading-relaxed italic whitespace-pre-wrap">
                      {log.details.split(' | ').map((detail, i) => (
                        <div key={i} className="py-0.5">• {detail}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="p-16 text-center border-2 border-dashed border-zinc-100 rounded-[2.5rem]">
                  <p className="text-[10px] font-black text-zinc-300 uppercase italic tracking-widest">ΚΑΜΙΑ ΚΙΝΗΣΗ ΑΚΟΜΑ ΣΤΟ ΣΥΣΤΗΜΑ</p>
                </div>
              )}
            </>
          ) : (
            <div className="p-16 text-center bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
              <p className="text-[10px] font-bold text-zinc-300 uppercase italic tracking-widest">ΠΕΡΙΟΡΙΣΜΕΝΗ ΠΡΟΣΒΑΣΗ ΣΤΟ ΙΣΤΟΡΙΚΟ</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
