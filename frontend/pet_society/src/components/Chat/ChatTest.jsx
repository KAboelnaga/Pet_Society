import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import webSocketService from '../../services/websocket';

const ChatTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomName, setRoomName] = useState('test-room');

  useEffect(() => {
    // Set up WebSocket event handlers
    const unsubscribeConnection = webSocketService.onConnection((status) => {
      setConnectionStatus(status);
    });

    const unsubscribeMessage = webSocketService.onMessage((data) => {
      setMessages(prev => [...prev, {
        id: data.message_id || Date.now(),
        body: data.message,
        author: { username: data.username },
        created: data.timestamp || new Date().toISOString(),
      }]);
    });

    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
      webSocketService.disconnect();
    };
  }, []);

  const handleConnect = () => {
    webSocketService.connect(roomName);
  };

  const handleDisconnect = () => {
    webSocketService.disconnect();
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const success = webSocketService.sendMessage(newMessage.trim());
      if (success) {
        setNewMessage('');
      } else {
        alert('WebSocket not connected. Please connect first.');
      }
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'disconnected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        WebSocket Chat Test
      </Typography>

      {/* Connection Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <TextField
            label="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            size="small"
            disabled={connectionStatus === 'connected'}
          />
          <Chip 
            label={connectionStatus} 
            color={getStatusColor()}
            variant="outlined"
          />
        </Box>
        
        <Box display="flex" gap={1}>
          <Button 
            variant="contained" 
            onClick={handleConnect}
            disabled={connectionStatus === 'connected' || !roomName.trim()}
          >
            Connect
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleDisconnect}
            disabled={connectionStatus === 'disconnected'}
          >
            Disconnect
          </Button>
        </Box>
      </Paper>

      {/* Message Input */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            label="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={connectionStatus !== 'connected'}
          />
          <Button 
            variant="contained" 
            onClick={handleSendMessage}
            disabled={connectionStatus !== 'connected' || !newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Paper>

      {/* Messages */}
      <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Messages ({messages.length})
        </Typography>
        
        {messages.length === 0 ? (
          <Typography color="textSecondary">
            No messages yet. Send a message to test the connection.
          </Typography>
        ) : (
          <List>
            {messages.map((message) => (
              <ListItem key={message.id} divider>
                <ListItemText
                  primary={message.body}
                  secondary={`${message.author.username} - ${new Date(message.created).toLocaleTimeString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Instructions */}
      <Paper sx={{ p: 2, mt: 2, backgroundColor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          Test Instructions:
        </Typography>
        <Typography variant="body2">
          1. Make sure Django server is running on http://localhost:8000<br/>
          2. Enter a room name and click "Connect"<br/>
          3. Open another browser tab/window to test real-time messaging<br/>
          4. Send messages and verify they appear in real-time<br/>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatTest;
