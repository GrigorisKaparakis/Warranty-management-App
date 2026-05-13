/**
 * ChatHeader.tsx: Η κεφαλίδα του ChatBox.
 * Εμφανίζει την κατάσταση σύνδεσης, τον αριθμό των ενεργών χρηστών 
 * και παρέχει τα κουμπιά ελαχιστοποίησης και κλεισίματος.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minimize2, Maximize2, Users } from 'lucide-react';
import { ChatPresence } from '../../core/types';

interface ChatHeaderProps {
  isMinimized: boolean;
  setIsMinimized: (val: boolean) => void;
  setIsOpen: (val: boolean) => void;
  activeUsers: ChatPresence[];
  currentUserId?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isMinimized,
  setIsMinimized,
  setIsOpen,
  activeUsers,
  currentUserId
}) => {
  const [showPresenceTooltip, setShowPresenceTooltip] = useState(false);

  return (
    <div 
      className="bg-gray-900 text-white p-3 flex items-center justify-between cursor-pointer rounded-t-xl" 
      onClick={() => setIsMinimized(!isMinimized)}
    >
      <div className="flex items-center gap-2 relative">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-medium text-sm">Ομαδική Συνομιλία</span>
        
        {/* Active Users Indicator */}
        <div 
          className="relative flex items-center gap-1 ml-1 cursor-help group"
          onMouseEnter={() => setShowPresenceTooltip(true)}
          onMouseLeave={() => setShowPresenceTooltip(false)}
          onClick={(e) => { e.stopPropagation(); setShowPresenceTooltip(!showPresenceTooltip); }}
        >
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold border border-white/10 hover:bg-white/20 transition-all uppercase tracking-tight">
            {activeUsers.length} {activeUsers.length === 1 ? 'ΕΝΕΡΓΟΣ' : 'ΕΝΕΡΓΟΙ'}
          </span>

          <AnimatePresence>
            {showPresenceTooltip && activeUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-[calc(100%+12px)] left-0 min-w-[180px] bg-zinc-900 text-white text-[10px] py-4 px-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[999] border border-white/10 backdrop-blur-xl"
              >
                <div className="font-black mb-3 text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                  <Users size={12} className="text-zinc-400" />
                  ΣΥΝΔΕΔΕΜΕΝΟΙ ΧΡΗΣΤΕΣ
                </div>
                <div className="flex flex-col gap-3">
                  {activeUsers.map(u => (
                    <div key={u.uid} className="flex items-center justify-between group/user">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-20" />
                        </div>
                        <span className="font-black whitespace-nowrap text-zinc-100 tracking-tight uppercase">
                          {u.uid === currentUserId ? 'ΕΣΕΙΣ' : (u.name || 'ΧΡΗΣΤΗΣ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-6 w-3 h-3 bg-zinc-900 transform rotate-45 -mt-1.5 border-r border-b border-white/10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          className="p-1 hover:bg-red-500/80 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
