import React from 'react';
import { Box, List, ListItem, ListItemText, Typography, CircularProgress } from '@mui/material';
import { Conversation } from '~/services/chat.service';

interface AdminChatListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  loading: boolean;
}

export const AdminChatList: React.FC<AdminChatListProps> = ({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  loading
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

  return (
    <Box sx={{ 
      height: '100%', 
      bgcolor: 'background.paper',
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <List sx={{ height: '100%', overflow: 'auto' }}>
        {conversations.map((conversation) => (
          <ListItem 
            key={conversation.id}
            button
            selected={selectedConversation?.id === conversation.id}
            onClick={() => onSelectConversation(conversation)}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                bgcolor: 'action.selected'
              }
            }}
          >
            <ListItemText
              primary={conversation.user_name}
              secondary={
                <React.Fragment>
                  {conversation.last_message || 'Chưa có tin nhắn'}
                  {conversation.unread_count > 0 && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'error.main',
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    >
                      {conversation.unread_count}
                    </Box>
                  )}
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 