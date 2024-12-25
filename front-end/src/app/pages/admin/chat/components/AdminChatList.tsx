import { useState } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, Paper, Typography, Badge } from '@mui/material';

export const AdminChatList = () => {
   const [selectedChat, setSelectedChat] = useState<number | null>(null);

   // Mock data - sẽ được thay thế bằng API call
   const conversations = [
      { id: 1, username: 'quocbao', unreadCount: 3, lastMessage: 'Xin chào admin' },
      { id: 2, username: 'khanhngu', unreadCount: 0, lastMessage: 'Cảm ơn admin' },
   ];

   return (
      <Paper sx={{ height: '100%', overflow: 'hidden' }}>
         <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Danh sách chat</Typography>
         </Box>
         <List sx={{ overflow: 'auto', height: 'calc(100% - 60px)' }}>
            {conversations.map((chat) => (
               <ListItem
                  key={chat.id}
                  button
                  selected={selectedChat === chat.id}
                  onClick={() => setSelectedChat(chat.id)}
               >
                  <ListItemAvatar>
                     <Badge badgeContent={chat.unreadCount} color="primary">
                        <Avatar>{chat.username[0].toUpperCase()}</Avatar>
                     </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                     primary={chat.username}
                     secondary={chat.lastMessage}
                  />
               </ListItem>
            ))}
         </List>
      </Paper>
   );
}; 