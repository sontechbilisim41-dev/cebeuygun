import { useState, useEffect } from 'react';

interface ChatWidgetConfig {
  customerId: string;
  orderId?: string;
  customerInfo?: any;
  position?: 'bottom-right' | 'bottom-left' | 'center';
  autoOpen?: boolean;
}

export const useChatWidget = (config: ChatWidgetConfig) => {
  const [isOpen, setIsOpen] = useState(config.autoOpen || false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const incrementUnread = () => {
    if (isMinimized) {
      setUnreadCount(prev => prev + 1);
    }
  };

  return {
    isOpen,
    isMinimized,
    unreadCount,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    incrementUnread,
  };
};