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
    <div className={`glass-dark rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-md ${className}`}>
      {(title || actions || Icon || subtitle) && (
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner">
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{title}</h3>}
              {subtitle && <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-8'}>
        {children}
      </div>
    </div>
  );
};
