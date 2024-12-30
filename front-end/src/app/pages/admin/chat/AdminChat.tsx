import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  useTheme,
  Divider,
  CircularProgress,
  TextField
} from '@mui/material';
import { io } from "socket.io-client";
import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { AdminChatList } from './components/AdminChatList';
import { AdminChatBox } from './components/AdminChatBox';
import { chatService } from '~/services/chat.service';
import useAuth from '~/app/redux/slices/auth.slice';
import ErrorBoundary from '~/app/components/ErrorBoundary';
import debounce from 'lodash/debounce';

const socket = io('http://localhost:5001');

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminChat = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations(user.id, 1);
      
      if (response && response.data) {
        setConversations(response.data);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Tạo debounced version của fetchConversations
  const debouncedFetchConversations = useCallback(
    debounce(() => {
      fetchConversations();
    }, 1000),
    []
  );

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      
      // Thêm listener cho new_conversation
      socket.on('new_conversation', (newConversation) => {
        console.log('New conversation received in AdminChat:', newConversation);
        setConversations(prev => {
          const exists = prev.some(conv => conv.id === newConversation.id);
          if (!exists) {
            return [newConversation, ...prev];
          }
          return prev;
        });
      });
      
      socket.on('new_message', handleNewMessage);
      socket.on('messages_read', handleMessagesRead);
      socket.on('conversation_closed', handleConversationClosed);
      
      // Thêm event listener cho socket error
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      return () => {
        socket.off('new_conversation');
        socket.off('new_message');
        socket.off('messages_read');
        socket.off('conversation_closed');
        socket.off('connect_error');
      };
    }
  }, [user]);

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      setSelectedConversation(conversation);
      socket.emit('join_conversation', conversation.id);
      
      // Lấy tin nhắn
      const response = await chatService.getMessages(conversation.id);
      console.log('Messages response:', response);
      
      // Kiểm tra và set messages
      if (response && response.data && Array.isArray(response.data)) {
        setMessages(response.data);
        
        // Đánh dấu đã đọc
        await chatService.markMessagesAsRead(conversation.id, user.id);
        
        // Emit socket event
        socket.emit('messages_read', {
          conversation_id: conversation.id,
          user_id: user.id
        });
      } else {
        console.warn('Invalid messages format:', response);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleNewMessage = (message) => {
    console.log('Received new message:', message);
    
    if (message.conversation_id === selectedConversation?.id) {
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === message.id);
        if (messageExists) {
          return prev;
        }

        return [...prev, {
          id: message.id,
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          message: message.message,
          username: message.username || message.sender_name,
          created_at: message.created_at,
          is_read: false
        }];
      });

      if (message.sender_id !== user.id) {
        chatService.markMessagesAsRead(message.conversation_id, user.id);
        socket.emit('messages_read', {
          conversation_id: message.conversation_id,
          user_id: user.id
        });
      }
    }
  };

  const handleMessagesRead = ({ conversation_id }) => {
    if (conversation_id === selectedConversation?.id) {
      setMessages(prev => 
        prev.map(msg => ({ ...msg, is_read: true }))
      );
    }
  };

  const handleConversationClosed = ({ conversation_id }) => {
    fetchConversations();
    if (conversation_id === selectedConversation?.id) {
      setSelectedConversation(null);
    }
  };

  const handleMessageSent = useCallback(async () => {
    // Refresh conversations list
    await fetchConversations();
    // Refresh messages if needed
    if (selectedConversation) {
      const messagesResponse = await chatService.getMessages(selectedConversation.id);
      if (messagesResponse.isSuccess) {
        setMessages(messagesResponse.data);
      }
    }
  }, [selectedConversation]);

  const handleConversationsUpdate = (updater: (prev: Conversation[]) => Conversation[]) => {
    setConversations(prev => updater(prev));
  };

  if (!user) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BaseBreadcrumbs arialabel="Chat với khách hàng">
      <Box 
        sx={{ 
          height: 'calc(100vh - 280px)',
          maxWidth: '1400px',
          margin: '0 auto',
          bgcolor: '#0f1123',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <ErrorBoundary>
          <Grid container sx={{ height: '100%' }}>
            {/* Danh sách chat */}
            <Grid 
              item 
              xs={4}
              sx={{ 
                borderRight: '1px solid rgba(255,255,255,0.05)',
                bgcolor: '#141728',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '350px',
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ 
                p: 2.5,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                bgcolor: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#fff',
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Tin nhắn
                </Typography>
              </Box>

              <Box sx={{ 
                flexGrow: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(255,255,255,0.02)',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }
                }
              }}>
                <AdminChatList 
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleSelectConversation}
                  onConversationsUpdate={handleConversationsUpdate}
                  loading={loading}
                  socket={socket}
                />
              </Box>
            </Grid>

            {/* Khung chat chính */}
            <Grid item xs={8} sx={{ height: '100%', position: 'relative' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#141728',
                  position: 'relative',
                  borderRadius: 0
                }}
              >
                {selectedConversation ? (
                  <>
                    {/* Header chat - fixed position */}
                    <Box sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      zIndex: 10,
                      p: 2,
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      bgcolor: 'rgba(20,23,40,0.95)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#fff',
                        fontWeight: 'bold',
                        border: '2px solid rgba(255,255,255,0.1)'
                      }}>
                        {selectedConversation.user_name?.[0]?.toUpperCase()}
                      </Box>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontSize: '1.1rem',
                            color: '#fff',
                            fontWeight: 500
                          }}
                        >
                          {selectedConversation.user_name}
                        </Typography>
                        <Typography 
                          variant="caption"
                          sx={{ 
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.8rem'
                          }}
                        >
                          Online
                        </Typography>
                      </Box>
                    </Box>

                    {/* Messages container - điều chỉnh padding-top */}
                    <Box sx={{ 
                      flexGrow: 1,
                      height: '100%',
                      pt: '73px', // Thêm padding-top bằng chiều cao của header
                      pb: '80px', // Thêm padding-bottom để tránh bị che bởi input
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <AdminChatBox 
                        conversation={selectedConversation}
                        messages={messages}
                        currentUser={user}
                        socket={socket}
                        onMessageSent={handleMessageSent}
                      />
                    </Box>
                  </>
                ) : (
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    height="100%"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.02)',
                      borderRadius: 2,
                      p: 4,
                      m: 2,
                      border: '1px dashed rgba(255,255,255,0.1)'
                    }}
                  >
                    <Typography 
                      sx={{ 
                        textAlign: 'center',
                        maxWidth: 300,
                        fontSize: '0.95rem',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.6
                      }}
                    >
                      Chọn một cuộc hội thoại để bắt đầu chat
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </ErrorBoundary>
      </Box>
    </BaseBreadcrumbs>
  );
};

export default AdminChat; 