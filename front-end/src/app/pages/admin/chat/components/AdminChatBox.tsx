import { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { MessageBubble } from './MessageBubble';
import { chatService } from '~/services/chat.service';
import { Socket } from 'socket.io-client';

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
   const [isTyping, setIsTyping] = useState(false);
   const [typingUser, setTypingUser] = useState('');
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const typingTimeoutRef = useRef<NodeJS.Timeout>();

   useEffect(() => {
      if (conversation?.id) {
         socket.emit('join_conversation', conversation.id);
         
         socket.on('user_typing', (username: string) => {
            setIsTyping(true);
            setTypingUser(username);
            
            if (typingTimeoutRef.current) {
               clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
               setIsTyping(false);
               setTypingUser('');
            }, 2000);
         });

         return () => {
            socket.off('user_typing');
         };
      }
   }, [conversation, socket]);

   useEffect(() => {
      scrollToBottom();
   }, [messages]);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   };

   const handleSend = async () => {
      if (!message.trim() || !conversation?.id) return;

      setLoading(true);
      try {
         const messageData = {
            conversation_id: conversation.id,
            sender_id: currentUser.id,
            message: message.trim()
         };

         const response = await chatService.sendMessage(messageData);
         
         if (response.isSuccess) {
            setMessage('');
            onMessageSent();
         }
      } catch (error) {
         console.error('Error sending message:', error);
      } finally {
         setLoading(false);
      }
   };

   const handleTyping = () => {
      if (conversation?.id) {
         socket.emit('typing', {
            conversation_id: conversation.id,
            username: currentUser.username
         });
      }
   };

   if (!conversation) {
      return (
         <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
         }}>
            <Typography color="text.secondary">
               Chọn một cuộc hội thoại để bắt đầu
            </Typography>
         </Paper>
      );
   }

   return (
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
         <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
         }}>
            <Typography variant="h6">
               Chat với {conversation.user_name}
            </Typography>
         </Box>

         <Box sx={{ 
            flex: 1, 
            p: 2, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
         }}>
            {messages.map((msg) => (
               <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  currentUser={currentUser}
               />
            ))}
            
            {isTyping && (
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                     {typingUser} đang nhập...
                  </Typography>
                  <CircularProgress size={12} />
               </Box>
            )}
            
            <div ref={messagesEndRef} />
         </Box>

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
               disabled={loading}
               placeholder="Nhập tin nhắn..."
               onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                  }
               }}
               InputProps={{
                  endAdornment: (
                     <IconButton 
                        onClick={handleSend} 
                        disabled={!message.trim() || loading}
                     >
                        {loading ? <CircularProgress size={24} /> : <SendIcon />}
                     </IconButton>
                  ),
               }}
            />
         </Box>
      </Paper>
   );
}; 