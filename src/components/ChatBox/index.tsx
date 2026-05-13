/**
 * ChatBox/index.tsx: Το κεντρικό component του Chat.
 * Συντονίζει τα επιμέρους τμήματα (Header, Messages, Input) και διαχειρίζεται
 * την κατάσταση εμφάνισης (ανοιχτό/κλειστό/ελαχιστοποιημένο).
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { useChatHook } from './useChatHook';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

export const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    user,
    messages,
    chronMessages,
    unreadCount,
    activeUsers,
    firstUnreadIdAtOpening,
    messagesContainerRef,
    messagesEndRef,
    displayLimit,
    handleSendMessage,
    handleLoadMore
  } = useChatHook(isOpen, isMinimized);

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
            className="bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col pointer-events-auto text-gray-900"
          >
            <ChatHeader 
              isMinimized={isMinimized}
              setIsMinimized={setIsMinimized}
              setIsOpen={setIsOpen}
              activeUsers={activeUsers}
              currentUserId={user.uid}
            />

            {!isMinimized && (
              <>
                <ChatMessages 
                  messages={messages}
                  chronMessages={chronMessages}
                  displayLimit={displayLimit}
                  handleLoadMore={handleLoadMore}
                  currentUserId={user.uid}
                  firstUnreadIdAtOpening={firstUnreadIdAtOpening}
                  messagesContainerRef={messagesContainerRef}
                  messagesEndRef={messagesEndRef}
                />
                <ChatInput onSendMessage={handleSendMessage} />
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
