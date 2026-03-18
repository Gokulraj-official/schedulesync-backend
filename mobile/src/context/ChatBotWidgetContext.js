import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatBotWidgetContext = createContext();

export const useChatBotWidget = () => {
  const context = useContext(ChatBotWidgetContext);
  if (!context) {
    throw new Error('useChatBotWidget must be used within ChatBotWidgetProvider');
  }
  return context;
};

export const ChatBotWidgetProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);  // Changed to true - shows by default
  const [isMinimized, setIsMinimized] = useState(true);

  const showWidget = useCallback(() => {
    setIsVisible(true);
    setIsMinimized(false);
  }, []);

  const hideWidget = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleWidget = useCallback(() => {
    if (isVisible) {
      setIsMinimized(!isMinimized);
    } else {
      setIsVisible(true);
      setIsMinimized(false);
    }
  }, [isVisible, isMinimized]);

  const minimizeWidget = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const value = {
    isVisible,
    isMinimized,
    showWidget,
    hideWidget,
    toggleWidget,
    minimizeWidget,
  };

  return (
    <ChatBotWidgetContext.Provider value={value}>
      {children}
    </ChatBotWidgetContext.Provider>
  );
};
