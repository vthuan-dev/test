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
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  // Debug log
  console.log('Conversations in list:', conversations);

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

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        const updatedConversations = conversations.map(conv => {
          if (conv.id === message.conversation_id) {
            return {
              ...conv,
              last_message: message.message,
              last_message_time: message.created_at,
              unread_count: selectedConversation?.id === conv.id ? 0 : conv.unread_count + 1
            };
          }
          return conv;
        });
        
        onConversationsUpdate(updatedConversations);
      });

      return () => {
        socket.off('new_message');
      };
    }
  }, [conversations, selectedConversation, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('messages_read', ({ conversation_id }) => {
        // Cập nhật unread_count của conversation
        onConversationsUpdate(
          conversations.map(conv => 
            conv.id === conversation_id 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      });

      return () => {
        socket.off('messages_read');
      };
    }
  }, [socket, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
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
                fontWeight: 'bold',
                border: '2px solid rgba(255,255,255,0.1)'
              }}>
                {conversation.user_name?.[0]?.toUpperCase()}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1 }}>
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