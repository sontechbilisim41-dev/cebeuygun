import React, { createContext, useContext, ReactNode } from 'react';
import { ChatWidget } from './ChatWidget';
import { useChatWidget } from '@/hooks/useChatWidget';

interface ChatSDKContextType {
  openChat: (config: {
    customerId: string;
    orderId?: string;
    customerInfo?: any;
  }) => void;
  closeChat: () => void;
  isOpen: boolean;
}

const ChatSDKContext = createContext<ChatSDKContextType | null>(null);

interface ChatSDKProviderProps {
  children: ReactNode;
  apiEndpoint?: string;
  theme?: 'light' | 'dark';
}

export const ChatSDKProvider: React.FC<ChatSDKProviderProps> = ({
  children,
  apiEndpoint = 'http://localhost:8009',
  theme = 'light',
}) => {
  const [chatConfig, setChatConfig] = React.useState<any>(null);
  
  const {
    isOpen,
    isMinimized,
    unreadCount,
    openChat: openChatWidget,
    closeChat: closeChatWidget,
    minimizeChat,
    maximizeChat,
  } = useChatWidget({ customerId: '', autoOpen: false });

  const openChat = (config: {
    customerId: string;
    orderId?: string;
    customerInfo?: any;
  }) => {
    setChatConfig(config);
    openChatWidget();
  };

  const closeChat = () => {
    closeChatWidget();
    setChatConfig(null);
  };

  const contextValue: ChatSDKContextType = {
    openChat,
    closeChat,
    isOpen,
  };

  return (
    <ChatSDKContext.Provider value={contextValue}>
      {children}
      
      {isOpen && chatConfig && (
        <ChatWidget
          customerId={chatConfig.customerId}
          orderId={chatConfig.orderId}
          customerInfo={chatConfig.customerInfo}
          onClose={closeChat}
          position="bottom-right"
        />
      )}
    </ChatSDKContext.Provider>
  );
};

export const useChatSDK = () => {
  const context = useContext(ChatSDKContext);
  if (!context) {
    throw new Error('useChatSDK must be used within ChatSDKProvider');
  }
  return context;
};

// Utility function for easy integration
export const initializeChatSupport = (config: {
  apiEndpoint?: string;
  theme?: 'light' | 'dark';
}) => {
  // This would be used to initialize the chat widget in any React app
  return {
    ChatSDKProvider: (props: { children: ReactNode }) => (
      <ChatSDKProvider {...config} {...props} />
    ),
    useChatSDK,
  };
};