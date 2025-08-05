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
  Alert,
  CircularProgress,
} from '@mui/material';

const SimpleChatTest = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch('http://localhost:8000/admin/', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        setApiStatus('connected');
        setError('');
      } else {
        setApiStatus('error');
        setError(`API returned status: ${response.status}`);
      }
    } catch (error) {
      setApiStatus('error');
      setError(`Connection failed: ${error.message}`);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message locally for demo
      const message = {
        id: Date.now(),
        body: newMessage.trim(),
        author: { username: 'TestUser' },
        created: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'success';
      case 'checking': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Pet Society Chat - Simple Test
      </Typography>

      {/* API Status */}
      <Alert severity={getStatusColor()} sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Backend API Status: {apiStatus}
        </Typography>
        {error && (
          <Typography variant="body2">
            {error}
          </Typography>
        )}
      </Alert>

      {/* Test Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test Controls
        </Typography>
        <Box display="flex" gap={1} mb={2}>
          <Button 
            variant="outlined" 
            onClick={testApiConnection}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Test API Connection'}
          </Button>
        </Box>
      </Paper>

      {/* Message Input */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Send Message (Local Demo)
        </Typography>
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
          />
          <Button 
            variant="contained" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Paper>

      {/* Messages */}
      <Paper sx={{ p: 2, height: 300, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Messages ({messages.length})
        </Typography>
        
        {messages.length === 0 ? (
          <Typography color="textSecondary">
            No messages yet. Send a message to test the interface.
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

      {/* Status Information */}
      <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Current Status:
        </Typography>
        <Typography variant="body2">
          • Django Backend: {apiStatus === 'connected' ? '✅ Running' : '❌ Not accessible'}<br/>
          • React Frontend: ✅ Running<br/>
          • WebSocket: 🔄 Ready to test (use full chat interface)<br/>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SimpleChatTest;
