/**
 * EditableCell.tsx: Ένα κελί πίνακα που εναλλάσσεται μεταξύ κειμένου και πεδίου επεξεργασίας.
 */
import React from 'react';

interface EditableCellProps {
  isEditing: boolean;
  value: string;
  onChange: (val: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  isEditing,
  value,
  onChange,
  autoFocus = true,
  placeholder
}) => {
  if (isEditing) {
    return (
      <input 
        type="text" 
        value={value} 
        placeholder={placeholder}
        onChange={e => onChange(e.target.value.toUpperCase())}
        className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-mono shadow-sm"
        autoFocus={autoFocus}
      />
    );
  }

  return (
    <div className="text-[11px] font-black text-zinc-900 uppercase tracking-tight truncate">
      {value || '---'}
    </div>
  );
};
