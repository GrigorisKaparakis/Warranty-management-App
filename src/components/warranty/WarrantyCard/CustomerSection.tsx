/**
 * CustomerSection.tsx: Εμφάνιση στοιχείων πελάτη και ημερομηνιών στην κάρτα εγγύησης.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface CustomerSectionProps {
  fullName: string;
  formattedDate: string;
  expiryInfo: { text: string; variant: any } | null;
  status: string;
  isPaid: boolean;
  fontSize: string;
}

export const CustomerSection: React.FC<CustomerSectionProps> = ({ 
  fullName, 
  formattedDate, 
  expiryInfo, 
  status, 
  isPaid,
  fontSize
}) => {
  return (
    <div className="space-y-1 relative">
      <div className="flex items-center gap-2 text-zinc-400">
        <Calendar size={12} />
        <span className={`${fontSize} font-bold`}>{formattedDate}</span>
      </div>
      <div className="flex items-center gap-2">
        <UserIcon size={12} className="text-zinc-400" />
        <Link 
          to={`/customer/${encodeURIComponent(fullName.replace(/\n/g, ' '))}`}
          onClick={(e) => e.stopPropagation()}
          className={`${fontSize} font-black truncate uppercase tracking-tight text-blue-600 hover:underline decoration-2 underline-offset-4`}
        >
          {fullName || '-'}
        </Link>
      </div>
      {expiryInfo && status !== 'REJECTED' && !isPaid && (
        <div className="mt-1">
          <Badge variant={expiryInfo.variant} className="text-[8px] px-1.5 py-0 border-none shadow-sm capitalize">
            {expiryInfo.text}
          </Badge>
        </div>
      )}
    </div>
  );
};
