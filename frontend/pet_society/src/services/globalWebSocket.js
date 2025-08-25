class GlobalWebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.newChatHandlers = [];
    this.user = null;
  }

  connect(user) {
    if (this.socket && this.isConnected) {
      return;
    }

    this.user = user;
    const wsUrl = `ws://localhost:8000/ws/notifications/${user.id}/`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  setupEventHandlers() {
    this.socket.onopen = () => {
      console.log('Global WebSocket connected');
      this.isConnected = true;
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
      console.log('Global WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.notifyConnectionHandlers('disconnected');
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('Global WebSocket error:', error);
      this.notifyConnectionHandlers('error', error);
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'new_chat_created':
        this.notifyNewChatHandlers(data);
        break;
      case 'chat_message_notification':
        // Get active chats from localStorage
        const activeChats = JSON.parse(localStorage.getItem('activeChats') || '[]');
        const isChatActive = activeChats.includes(data.chat_id);
        
        // Only notify if chat is not active
        if (!isChatActive) {
          this.notifyMessageHandlers(data);
        } else {
          // If chat is active, mark messages as read
          this.markMessageAsRead(data.chat_id);
        }
        break;
      case 'user_invited':
        this.notifyNewChatHandlers(data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  async markMessageAsRead(chatId) {
    try {
      const { chatAPI } = await import('./api');
      await chatAPI.markAsRead(chatId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.user) {
        this.connect(this.user);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Event handler management
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onConnection(handler) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  onNewChat(handler) {
    this.newChatHandlers.push(handler);
    return () => {
      this.newChatHandlers = this.newChatHandlers.filter(h => h !== handler);
    };
  }

  notifyMessageHandlers(data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  notifyConnectionHandlers(status, data = null) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(status, data);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  notifyNewChatHandlers(data) {
    this.newChatHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in new chat handler:', error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send message to server
  send(data) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }
}

// Create a singleton instance
const globalWebSocketService = new GlobalWebSocketService();

export default globalWebSocketService;
