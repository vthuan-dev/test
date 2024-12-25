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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        message: messageText
      };

      const response = await chatService.sendMessage(messageData);
      
      if (response.isSuccess) {
        socket.emit('send_message', {
          id: response.data.id,
          ...messageData,
          sender_name: currentUser.username,
          created_at: new Date().toISOString()
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

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f5f5'
    }}>
      <Box 
        ref={chatContainerRef}
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start',
              gap: 0.5
            }}
          >
            {/* Hiển thị thời gian nếu cách message trước đó > 5 phút */}
            {index === 0 || new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000 ? (
              <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                {formatMessageTime(msg.created_at)}
              </Typography>
            ) : null}
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              maxWidth: '60%'
            }}>
              {msg.sender_id !== currentUser.id && (
                <Avatar 
                  sx={{ width: 28, height: 28 }}
                  alt={msg.username}
                >
                  {msg.username?.[0]?.toUpperCase()}
                </Avatar>
              )}
              
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: msg.sender_id === currentUser.id ? '#0084ff' : '#ffffff',
                  color: msg.sender_id === currentUser.id ? '#ffffff' : 'inherit',
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  fontSize: '0.9rem'
                }}
              >
                <Typography sx={{ fontSize: 'inherit' }}>{msg.message}</Typography>
              </Paper>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box 
        sx={{ 
          p: 1.5,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <TextField
          size="small"
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          placeholder="Nhập tin nhắn..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f5f5f5',
              fontSize: '0.9rem'
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton 
                onClick={handleSend} 
                disabled={!message.trim() || loading}
                color="primary"
              >
                {loading ? (
                  <CircularProgress size={24} />
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