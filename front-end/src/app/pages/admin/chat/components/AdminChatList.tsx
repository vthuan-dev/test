import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Paper, Typography, Badge, Skeleton } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AdminChatListProps {
  conversations: any[];
  selectedConversation: any;
  onSelectConversation: (conversation: any) => void;
  loading: boolean;
}

export const AdminChatList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  loading 
}: AdminChatListProps) => {
  if (loading) {
    return (
      <Paper sx={{ height: '100%' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Danh sách chat</Typography>
        </Box>
        {[1, 2, 3].map((item) => (
          <Box key={item} sx={{ p: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        ))}
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Danh sách chat ({conversations.length})</Typography>
      </Box>
      <List sx={{ overflow: 'auto', height: 'calc(100% - 60px)' }}>
        {conversations.map((conversation) => (
          <ListItem
            key={conversation.id}
            button
            selected={selectedConversation?.id === conversation.id}
            onClick={() => onSelectConversation(conversation)}
            sx={{
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: conversation.unread_count > 0 ? 'action.hover' : 'inherit'
            }}
          >
            <ListItemAvatar>
              <Badge 
                badgeContent={conversation.unread_count} 
                color="primary"
                invisible={conversation.unread_count === 0}
              >
                <Avatar>{conversation.user_name[0].toUpperCase()}</Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={conversation.user_name}
              secondary={
                <Box component="span" sx={{ display: 'block' }}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {conversation.last_message || 'Chưa có tin nhắn'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(conversation.last_message_time || conversation.created_at), {
                      addSuffix: true,
                      locale: vi
                    })}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 