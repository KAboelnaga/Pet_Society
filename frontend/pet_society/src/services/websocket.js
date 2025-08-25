import { decryptMessage } from '../utils/encryption';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.roomName = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.messageHandlers = new Set();
    this.connectionHandlers = new Set();
    this.typingHandlers = new Set();
    this.userListHandlers = new Set();
    
    // Initialize active chats from localStorage
    this.activeChats = new Set(
      JSON.parse(localStorage.getItem('activeChats') || '[]')
    );
  }

  // Method to mark a chat as active
  markChatActive(chatId) {
    this.activeChats.add(chatId);
    this._saveActiveChats();
    // Mark messages as read when chat becomes active
    this._markMessagesAsRead(chatId);
  }

  // Method to mark a chat as inactive
  markChatInactive(chatId) {
    this.activeChats.delete(chatId);
    this._saveActiveChats();
  }

  // Check if a chat is active
  isChatActive(chatId) {
    return this.activeChats.has(chatId);
  }

  // Private method to save active chats to localStorage
  _saveActiveChats() {
    localStorage.setItem('activeChats', 
      JSON.stringify(Array.from(this.activeChats))
    );
  }

  // Private method to mark messages as read
  async _markMessagesAsRead(chatId) {
    try {
      const { chatAPI } = await import('./api');
      await chatAPI.markAsRead(chatId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  connect(roomName) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.roomName = roomName;
    const wsUrl = `ws://localhost:8000/ws/chat/${roomName}/`;

    console.log('Attempting to connect to WebSocket:', wsUrl);

    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.notifyConnectionHandlers('error', error);
    }
  }

  setupEventHandlers() {
    this.socket.onopen = () => {
      console.log('WebSocket connected to room:', this.roomName);
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.notifyConnectionHandlers('disconnected');

      // Handle different close codes
      if (event.code === 4001) {
        console.error('WebSocket authentication failed');
        this.notifyConnectionHandlers('auth_error');
        return;
      }

      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyConnectionHandlers('error', error);

      // Try to reconnect after a short delay
      setTimeout(() => {
        if (this.roomName && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      }, 1000);
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'chat_message':
        // The message should already be decrypted by the backend
        this.notifyMessageHandlers(data);
        break;
      case 'typing_indicator':
        this.notifyTypingHandlers(data);
        break;
      case 'user_list_update':
        this.notifyUserListHandlers(data.users);
        break;
      case 'error':
        console.error('WebSocket error:', data.error);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'chat_message',
        message: message
      }));
      return true;
    }
    console.error('WebSocket is not connected');
    return false;
  }

  sendTypingIndicator(isTyping) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping
      }));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }
    this.roomName = null;
    this.reconnectAttempts = 0;
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.roomName) {
        this.connect(this.roomName);
      }
    }, this.reconnectInterval);
  }

  // Event handler management
  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnection(handler) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  onTyping(handler) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  onUserListUpdate(handler) {
    this.userListHandlers.add(handler);
    return () => this.userListHandlers.delete(handler);
  }

  notifyMessageHandlers(data) {
    this.messageHandlers.forEach(handler => handler(data));
  }

  notifyConnectionHandlers(status, error = null) {
    this.connectionHandlers.forEach(handler => handler(status, error));
  }

  notifyTypingHandlers(data) {
    this.typingHandlers.forEach(handler => handler(data));
  }

  notifyUserListHandlers(users) {
    this.userListHandlers.forEach(handler => handler(users));
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'disconnecting';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

// Expose the service globally for cross-component communication
window.webSocketService = webSocketService;

export default webSocketService;
