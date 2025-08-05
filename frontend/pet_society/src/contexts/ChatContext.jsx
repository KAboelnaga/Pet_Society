import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import webSocketService from '../services/websocket';
import globalWebSocketService from '../services/globalWebSocket';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  // Load conversations and setup global WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();

      // Connect to global WebSocket for notifications
      globalWebSocketService.connect(user);

      // Listen for new chat notifications
      const unsubscribeNewChat = globalWebSocketService.onNewChat((data) => {
        console.log('New chat notification:', data);

        // Reload conversations to get the new chat
        loadConversations();

        // Show notification if available
        if (window.showChatNotification) {
          window.showChatNotification(
            {
              author: data.created_by || data.invited_by,
              body: data.is_private ? 'Started a private chat with you' : `Invited you to ${data.chat_name}`,
              created: new Date().toISOString()
            },
            {
              id: data.chat_id,
              name: data.chat_name,
              is_private: data.is_private
            }
          );
        }
      });

      return () => {
        unsubscribeNewChat();
        globalWebSocketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getChatGroups();
      setConversations(response.data);
      
      // Calculate total unread count
      const totalUnread = response.data.reduce((count, conv) => {
        return count + (conv.unread_count || 0);
      }, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to demo data if API fails
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (conversationData) => {
    try {
      const response = await chatAPI.createChatGroup(conversationData);
      const newConversation = response.data;
      
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const startPrivateChat = async (username) => {
    try {
      // Check if private chat already exists
      const existingChat = conversations.find(conv => 
        conv.is_private && 
        conv.members?.some(member => member.username === username)
      );

      if (existingChat) {
        return existingChat;
      }

      // Create new private chat
      const conversationData = {
        name: `private-${Date.now()}`,
        is_private: true,
        invite_user: username,
      };

      return await createConversation(conversationData);
    } catch (error) {
      console.error('Error starting private chat:', error);
      throw error;
    }
  };

  const openChat = useCallback((conversation) => {
    setActiveChats(prev => {
      // Check if chat is already open
      const existingIndex = prev.findIndex(chat => chat.id === conversation.id);
      if (existingIndex !== -1) {
        // Move to front and ensure it's not minimized
        const updatedChats = [...prev];
        updatedChats[existingIndex] = { ...updatedChats[existingIndex], isMinimized: false };
        return updatedChats;
      }

      // Add new chat (limit to 3 open chats)
      const newChat = { ...conversation, isMinimized: false };
      const updatedChats = [newChat, ...prev.slice(0, 2)];
      return updatedChats;
    });
  }, []);

  const closeChat = useCallback((chatId) => {
    setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
  }, []);

  const minimizeChat = useCallback((chatId) => {
    setActiveChats(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, isMinimized: !chat.isMinimized }
          : chat
      )
    );
  }, []);

  const markAsRead = useCallback((conversationId) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
    
    // Recalculate total unread count
    setUnreadCount(prev => {
      const conversation = conversations.find(c => c.id === conversationId);
      return Math.max(0, prev - (conversation?.unread_count || 0));
    });
  }, [conversations]);

  const addMessage = useCallback((conversationId, message) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const isOwnMessage = message.author.id === user?.id;
          return {
            ...conv,
            last_message: {
              author: message.author.username,
              body: message.body,
              created: message.created,
            },
            unread_count: isOwnMessage ? conv.unread_count : (conv.unread_count || 0) + 1,
          };
        }
        return conv;
      })
    );

    // Update total unread count
    if (message.author.id !== user?.id) {
      setUnreadCount(prev => prev + 1);
    }

    // Show notification if chat is not active
    const isActiveChat = activeChats.some(chat => 
      chat.id === conversationId && !chat.isMinimized
    );
    
    if (!isActiveChat && message.author.id !== user?.id) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && window.showChatNotification) {
        window.showChatNotification(message, conversation);
      }
    }
  }, [user?.id, activeChats, conversations]);

  const inviteUserToChat = async (chatId, username) => {
    try {
      await chatAPI.inviteUser(chatId, username);
      // Reload conversations to get updated member list
      await loadConversations();
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  };

  const value = {
    // State
    conversations,
    activeChats,
    unreadCount,
    isLoading,
    
    // Actions
    loadConversations,
    createConversation,
    startPrivateChat,
    openChat,
    closeChat,
    minimizeChat,
    markAsRead,
    addMessage,
    inviteUserToChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
