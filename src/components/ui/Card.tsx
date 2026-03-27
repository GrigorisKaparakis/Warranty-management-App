import React from 'react';

import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Card: Ένα βασικό component πλαισίου (container) για την οργάνωση του περιεχομένου
 * με τίτλο, υπότιτλο και ενέργειες.
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
  noPadding = false,
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden ${className}`}>
      {(title || actions || Icon) && (
        <div className="px-6 py-4 border-b border-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-500">
                <Icon size={16} />
              </div>
            )}
            <div>
              {title && <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>}
              {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};
