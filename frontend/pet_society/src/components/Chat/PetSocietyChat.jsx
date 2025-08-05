import { ChatProvider } from '../../contexts/ChatContext';
import MessengerWidget from './MessengerWidget';
import NotificationSystem from './NotificationSystem';
import { useChat } from '../../contexts/ChatContext';

/**
 * Main chat component that provides the complete Messenger-like experience
 * This should be placed at the root level of your Pet Society app
 */
const ChatSystem = () => {
  const { openChat } = useChat();

  const handleNotificationClick = (conversation, message) => {
    openChat(conversation);
  };

  return (
    <>
      <MessengerWidget />
      <NotificationSystem onMessageClick={handleNotificationClick} />
    </>
  );
};

/**
 * Complete Pet Society Chat integration
 * Wrap your entire app with this component
 */
const PetSocietyChat = ({ children }) => {
  return (
    <ChatProvider>
      {children}
      <ChatSystem />
    </ChatProvider>
  );
};

export default PetSocietyChat;
