/**
 * PartsTable.tsx: Πίνακας ανταλλακτικών εγγύησης.
 * Εμφανίζει τους κωδικούς, τις περιγραφές, τις ποσότητες και την κατάσταση ετοιμότητας κάθε ανταλλακτικού.
 */
import React from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Entry } from '../../core/types';

interface PartsTableProps {
  entry: Entry;
}

export const PartsTable: React.FC<PartsTableProps> = ({ entry }) => {
  return (
    <Card title="ΑΝΤΑΛΛΑΚΤΙΚΑ" icon={FileText} noPadding>
      {entry.parts && entry.parts.length > 0 ? (
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΚΩΔΙΚΟΣ</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ΠΕΡΙΓΡΑΦΗ</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">ΠΟΣΟΤΗΤΑ</th>
                <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {entry.parts.map((p, i) => (
                <tr key={p.id || `${p.code}-${i}`} className="hover:bg-zinc-50/30 transition-colors">
                  <td className="px-8 py-5 text-xs font-mono font-black text-blue-600 uppercase">{p.code || '-'}</td>
                  <td className="px-8 py-5 text-xs font-bold text-zinc-700 uppercase">{p.description}</td>
                  <td className="px-8 py-5 text-xs font-black text-zinc-900 text-right">{p.quantity}</td>
                  <td className="px-8 py-5 text-center">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl shadow-sm border ${
                      p.isReady ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {p.isReady ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-16 text-center">
          <p className="text-xs font-black text-zinc-300 uppercase italic tracking-widest">ΔΕΝ ΥΠΑΡΧΟΥΝ ΚΑΤΑΓΕΓΡΑΜΜΕΝΑ ΑΝΤΑΛΛΑΚΤΙΚΑ.</p>
        </div>
      )}
    </Card>
  );
};
