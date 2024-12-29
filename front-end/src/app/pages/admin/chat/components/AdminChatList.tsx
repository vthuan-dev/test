import React, { useEffect } from 'react';
import { Box, List, ListItem, ListItemText, Typography, CircularProgress } from '@mui/material';
import { Conversation } from '~/services/chat.service';

interface AdminChatListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onConversationsUpdate: (conversations: Conversation[]) => void;
  loading: boolean;
  socket: any;
}

export const AdminChatList: React.FC<AdminChatListProps> = ({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  onConversationsUpdate,
  loading,
  socket
}) => {
  useEffect(() => {
    if (socket) {
      // Join admin room khi component mount
      socket.emit('join_room', 'admin_room');
      console.log('Admin joined room');

      // Handle new conversation
      const handleNewConversation = (newConversation: Conversation) => {
        console.log('New conversation received:', newConversation);
        onConversationsUpdate(prevConversations => {
          // Kiểm tra xem conversation đã tồn tại chưa
          const exists = prevConversations.some(conv => conv.id === newConversation.id);
          if (!exists) {
            // Thêm vào đầu danh sách
            return [newConversation, ...prevConversations];
          }
          return prevConversations;
        });
      };

      // Handle new message
      const handleNewMessage = (message: any) => {
        console.log('New message in list:', message);
        onConversationsUpdate(prev => prev.map(conv => {
          if (conv.id === message.conversation_id) {
            return {
              ...conv,
              last_message: message.message,
              last_message_time: message.created_at,
              unread_count: selectedConversation?.id === conv.id ? 0 : (conv.unread_count || 0) + 1
            };
          }
          return conv;
        }));
      };

      // Add event listeners
      socket.on('new_conversation', handleNewConversation);
      socket.on('new_message', handleNewMessage);

      // Cleanup
      return () => {
        console.log('Cleaning up socket listeners');
        socket.off('new_conversation', handleNewConversation);
        socket.off('new_message', handleNewMessage);
        socket.emit('leave_room', 'admin_room');
      };
    }
  }, [socket, selectedConversation, onConversationsUpdate]);

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  // Debug logs
  console.log('Current conversations:', conversations);

  // Kiểm tra mảng conversations
  if (!Array.isArray(conversations) || conversations.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          Không có cuộc hội thoại nào
        </Typography>
      </Box>
    );
  }

  const handleSelectConversation = (conversation: Conversation) => {
    if (conversation.id === selectedConversation?.id) return;
    onSelectConversation(conversation);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      bgcolor: '#141728',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <List sx={{ 
        height: '100%', 
        overflow: 'auto',
        p: 0,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.05)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          '&:hover': {
            background: 'rgba(255,255,255,0.15)',
          }
        }
      }}>
        {conversations.map((conversation) => (
          <ListItem 
            key={conversation.id}
            button
            selected={selectedConversation?.id === conversation.id}
            onClick={() => handleSelectConversation(conversation)}
            sx={{
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
                transform: 'translateX(5px)'
              },
              '&.Mui-selected': {
                bgcolor: 'rgba(0,255,136,0.1)',
                borderLeft: '4px solid #00ff88',
                '&:hover': {
                  bgcolor: 'rgba(0,255,136,0.15)',
                }
              },
              p: 2
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              width: '100%'
            }}>
              {/* Avatar */}
              <Box sx={{ position: 'relative' }}>
                <Box sx={{
                  width: 45,
                  height: 45,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: '#fff',
                  fontWeight: 'bold'
                }}>
                  {conversation.user_name?.[0]?.toUpperCase()}
                </Box>
                
                {/* Unread count badge */}
                {conversation.unread_count > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: '#00ff88',
                      color: '#000',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      border: '2px solid #141728',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {conversation.unread_count}
                  </Box>
                )}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Typography 
                  sx={{ 
                    fontWeight: 600,
                    color: '#fff',
                    fontSize: '0.95rem',
                    mb: 0.5
                  }}
                >
                  {conversation.user_name}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Typography 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.85rem',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {conversation.last_message || 'Chưa có tin nhắn'}
                  </Typography>

                  {conversation.unread_count > 0 && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '12px',
                        bgcolor: '#00ff88',
                        color: '#000',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        minWidth: '24px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,255,136,0.3)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(0,255,136,0.4)' },
                          '70%': { boxShadow: '0 0 0 10px rgba(0,255,136,0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(0,255,136,0)' }
                        }
                      }}
                    >
                      {conversation.unread_count}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>

      {loading && (
        <Box 
          sx={{ 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(20,23,40,0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CircularProgress sx={{ color: '#00ff88' }} />
        </Box>
      )}

      {!loading && (!Array.isArray(conversations) || conversations.length === 0) && (
        <Box 
          sx={{ 
            p: 4,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)'
          }}
        >
          <Typography variant="body2">
            Không có cuộc hội thoại nào
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 