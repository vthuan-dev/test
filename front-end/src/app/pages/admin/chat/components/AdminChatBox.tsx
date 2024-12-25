import { useState } from 'react';
import { Box, Paper, Typography, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export const AdminChatBox = () => {
   const [message, setMessage] = useState('');

   const handleSend = () => {
      if (message.trim()) {
         // TODO: Implement send message
         setMessage('');
      }
   };

   return (
      <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
         <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Chat với khách hàng</Typography>
         </Box>

         <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
            {/* Messages will be rendered here */}
         </Box>

         <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
               fullWidth
               size="small"
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Nhập tin nhắn..."
               onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                  }
               }}
               InputProps={{
                  endAdornment: (
                     <IconButton onClick={handleSend} disabled={!message.trim()}>
                        <SendIcon />
                     </IconButton>
                  ),
               }}
            />
         </Box>
      </Paper>
   );
}; 