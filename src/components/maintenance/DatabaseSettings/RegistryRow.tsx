/**
 * RegistryRow.tsx: Μια γραμμή στον πίνακα του μητρώου.
 * Περιλαμβάνει τα περιεχόμενα (children) και τα κουμπιά ενεργειών (Edit, Delete).
 */
import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/Button';

interface RegistryRowProps {
  id: string;
  isEditing: boolean;
  onEdit: () => void;
  onDelete?: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

export const RegistryRow: React.FC<RegistryRowProps> = ({
  id,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  children
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <tr className={`group hover:bg-zinc-50/50 transition-all ${isConfirmingDelete ? 'bg-rose-50/30' : ''}`}>
      {children}
      <td className="px-8 py-5 text-right w-[150px]">
        <div className="flex justify-end gap-1">
          {isEditing ? (
            <>
              <Button size="sm" variant="primary" icon={Check} onClick={onSave} />
              <Button size="sm" variant="secondary" icon={X} onClick={onCancel} />
            </>
          ) : isConfirmingDelete ? (
            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
              <span className="text-[9px] font-black text-rose-500 uppercase mr-1">ΣΙΓΟΥΡΑ;</span>
              <Button 
                size="sm" 
                variant="danger" 
                icon={Trash2} 
                onClick={() => {
                  onDelete?.();
                  setIsConfirmingDelete(false);
                }} 
              />
              <Button 
                size="sm" 
                variant="neutral" 
                icon={X} 
                onClick={() => setIsConfirmingDelete(false)} 
              />
            </div>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="neutral" 
                icon={Edit2} 
                onClick={onEdit} 
                className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg" 
              />
              {onDelete && (
                <Button 
                  size="sm" 
                  variant="neutral" 
                  icon={Trash2} 
                  onClick={() => setIsConfirmingDelete(true)} 
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-500 h-8 w-8 rounded-lg" 
                />
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
