import { Box, Typography, Avatar } from '@mui/material';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  user_type?: number;
}

interface MessageBubbleProps {
  message: Message;
  currentUser: any;
}

export const MessageBubble = ({ message, currentUser }: MessageBubbleProps) => {
  const isOwnMessage = message.sender_id === currentUser.id;
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1,
        gap: 1
      }}
    >
      {!isOwnMessage && (
        <Avatar sx={{ width: 32, height: 32 }}>
          {message.sender_name?.[0]}
        </Avatar>
      )}
      
      <Box
        sx={{
          maxWidth: '70%',
          p: 1.5,
          bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
          color: isOwnMessage ? 'white' : 'text.primary',
          borderRadius: 2,
          wordBreak: 'break-word'
        }}
      >
        {!isOwnMessage && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {message.sender_name}
          </Typography>
        )}
        <Typography variant="body2">{message.message}</Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            mt: 0.5,
            color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            textAlign: 'right'
          }}
        >
          {new Date(message.created_at).toLocaleTimeString()}
          {message.is_read && isOwnMessage && ' ✓'}
        </Typography>
      </Box>
    </Box>
  );
}; 