
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Minimize2, Maximize2, Send, ChevronDown, Users } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FirestoreService } from '../services/firebase/db';
import { ChatMessage, ChatPresence } from '../core/types';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

export const ChatBox: React.FC = () => {
  const { user, profile } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [firstUnreadIdAtOpening, setFirstUnreadIdAtOpening] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<ChatPresence[]>([]);
  const [showPresenceTooltip, setShowPresenceTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  // Heartbeat Presence
  useEffect(() => {
    if (!user) return;
    
    const update = (open: boolean) => {
      const name = user.email.split('@')[0].toUpperCase();
      FirestoreService.updatePresence(user.uid, name, open);
    };

    // Initial update
    update(isOpen && !isMinimized);

    const interval = setInterval(() => {
      update(isOpen && !isMinimized);
    }, 45000); // Κάθε 45 δευτερόλεπτα

    return () => {
      clearInterval(interval);
      update(false);
    };
  }, [user, isOpen, isMinimized]);

  // Subscribe to Presence
  useEffect(() => {
    if (!user) return;

    const unsubscribe = FirestoreService.subscribeToPresence((allPresence) => {
      const now = Date.now();
      const twoMinutesAgo = now - 2 * 60 * 1000;
      
      const active = allPresence.filter(p => {
        const lastActiveTime = p.lastActive?.toDate?.()?.getTime() || 0;
        return p.chatOpen && lastActiveTime > twoMinutesAgo;
      });
      
      setActiveUsers(active);
    });

    return () => unsubscribe();
  }, [user]);

  // Helper function for scrolling to bottom
  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    } else if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Παρακολούθηση μηνυμάτων
  useEffect(() => {
    if (!user) return;

    const unsubscribe = FirestoreService.subscribeToMessages((newMessages) => {
      setMessages(newMessages);
      
      // Υπολογισμός αδιάβαστων
      const count = newMessages.filter(m => !m.readBy?.includes(user.uid)).length;
      setUnreadCount(count);

      // Αν πρόκειται για το πρώτο φόρτωμα
      if (isInitialLoad && newMessages.length > 0) {
        setIsInitialLoad(false);
        // Scroll στο τέλος μετά από λίγο
        setTimeout(() => scrollToBottom('auto'), 150);
      }
    }, displayLimit);

    return () => unsubscribe();
  }, [user, displayLimit]);

  // Διαχείριση ανοίγματος chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // 1. Εύρεση του πρώτου αδιάβαστου μηνύματος για να κρατήσουμε το διαχωριστικό
      if (messages.length > 0 && !firstUnreadIdAtOpening) {
        const chronMessages = messages.slice().reverse();
        const firstUnread = chronMessages.find(m => m.senderId !== user?.uid && !m.readBy?.includes(user?.uid || ''));
        if (firstUnread) {
          setFirstUnreadIdAtOpening(firstUnread.id);
        }
      }

      // 2. Scroll στο τέλος (πολλαπλά scrolls για σιγουριά καθώς φορτώνει το DOM)
      setTimeout(() => scrollToBottom('auto'), 50);
      setTimeout(() => scrollToBottom('auto'), 150);
      setTimeout(() => scrollToBottom('auto'), 400);

      // 3. Σήμανση ως διαβασμένα μετά από 3 δευτερόλεπτα (για να προλάβει να δει το διαχωριστικό)
      const timer = setTimeout(() => {
        if (user && unreadCount > 0) {
          const unreadIds = messages
            .filter(m => !m.readBy?.includes(user.uid))
            .map(m => m.id);
          
          if (unreadIds.length > 0) {
            FirestoreService.markMultipleAsRead(unreadIds, user.uid);
          }
        }
      }, 3000);

      return () => clearTimeout(timer);
    } else if (!isOpen) {
      setFirstUnreadIdAtOpening(null);
    }
  }, [isOpen, isMinimized, user]);

  // Αυτόματο scroll στο τέλος όταν έρχεται νέο μήνυμα αν είμαστε ήδη κάτω
  useEffect(() => {
    if (isOpen && !isMinimized && !isInitialLoad) {
      const container = messagesContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
        if (isAtBottom) {
          setTimeout(() => scrollToBottom('smooth'), 50);
        }
      }
    }
  }, [messages.length, isOpen, isMinimized, isInitialLoad]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText('');
    
    try {
      const senderName = profile?.email?.split('@')[0] || user.email?.split('@')[0] || 'Χρήστης';
      await FirestoreService.sendMessage(text, user.uid, senderName);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '48px' : '500px',
              width: '350px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-gray-900 text-white p-3 flex items-center justify-between cursor-pointer rounded-t-xl" onClick={() => setIsMinimized(!isMinimized)}>
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
                  <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full font-medium border border-gray-700 hover:bg-gray-700 transition-colors">
                    {activeUsers.length} Ενεργοί
                  </span>

                  {/* Presence Tooltip */}
                  <AnimatePresence>
                    {showPresenceTooltip && activeUsers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-2 w-max bg-gray-900/95 text-white text-[10px] py-2 px-3 rounded-xl shadow-2xl z-50 border border-gray-700 backdrop-blur-md"
                      >
                        <div className="font-bold mb-2 text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-1 flex items-center gap-1.5">
                          <Users size={10} />
                          Χρήστες στο Chat
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {activeUsers.map(u => (
                            <div key={u.uid} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                              <span className="font-medium whitespace-nowrap">
                                {u.uid === user?.uid ? 'ΕΣΕΙΣ' : u.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Tooltip Arrow */}
                        <div className="absolute top-full left-4 w-2 h-2 bg-gray-900/95 transform rotate-45 -mt-1 border-r border-b border-gray-800" />
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

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 opacity-50">
                      <MessageCircle size={40} />
                      <p className="text-sm">Δεν υπάρχουν μηνύματα ακόμη</p>
                    </div>
                  ) : (
                    <>
                      {/* Load More Button */}
                      {messages.length >= displayLimit && (
                        <button 
                          onClick={() => setDisplayLimit(prev => prev + 20)}
                          className="text-[10px] text-blue-600 font-bold uppercase tracking-widest py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1 border border-blue-100 mb-2"
                        >
                          Φόρτωση παλαιότερων (+20)
                        </button>
                      )}

                      {/* Render Messages in Chronological Order */}
                      {messages.slice().reverse().map((msg, index, array) => {
                        const isMe = msg.senderId === user.uid;
                        const date = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date();
                        
                        // Check if it's the first unread message to show a divider
                        const isFirstUnread = msg.id === firstUnreadIdAtOpening;

                        return (
                          <React.Fragment key={msg.id}>
                            {isFirstUnread && (
                              <div className="flex items-center gap-2 py-2">
                                <div className="h-[1px] bg-red-200 flex-1" />
                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Νέα Μηνύματα</span>
                                <div className="h-[1px] bg-red-200 flex-1" />
                              </div>
                            )}
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              {!isMe && (
                                <span className="text-[10px] text-gray-500 mb-1 ml-1 font-medium uppercase tracking-wider">
                                  {msg.senderName}
                                </span>
                              )}
                              <div 
                                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                                  isMe 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-gray-400 mt-1 px-1">
                                {format(date, 'HH:mm')}
                              </span>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 rounded-b-xl"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Πείτε κάτι..."
                    className="flex-1 text-sm bg-gray-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="relative pointer-events-auto w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-gray-800 transition-all group"
        >
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </div>
  );
};
