import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { FirestoreService } from '../../services/firebase/db';
import { ChatMessage, ChatPresence } from '../../core/types';

/**
 * useChatHook.ts: Διαχειρίζεται όλη τη λογική του ChatBox (Real-time μηνύματα, 
 * παρουσία χρηστών, αυτόματο scroll και σήμανση ως διαβασμένα).
 */
export const useChatHook = (isOpen: boolean, isMinimized: boolean) => {
  const { user, profile } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [displayLimit, setDisplayLimit] = useState(20);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [firstUnreadIdAtOpening, setFirstUnreadIdAtOpening] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<ChatPresence[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // BUG-014: Διαχείριση Scroll θέσης κατά τη φόρτωση παλιών μηνυμάτων
  useLayoutEffect(() => {
    if (messagesContainerRef.current && prevScrollHeight > 0) {
      const scrollDiff = messagesContainerRef.current.scrollHeight - prevScrollHeight;
      if (scrollDiff > 0) {
        messagesContainerRef.current.scrollTop = scrollDiff;
      }
      setPrevScrollHeight(0);
    }
  }, [messages]);

  // Subscribe to Presence
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = FirestoreService.subscribeToPresence((allPresence) => {
      const now = Date.now();
      const twoMinutesAgo = now - 2 * 60 * 1000;
      
      const active = allPresence.filter(p => {
        const lastActiveTime = p.lastActive?.toDate?.()?.getTime() || 0;
        // Θεωρούμε Online όποιον είναι Focused ΚΑΙ όχι Idle ΚΑΙ έχει πρόσφατο heartbeat
        return p.isAppFocused && !p.isAppIdle && lastActiveTime > twoMinutesAgo;
      });
      
      setActiveUsers(active);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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
    if (!user?.uid) return;
    let initialScrollTimer: NodeJS.Timeout;

    const unsubscribe = FirestoreService.subscribeToMessages((newMessages) => {
      setMessages(newMessages);
      
      const count = newMessages.filter(m => !m.readBy?.includes(user?.uid)).length;
      setUnreadCount(count);

      if (isInitialLoad && newMessages.length > 0) {
        setIsInitialLoad(false);
        initialScrollTimer = setTimeout(() => scrollToBottom('auto'), 150);
      }
    }, displayLimit);

    return () => {
      unsubscribe();
      if (initialScrollTimer) clearTimeout(initialScrollTimer);
    };
  }, [user?.uid, displayLimit, isInitialLoad]);

  const chronMessages = useMemo(() => {
    return messages.slice().reverse();
  }, [messages]);

  // Διαχείριση ανοίγματος chat (Scroll & Unread Marker)
  useEffect(() => {
    let scrollTimers: NodeJS.Timeout[] = [];

    if (isOpen && !isMinimized) {
      if (messages.length > 0 && !firstUnreadIdAtOpening) {
        const firstUnread = chronMessages.find(m => m.senderId !== user?.uid && !m.readBy?.includes(user?.uid || ''));
        if (firstUnread) {
          setFirstUnreadIdAtOpening(firstUnread.id);
        }
      }

      const triggerScroll = (delay: number) => {
        const t = setTimeout(() => scrollToBottom('auto'), delay);
        scrollTimers.push(t);
      };

      triggerScroll(50);
      triggerScroll(150);
      triggerScroll(400);
    } else if (!isOpen) {
      setFirstUnreadIdAtOpening(null);
    }

    return () => {
      scrollTimers.forEach(t => clearTimeout(t));
    };
  }, [isOpen, isMinimized, user?.uid]);

  // Σήμανση ως διαβασμένα
  useEffect(() => {
    let markAsReadTimer: NodeJS.Timeout;

    if (isOpen && !isMinimized && user?.uid && unreadCount > 0) {
      markAsReadTimer = setTimeout(() => {
        const unreadIds = messages
          .filter(m => !m.readBy?.includes(user.uid))
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          FirestoreService.markMultipleAsRead(unreadIds, user.uid);
        }
      }, 3000);
    }

    return () => {
      if (markAsReadTimer) clearTimeout(markAsReadTimer);
    };
  }, [isOpen, isMinimized, user?.uid, unreadCount, messages]);

  // Αυτόματο scroll στο τέλος
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !isMinimized && !isInitialLoad) {
      const container = messagesContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
        if (isAtBottom) {
          timer = setTimeout(() => scrollToBottom('smooth'), 50);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [messages.length, isOpen, isMinimized, isInitialLoad]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user) return;
    
    try {
      const senderName = profile?.email?.split('@')[0] || user.email?.split('@')[0] || 'Χρήστης';
      await FirestoreService.sendMessage(text, user.uid, senderName);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleLoadMore = () => {
    if (messagesContainerRef.current) {
      setPrevScrollHeight(messagesContainerRef.current.scrollHeight);
    }
    setDisplayLimit(prev => prev + 20);
  };

  return {
    user,
    messages,
    chronMessages,
    unreadCount,
    activeUsers,
    isInitialLoad,
    firstUnreadIdAtOpening,
    messagesContainerRef,
    messagesEndRef,
    displayLimit,
    handleSendMessage,
    handleLoadMore,
    scrollToBottom
  };
};
