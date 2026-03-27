import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader: Component για την εμφάνιση της επικεφαλίδας κάθε σελίδας,
 * περιλαμβάνοντας τίτλο, υπότιτλο και προαιρετικά εικονίδιο ή ενέργειες.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ${className}`}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-zinc-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};
