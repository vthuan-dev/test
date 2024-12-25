import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import useAuth from '~/app/redux/slices/auth.slice';
import { chatService } from '~/services/chat.service';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001');

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ClientChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.id && isOpen) {
      initializeChat();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversation?.id) {
      console.log('Joining conversation:', conversation.id);
      socket.emit('join_conversation', conversation.id);
      
      socket.on('new_message', (data) => {
        console.log('Received new message:', data);
        // Only add message if it's from another user
        if (data.sender_id !== user?.id) {
          setMessages(prev => [...prev, data]);
          scrollToBottom();
        }
      });
      
      return () => {
        socket.off('new_message');
      };
    }
  }, [conversation, user]);

  const initializeChat = async () => {
    try {
      // Create or get existing conversation
      const convResponse = await chatService.createConversation(user.id);
      setConversation(convResponse.data);
      
      // Get messages
      if (convResponse.data.id) {
        const msgResponse = await chatService.getMessages(convResponse.data.id);
        setMessages(msgResponse.data.messages || []);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const handleNewMessage = (newMessage: Message) => {
    if (newMessage.conversation_id === conversation?.id) {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    }
  };

  const handleMessagesRead = ({ conversation_id }: { conversation_id: number }) => {
    if (conversation_id === conversation?.id) {
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !conversation?.id) return;

    try {
      const messageData = {
        conversation_id: conversation.id,
        sender_id: user.id,
        message: message.trim()
      };

      // Gửi tin nhắn qua API
      const response = await chatService.sendMessage(messageData);
      console.log('API response:', response);

      if (response.isSuccess) {
        // Thêm tin nhắn mới vào state
        const newMessage = {
          id: response.data.id,
          conversation_id: conversation.id,
          sender_id: user.id,
          message: message.trim(),
          is_read: false,
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage(''); // Clear input
        scrollToBottom(); // Scroll to bottom after new message

        // Emit socket event
        socket.emit('send_message', newMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {!isOpen ? (
        <IconButton 
          onClick={() => setIsOpen(true)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          <ChatIcon />
        </IconButton>
      ) : (
        <Paper sx={{ width: 320, height: 450, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'primary.main', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">Chat Support</Typography>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box sx={{ 
            flex: 1, 
            p: 2, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                  gap: 1
                }}
              >
                {msg.sender_id !== user?.id && (
                  <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
                )}
                <Paper
                  sx={{
                    p: 1,
                    maxWidth: '70%',
                    backgroundColor: msg.sender_id === user?.id ? 'primary.main' : 'grey.100',
                    color: msg.sender_id === user?.id ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body2">{msg.message}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </Typography>
                </Paper>
                {msg.sender_id === user?.id && (
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSend} disabled={!message.trim()}>
                    <SendIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ClientChatBox; 