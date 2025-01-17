import { createContext, useContext, useState } from 'react';
import { ChatHistory } from '../types/Chat';
import { generateUUID } from '../lib/generateUUID';
import { t } from '@lingui/macro';
import { CHATBOT_NAME, MessageType, UserType } from '../constants';

interface ChatContextType {
  isLoading: boolean;
  chatHistory: ChatHistory[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory[]>>;
}

const ChatContext = createContext<ChatContextType>({
  isLoading: false,
  chatHistory: [],
  setChatHistory: () => {}
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock messages array to store chat history
  const messages = [
    {
      id: generateUUID(),
      user: UserType.bot,
      message: t`Hi, ${CHATBOT_NAME} here! How can I help you today?`
    }
  ];

  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(messages);
  const isLoading = chatHistory[chatHistory.length - 1]?.type === MessageType.loading;

  return (
    <ChatContext.Provider value={{ chatHistory, setChatHistory, isLoading }}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
