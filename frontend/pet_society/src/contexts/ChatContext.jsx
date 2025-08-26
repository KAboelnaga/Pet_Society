import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import globalWebSocketService from '../services/globalWebSocket';
import { useAuth } from "../context/AuthContext";
import { decryptMessage } from '../utils/encryption';

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
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  // Function to decrypt messages in a conversation
  const decryptConversation = useCallback((conversation) => {
    if (conversation.messages) {
      return {
        ...conversation,
        messages: conversation.messages.map(msg => ({
          ...msg,
          body: decryptMessage(msg.body)
        }))
      };
    }
    if (conversation.last_message) {
      return {
        ...conversation,
        last_message: {
          ...conversation.last_message,
          body: decryptMessage(conversation.last_message.body)
        }
      };
    }
    return conversation;
  }, []);

  // Load unread count from backend
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await chatAPI.getUnreadCount();
      setUnreadCount(response.data.total_unread_count);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getChatGroups();
      // Handle pagination response format {results: [...]} or direct array
      const conversationsData = response.data.results || response.data;
      const decryptedConversations = conversationsData.map(decryptConversation);
      setConversations(decryptedConversations);
      
      // Get unread count from backend instead of calculating it
      await loadUnreadCount();
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [decryptConversation, loadUnreadCount]);

  // Load conversations and setup global WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();

      // Connect to global WebSocket for notifications
      globalWebSocketService.connect(user);

      // Listen for new chat notifications
      const unsubscribeNewChat = globalWebSocketService.onNewChat((data) => {
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

      // Listen for message notifications
      const unsubscribeMessage = globalWebSocketService.onMessage((data) => {
        if (data.type === 'chat_message_notification') {
          // Check if chat is currently active first
          const activeChats = JSON.parse(localStorage.getItem('activeChats') || '[]');
          const isActiveChat = activeChats.some(chat =>
            chat.id === data.chat_id && !chat.isMinimized
          );

          // Force reload conversations and unread count
          // Immediate state update to force re-render
          setConversations(prev => {
            // Trigger a re-render by creating a new array reference
            return [...prev];
          });
          
          // Then load fresh data
          setTimeout(() => {
            loadConversations();
          }, 100);

          // Show notification if chat is not currently active
          if (!isActiveChat && window.showChatNotification) {
            const conversation = {
              id: data.chat_id,
              name: data.chat_name,
              is_private: data.is_private
            };

            window.showChatNotification(
              {
                author: data.author,
                body: data.message,
                created: data.timestamp
              },
              conversation
            );
          }
        }
      });

      return () => {
        unsubscribeNewChat();
        unsubscribeMessage();
        globalWebSocketService.disconnect();
      };
    } else {
      // If user is not authenticated, make sure WebSocket is disconnected
      globalWebSocketService.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]); // Intentionally excluding loadConversations to avoid reconnections

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

  const markAsRead = useCallback(async (conversationId) => {
    try {
      // Call backend to mark as read
      await chatAPI.markAsRead(conversationId);
      
      // Update local conversation state (remove unread count display)
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
      
      // Refresh total unread count from backend
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [loadUnreadCount]);

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
    
    // Mark the conversation as read when opened
    markAsRead(conversation.id);
  }, [markAsRead]);

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

  const addMessage = useCallback(() => {
    // Simply reload conversations to ensure consistency with backend
    loadConversations();
  }, [loadConversations]);

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

  const toggleMessenger = () => {
    setIsMessengerOpen(prev => !prev);
  };

  const value = {
    // State
    conversations,
    activeChats,
    unreadCount,
    isLoading,
    isMessengerOpen,
    
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
    toggleMessenger,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
