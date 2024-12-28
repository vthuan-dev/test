import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  CircularProgress,
  Avatar,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { MessageBubble } from './MessageBubble';
import { chatService } from '~/services/chat.service';
import { Socket } from 'socket.io-client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return format(date, 'HH:mm', { locale: vi });
  }
  
  return format(date, 'HH:mm dd/MM/yyyy', { locale: vi });
};

interface AdminChatBoxProps {
  conversation: any;
  messages: any[];
  currentUser: any;
  socket: Socket;
  onMessageSent: () => void;
}

export const AdminChatBox = ({ 
  conversation, 
  messages, 
  currentUser,
  socket,
  onMessageSent 
}: AdminChatBoxProps) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState(messages);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync messages khi props thay đổi
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Socket listener
  useEffect(() => {
    if (socket && conversation?.id) {
      // Join room
      socket.emit('join_conversation', conversation.id);

      // Listen for new messages
      const handleNewMessage = (newMessage) => {
        console.log('New message received:', newMessage);
        if (newMessage.conversation_id === conversation.id) {
          setLocalMessages(prev => {
            const messageExists = prev.some(msg => msg.id === newMessage.id);
            if (messageExists) return prev;
            
            const newMsg = {
              id: newMessage.id,
              conversation_id: newMessage.conversation_id,
              sender_id: newMessage.sender_id,
              message: newMessage.message,
              username: newMessage.username || newMessage.sender_name,
              created_at: newMessage.created_at,
              is_read: false
            };
            
            return [...prev, newMsg];
          });
          scrollToBottom();
          // Notify parent to refresh conversation list
          onMessageSent();
        }
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.emit('leave_conversation', conversation.id);
      };
    }
  }, [socket, conversation?.id]);

  // Thêm useEffect để mark messages as read khi conversation thay đổi
  useEffect(() => {
    if (conversation?.id && currentUser?.id) {
      const markMessagesAsRead = async () => {
        try {
          // Gọi API để đánh dấu tin nhắn đã đọc
          await chatService.markMessagesAsRead(conversation.id, currentUser.id);
          
          // Emit socket event để thông báo tin nhắn đã được đọc
          socket.emit('messages_read', {
            conversation_id: conversation.id,
            user_id: currentUser.id
          });
          
          // Cập nhật local messages
          setLocalMessages(prev => 
            prev.map(msg => ({
              ...msg,
              is_read: true
            }))
          );
          
          // Notify parent để cập nhật lại conversation list
          onMessageSent();
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };

      markMessagesAsRead();
    }
  }, [conversation?.id, currentUser?.id]);

  // Thêm socket listener cho messages_read event
  useEffect(() => {
    if (socket && conversation?.id) {
      socket.on('messages_read', ({ conversation_id }) => {
        if (conversation_id === conversation.id) {
          setLocalMessages(prev => 
            prev.map(msg => ({
              ...msg,
              is_read: true
            }))
          );
        }
      });

      return () => {
        socket.off('messages_read');
      };
    }
  }, [socket, conversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!message.trim() || !conversation?.id) return;
    
    const messageText = message.trim();
    setMessage('');
    setLoading(true);

    try {
      const messageData = {
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        message: messageText,
        username: currentUser.username,
        created_at: new Date().toISOString()
      };

      const response = await chatService.sendMessage(messageData);

      if (response.isSuccess) {
        // Emit socket event immediately
        socket.emit('send_message', {
          ...messageData,
          id: response.data.id
        });
        
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageText);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (conversation?.id) {
      socket.emit('join_conversation', conversation.id);
    }
  }, [conversation?.id, socket]);

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#141728', // Dark theme background
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    }}>
      <Box 
        ref={chatContainerRef}
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            '&:hover': {
              background: 'rgba(255,255,255,0.15)',
            }
          }
        }}
      >
        {localMessages.map((msg, index) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start',
              gap: 0.5,
              animation: 'fadeIn 0.3s ease-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            {index === 0 || new Date(msg.created_at).getTime() - new Date(localMessages[index - 1].created_at).getTime() > 300000 ? (
              <Typography 
                variant="caption" 
                sx={{ 
                  px: 2,
                  py: 0.5,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 5,
                  backdropFilter: 'blur(10px)'
                }}
              >
                {formatMessageTime(msg.created_at)}
              </Typography>
            ) : null}
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1,
              maxWidth: '70%'
            }}>
              {msg.sender_id !== currentUser.id && (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: '2px solid rgba(255,255,255,0.1)',
                    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)'
                  }}
                >
                  {msg.username?.[0]?.toUpperCase()}
                </Avatar>
              )}
              
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: msg.sender_id === currentUser.id 
                    ? 'linear-gradient(135deg, #00ff88 0%, #00b8ff 100%)'
                    : 'rgba(255,255,255,0.05)',
                  color: msg.sender_id === currentUser.id 
                    ? '#000'
                    : '#fff',
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  fontSize: '0.95rem',
                  backdropFilter: 'blur(10px)',
                  border: msg.sender_id === currentUser.id
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: msg.sender_id === currentUser.id
                    ? '0 4px 12px rgba(0,255,136,0.2)'
                    : '0 4px 12px rgba(0,0,0,0.1)',
                  position: 'relative',
                  '&::before': msg.sender_id === currentUser.id ? {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    padding: '2px',
                    background: 'linear-gradient(135deg, #00ff88 0%, #00b8ff 100%)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  } : {}
                }}
              >
                <Typography 
                  sx={{ 
                    fontSize: 'inherit',
                    fontWeight: msg.sender_id === currentUser.id ? 500 : 400,
                    textShadow: msg.sender_id === currentUser.id 
                      ? '0 1px 2px rgba(0,0,0,0.1)'
                      : 'none'
                  }}
                >
                  {msg.message}
                </Typography>
              </Paper>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box 
        sx={{ 
          p: 2,
          bgcolor: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <TextField
          inputRef={inputRef}
          size="medium"
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Nhập tin nhắn..."
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.05)',
              fontSize: '0.95rem',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.08)',
              },
              '& fieldset': {
                border: '1px solid rgba(255,255,255,0.1)',
              },
              '&:hover fieldset': {
                border: '1px solid rgba(255,255,255,0.2)',
              },
              '&.Mui-focused fieldset': {
                border: '2px solid #00ff88',
              }
            },
            '& .MuiInputBase-input': {
              color: '#fff',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.5)',
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
                  '&:hover': {
                    bgcolor: 'rgba(0,255,136,0.1)',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                {loading ? (
                  <CircularProgress 
                    size={24}
                    sx={{
                      color: '#00ff88'
                    }}
                  />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            ),
          }}
        />
      </Box>
    </Box>
  );
}; 