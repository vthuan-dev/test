import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, Avatar, CircularProgress, Badge } from '@mui/material';
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

// Thêm hàm thông báo
const showNotification = (title: string, body: string) => {
  if (!("Notification" in window)) {
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      new Notification(title, {
        body,
        icon: '/path/to/notification-icon.png' // Thêm icon của bạn
      });
    }
  });
};

const ClientChatBox = () => {
  const { user, isAuhthentication } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  if (!isAuhthentication || !user) {
    return null;
  }

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
      
      // Lắng nghe tin nhắn mới
      const handleNewMessage = (data) => {
        console.log('Received new message:', data);
        
        // Kiểm tra nếu tin nhắn không phải từ user hiện tại
        if (data.sender_id !== user.id) {
          // Tăng số tin nhắn chưa đọc nếu chat box đang đóng
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
            // Hiển thị thông báo
            showNotification(
              'Tin nhắn mới',
              `${data.sender_name || 'Admin'}: ${data.message}`
            );
          }
        }

        setMessages(prev => {
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
      };

      socket.on('new_message', handleNewMessage);
      
      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [conversation?.id, isOpen, user.id]);

  // Reset unreadCount khi mở chat box
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

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
    
    const messageText = message.trim(); // Lưu lại tin nhắn trước khi xóa
    setMessage(''); // Xóa tin nhắn ngay lập tức để UX tốt hơn
    setLoading(true);
    setError(null);

    try {
      const messageData = {
        conversation_id: conversation.id,
        sender_id: user.id,
        message: messageText,
        username: user.username
      };

      const response = await chatService.sendMessage(messageData);

      if (response.isSuccess) {
        const newMessage = {
          id: response.data.id,
          ...messageData,
          is_read: false,
          created_at: new Date().toISOString()
        };

        socket.emit('send_message', newMessage);
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setMessage(messageText); // Khôi phục tin nhắn nếu gửi thất bại
    } finally {
      setLoading(false);
      // Focus lại input sau khi hoàn thành
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
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
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#ff3d71',
              color: 'white',
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.2)' },
                '100%': { transform: 'scale(1)' }
              }
            }
          }}
        >
          <IconButton 
            onClick={() => setIsOpen(true)}
            sx={{
              backgroundColor: '#0f1123',
              color: '#00ff88',
              width: 65,
              height: 65,
              boxShadow: '0 0 25px rgba(0, 255, 136, 0.4), inset 0 0 20px rgba(0, 255, 136, 0.2)',
              border: '2px solid rgba(0, 255, 136, 0.3)',
              '&:hover': { 
                backgroundColor: '#161832',
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: '0 0 35px rgba(0, 255, 136, 0.6), inset 0 0 25px rgba(0, 255, 136, 0.3)',
                border: '2px solid rgba(0, 255, 136, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }
            }}
          >
            <ChatIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Badge>
      ) : (
        <Paper 
          elevation={24}
          sx={{ 
            width: 380,
            height: 550,
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'linear-gradient(165deg, #0f1123 0%, #1a1b2e 100%)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            boxShadow: `
              0 0 40px rgba(0, 255, 136, 0.15),
              0 0 80px rgba(0, 255, 136, 0.1),
              inset 0 0 30px rgba(0, 255, 136, 0.05)
            `,
            animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '@keyframes slideUp': {
              from: { transform: 'translateY(30px)', opacity: 0 },
              to: { transform: 'translateY(0)', opacity: 1 }
            }
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 2.5, 
            background: 'linear-gradient(90deg, #0f1123 0%, #1a1b2e 100%)',
            borderBottom: '2px solid rgba(0, 255, 136, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
              animation: 'glow 3s linear infinite',
              '@keyframes glow': {
                '0%, 100%': { opacity: 0.3 },
                '50%': { opacity: 0.8 }
              }
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 45,
                    height: 45,
                    background: 'linear-gradient(135deg, #00ff88 0%, #00b8ff 100%)',
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)' },
                      '50%': { boxShadow: '0 0 30px rgba(0, 255, 136, 0.6)' },
                      '100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)' }
                    }
                  }}
                >
                  <ChatIcon sx={{ fontSize: 24, color: '#0f1123' }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '1.3rem', 
                      fontWeight: 600,
                      background: 'linear-gradient(90deg, #00ff88, #00b8ff)',
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Tin nhắn hỗ trợ
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(0, 255, 136, 0.7)',
                      fontSize: '0.8rem'
                    }}
                  >
                    Trực tuyến 24/7
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={() => setIsOpen(false)} 
                sx={{ 
                  color: '#00ff88',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 255, 136, 0.15)',
                    transform: 'scale(1.1) rotate(90deg)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Messages Area */}
          <Box sx={{ 
            flex: 1, 
            p: 2.5, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            bgcolor: '#0f1123',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.03) 0%, transparent 100%)',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#0f1123'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(180deg, #00ff88, #00b8ff)',
              borderRadius: '3px',
              '&:hover': {
                background: 'linear-gradient(180deg, #00b8ff, #00ff88)'
              }
            }
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
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  py: 4,
                  opacity: 0.7
                }}
              >
                <ChatIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" align="center">
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                </Typography>
              </Box>
            )}
            
            {isTyping && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  pl: 2,
                  animation: 'fadeIn 0.3s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 }
                  }
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {typingUser} đang nhập...
                </Typography>
                <CircularProgress size={12} />
              </Box>
            )}
            
            {error && (
              <Typography 
                color="error" 
                variant="caption" 
                sx={{ 
                  pl: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <span>⚠️</span> {error}
              </Typography>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ 
            p: 2.5, 
            background: 'linear-gradient(0deg, #0f1123 0%, #1a1b2e 100%)',
            borderTop: '2px solid rgba(0, 255, 136, 0.15)',
            position: 'relative'
          }}>
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              maxRows={4}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyPress}
              disabled={loading}
              placeholder="Nhập tin nhắn..."
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  borderRadius: '12px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: '#00ff88'
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: '#00ff88',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  color: '#fff',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton 
                    onClick={handleSend} 
                    disabled={!message.trim() || loading}
                    sx={{
                      color: '#00ff88',
                      background: 'rgba(0, 255, 136, 0.1)',
                      '&:hover': {
                        background: 'rgba(0, 255, 136, 0.2)',
                        transform: 'scale(1.1)',
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(0, 255, 136, 0.3)'
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress 
                        size={24} 
                        sx={{ color: '#00ff88' }}
                      />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ClientChatBox; 