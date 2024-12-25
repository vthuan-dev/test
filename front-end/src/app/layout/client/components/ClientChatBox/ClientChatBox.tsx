import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Paper, Typography, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import useAuth from '~/app/redux/slices/auth.slice';

const ClientChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Array<{
    id: number;
    text: string;
    sender: 'user' | 'admin';
    timestamp: Date;
  }>>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      }]);
      setMessage('');
    }
  };

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
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1
                }}
              >
                {msg.sender === 'admin' && (
                  <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
                )}
                <Paper
                  sx={{
                    p: 1,
                    maxWidth: '70%',
                    backgroundColor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: msg.sender === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
                {msg.sender === 'user' && (
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