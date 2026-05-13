/**
 * ChatMessages.tsx: Η λίστα των μηνυμάτων του Chat.
 * Εμφανίζει τα μηνύματα με διαφορετικό στυλ ανάλογα με τον αποστολέα (δικά μας ή άλλων)
 * και διαχειρίζεται την αυτόματη κύλιση (scroll).
 */
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ChatMessage } from '../../core/types';

interface ChatMessagesProps {
  messages: ChatMessage[];
  chronMessages: ChatMessage[];
  displayLimit: number;
  handleLoadMore: () => void;
  currentUserId?: string;
  firstUnreadIdAtOpening: string | null;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  chronMessages,
  displayLimit,
  handleLoadMore,
  currentUserId,
  firstUnreadIdAtOpening,
  messagesContainerRef,
  messagesEndRef
}) => {
  return (
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
          {messages.length >= displayLimit && (
            <button 
              onClick={handleLoadMore}
              className="text-[10px] text-blue-600 font-bold uppercase tracking-widest py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1 border border-blue-100 mb-2"
            >
              Φόρτωση παλαιότερων (+20)
            </button>
          )}

          {chronMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const date = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date();
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
  );
};
