import { IconButton, Tooltip, Badge } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';

/**
 * Simple chat button that can be placed anywhere in your Pet Society app
 * Usage: <ChatButton userId="123" username="john_doe" />
 */
const ChatButton = ({ userId, username, size = 'medium', color = 'primary' }) => {
  const { startPrivateChat, openChat } = useChat();

  const handleChatClick = async () => {
    try {
      const conversation = await startPrivateChat(username);
      openChat(conversation);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <Tooltip title={`Chat with ${username}`}>
      <IconButton
        size={size}
        color={color}
        onClick={handleChatClick}
        sx={{
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <ChatIcon />
      </IconButton>
    </Tooltip>
  );
};

/**
 * Chat button with unread count badge
 * Usage: <ChatButtonWithBadge />
 */
export const ChatButtonWithBadge = ({ size = 'medium', color = 'primary' }) => {
  const { unreadCount } = useChat();

  return (
    <Badge badgeContent={unreadCount} color="error" max={99}>
      <IconButton size={size} color={color}>
        <ChatIcon />
      </IconButton>
    </Badge>
  );
};

export default ChatButton;
