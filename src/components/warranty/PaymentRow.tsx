import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Entry } from '../../core/types';
import { FirestoreService } from '../../services/firebase/db';
import { toast } from '../../utils/toast';
import { Euro, Calendar, User as UserIcon } from 'lucide-react';

interface PaymentRowProps {
  entry: Entry;
}

export const PaymentRow: React.FC<PaymentRowProps> = ({ entry }) => {
  const [amount, setAmount] = useState<string>(entry.paymentAmount?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAmount(entry.paymentAmount?.toString() || '');
  }, [entry.paymentAmount]);

  const handleBlur = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) && amount !== '') {
      toast.error('ΜΗ ΕΓΚΥΡΟ ΠΟΣΟ');
      setAmount(entry.paymentAmount?.toString() || '');
      return;
    }

    if (numAmount === entry.paymentAmount) return;

    setIsSaving(true);
    try {
      await FirestoreService.updatePaymentAmount(entry.id, isNaN(numAmount) ? 0 : numAmount);
      toast.success('ΤΟ ΠΟΣΟ ΕΝΗΜΕΡΩΘΗΚΕ');
    } catch (error) {
      toast.error('ΣΦΑΛΜΑ ΕΝΗΜΕΡΩΣΗΣ');
      setAmount(entry.paymentAmount?.toString() || '');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('el-GR');

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white border-b border-zinc-50 py-4 px-6 min-h-[80px] flex items-center gap-8 hover:bg-zinc-50/50 transition-all"
    >
      {/* Payment Amount Field (Far Left) */}
      <div className="w-[180px] flex-shrink-0 relative group/input">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-blue-600 transition-colors">
          <Euro size={14} />
        </div>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={handleBlur}
          disabled={isSaving}
          placeholder="0.00"
          className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[13px] font-black outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-zinc-300"
        />
        {isSaving && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Warranty / VIN */}
      <div className="w-[220px] flex-shrink-0 space-y-1">
        <div className="text-[14px] font-black text-zinc-900 tracking-tighter uppercase leading-none">
          {entry.warrantyId}
        </div>
        <div className="inline-block bg-zinc-100 text-zinc-500 font-mono text-[11px] px-2.5 py-1 rounded-lg leading-none uppercase font-black border border-zinc-200">
          {entry.vin}
        </div>
      </div>

      {/* Company / Brand */}
      <div className="w-[180px] flex-shrink-0">
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{entry.company || '-'}</div>
        <div className="text-[12px] font-black text-zinc-900 uppercase tracking-tight">{entry.brand}</div>
      </div>

      {/* Date / Customer */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar size={12} />
          <span className="text-[11px] font-bold">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserIcon size={12} className="text-zinc-400" />
          <span className="text-[12px] font-black truncate uppercase tracking-tight text-zinc-700">
            {entry.fullName || '-'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
