/**
 * CustomerCard.tsx: Κάρτα στοιχείων πελάτη.
 * Εμφανίζει το όνομα του πελάτη και παρέχει σύνδεσμο για το ιστορικό του.
 */
import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Entry } from '../../core/types';

interface CustomerCardProps {
  entry: Entry;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ entry }) => {
  return (
    <Card title="ΣΤΟΙΧΕΙΑ ΠΕΛΑΤΗ" icon={User}>
      <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-blue-200 transition-all">
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">ΟΝΟΜΑΤΕΠΩΝΥΜΟ</div>
        <Link 
          to={`/customer/${encodeURIComponent(entry.fullName.replace(/\n/g, ' '))}`}
          className="text-base font-black text-blue-600 uppercase hover:underline block"
        >
          {entry.fullName}
        </Link>
      </div>
    </Card>
  );
};
