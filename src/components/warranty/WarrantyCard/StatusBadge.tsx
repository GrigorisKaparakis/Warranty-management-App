/**
 * StatusBadge.tsx: Το σήμα κατάστασης (Status) στην κάρτα εγγύησης με δυνατότητα αλλαγής.
 */
import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { GarageSettings, StatusConfig } from '@/core/types';

interface StatusBadgeProps {
  status: string;
  readOnly: boolean;
  settings: GarageSettings;
  getStatusConfig: (status: string) => StatusConfig;
  handleStatusChange: (status: string) => void;
  fontSize: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  readOnly, 
  settings, 
  getStatusConfig, 
  handleStatusChange,
  fontSize
}) => {
  const currentConfig = getStatusConfig(status);

  if (!readOnly) {
    return (
      <div className="relative">
        <select 
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{ 
            backgroundColor: `${currentConfig.color}10`, 
            color: currentConfig.color,
            borderColor: `${currentConfig.color}20`
          }}
          className={`w-full ${fontSize} font-black px-2 py-2 rounded-xl border cursor-pointer outline-none transition-all appearance-none text-center shadow-sm hover:shadow-md`}
        >
          {(settings.statusOrder || Object.keys(settings.statusConfigs || {})).map(s => {
            const conf = getStatusConfig(s);
            if (!settings.statusConfigs?.[s]) return null;
            return <option key={s} value={s}>{conf.label}</option>;
          })}
        </select>
      </div>
    );
  }

  return (
    <Badge 
      variant="neutral"
      style={{ backgroundColor: `${currentConfig.color}15`, color: currentConfig.color }}
      className="w-full justify-center py-2 border-none"
    >
      {currentConfig.label}
    </Badge>
  );
};
