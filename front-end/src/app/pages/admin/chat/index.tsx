import { Box, Grid } from '@mui/material';
import { BaseBreadcrumbs } from '~/app/components/BaseBreadcrumbs';
import { AdminChatList } from './components/AdminChatList';
import { AdminChatBox } from './components/AdminChatBox';

const AdminChat = () => {
   return (
      <BaseBreadcrumbs>
         <Box sx={{ height: 'calc(100vh - 180px)' }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
               <Grid item xs={3}>
                  <AdminChatList />
               </Grid>
               <Grid item xs={9}>
                  <AdminChatBox />
               </Grid>
            </Grid>
         </Box>
      </BaseBreadcrumbs>
   );
};

export default AdminChat;