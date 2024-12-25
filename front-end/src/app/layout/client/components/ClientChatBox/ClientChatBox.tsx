import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, Avatar, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import useAuth from '~/app/redux/slices/auth.slice';
import { chatService } from '~/services/chat.service';
import { io } from 'socket.io-client';
import { MessageBubble } from './MessageBubble';

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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (user?.id && isOpen) {
      console.log('Initializing chat for user:', user.id);
      initializeChat();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversation?.id) {
      console.log('Joining conversation:', conversation.id);
      socket.emit('join_conversation', conversation.id);
      
      socket.on('new_message', (data) => {
        console.log('Received new message:', data);
        setMessages(prev => {
          // Kiểm tra tin nhắn đã tồn tại chưa
          const messageExists = prev.some(msg => msg.id === data.id);
          if (messageExists) return prev;

          return [...prev, {
            id: data.id,
            conversation_id: data.conversation_id,
            sender_id: data.sender_id,
            message: data.message,
            is_read: false,
            created_at: data.created_at,
            sender_name: data.username || data.sender_name
          }];
        });
        scrollToBottom();
      });
      
      return () => {
        socket.off('new_message');
      };
    }
  }, [conversation, user]);

  useEffect(() => {
    if (conversation?.id) {
      socket.on('user_typing', (username: string) => {
        setIsTyping(true);
        setTypingUser(username);
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser('');
        }, 2000);
      });

      return () => {
        socket.off('user_typing');
      };
    }
  }, [conversation]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      // Create or get existing conversation
      const convResponse = await chatService.createConversation(user.id);
      if (convResponse.data) {
        setConversation(convResponse.data);
        
        // Get messages
        const msgResponse = await chatService.getMessages(convResponse.data.id);
        if (msgResponse && Array.isArray(msgResponse.data)) {
          setMessages(msgResponse.data);
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Không thể kết nối tới server chat');
    } finally {
      setLoading(false);
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
    
    setLoading(true);
    setError(null);

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
    } catch (err) {
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
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

  const handleTyping = () => {
    if (conversation?.id) {
      socket.emit('typing', {
        conversation_id: conversation.id,
        username: user.username
      });
    }
  };

  useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

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
            {messages.length > 0 ? (
              messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={{
                    ...msg,
                    sender_name: msg.sender_name || (msg.sender_id === user.id ? user.username : 'Admin')
                  }}
                  currentUser={user} 
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                Chưa có tin nhắn nào
              </Typography>
            )}
            
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {typingUser} đang nhập...
                </Typography>
                <CircularProgress size={12} />
              </Box>
            )}
            
            {error && (
              <Typography color="error" variant="caption" sx={{ pl: 2 }}>
                {error}
              </Typography>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Nhập tin nhắn..."
              InputProps={{
                endAdornment: (
                  <IconButton 
                    onClick={handleSend} 
                    disabled={!message.trim() || loading}
                  >
                    {loading ? <CircularProgress size={24} /> : <SendIcon />}
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