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

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getChatGroups();
      // Handle pagination response format {results: [...]} or direct array
      const conversationsData = response.data.results || response.data;
      const decryptedConversations = conversationsData.map(decryptConversation);
      setConversations(decryptedConversations);
      
      // Update unread count
      const totalUnread = decryptedConversations.reduce(
        (sum, conv) => sum + (conv.unread_count || 0),
        0
      );
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [decryptConversation]);

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

      // Listen for message notifications (for desktop notifications only)
      const unsubscribeMessage = globalWebSocketService.onMessage((data) => {
        console.log('ChatContext: Message notification received:', data);

        if (data.type === 'chat_message_notification') {
          console.log('ChatContext: Processing message notification:', data);

          // Check if chat is currently active first
          const activeChats = JSON.parse(localStorage.getItem('activeChats') || '[]');
          const isActiveChat = activeChats.some(chat =>
            chat.id === data.chat_id && !chat.isMinimized
          );

          console.log('ChatContext: isActiveChat =', isActiveChat);

          // Update conversations with new message
          setConversations(prev => {
            const existingConv = prev.find(conv => conv.id === data.chat_id);
            
            if (!existingConv) {
              // Conversation not found, reload all conversations
              console.log('Conversation not found, reloading conversations');
              loadConversations();
              return prev;
            }

            const updatedConversations = prev.map(conv => {
              if (conv.id === data.chat_id) {
                return {
                  ...conv,
                  last_message: {
                    id: Date.now(),
                    body: data.message,
                    author: data.author.username,
                    created: data.timestamp
                  },
                  // Only increment unread count if chat is not active
                  unread_count: isActiveChat ? (conv.unread_count || 0) : (conv.unread_count || 0) + 1
                };
              }
              return conv;
            });

            // Sort by most recent message
            const sortedConversations = updatedConversations.sort((a, b) => {
              const aTime = a.last_message?.created || a.created || '0';
              const bTime = b.last_message?.created || b.created || '0';
              return new Date(bTime) - new Date(aTime);
            });

            // Update global unread count from conversations
            const totalUnread = sortedConversations.reduce(
              (sum, conv) => sum + (conv.unread_count || 0),
              0
            );
            setUnreadCount(totalUnread);

            return sortedConversations;
          });

          // Show notification if chat is not currently active

          if (!isActiveChat && window.showChatNotification) {
            console.log('ChatContext: Calling showChatNotification');
            const conversation = conversations.find(c => c.id === data.chat_id) || {
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
        console.log('ChatContext cleanup - disconnecting WebSocket');
        unsubscribeNewChat();
        unsubscribeMessage();
        globalWebSocketService.disconnect();
      };
    } else {
      // If user is not authenticated, make sure WebSocket is disconnected
      globalWebSocketService.disconnect();
    }
  }, [isAuthenticated, user, loadConversations]);

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

    // Note: Unread count is handled by the WebSocket message listener, not here
    // Note: Notifications are handled by the WebSocket message listener, not here
  }, [user?.id]);

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
