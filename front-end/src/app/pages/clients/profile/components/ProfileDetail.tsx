import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import dayjs from 'dayjs';

import useAuth from '~/app/redux/slices/auth.slice';

const ProfileDetail = () => {
   const { user } = useAuth();

   return (
      <>
         <Box display="flex" justifyContent="space-between">
            <Typography variant="h5">Tổng quan tài khoản</Typography>
            <Button variant="text" color="primary">
               Chỉnh sửa hồ sơ
            </Button>
         </Box>
         <Divider sx={{ my: 2 }} />
         <Box>
            <Grid container spacing={2}>
               <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                     TÊN TÀI KHOẢN
                  </Typography>
                  <Typography variant="body1">{user?.username || 'N/A'}</Typography>
               </Grid>
               <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                     SỐ ĐIỆN THOẠI
                  </Typography>
                  <Typography variant="body1">{user?.phone || 'N/A'}</Typography>
               </Grid>
               <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                     EMAIL
                  </Typography>
                  <Typography variant="body1">{user?.email || 'N/A'}</Typography>
               </Grid>
               <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                     LOẠI NGƯỜI DÙNG
                  </Typography>
                  <Typography variant="body1">{user?.user_type === 1 ? 'Admin' : 'Regular User'}</Typography>
               </Grid>
               <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                     VIP
                  </Typography>
                  <Typography variant="body1">{user?.is_vip ? 'Yes' : 'No'}</Typography>
               </Grid>
               <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                     NGÀY TẠO
                  </Typography>
                  <Typography variant="body1">{dayjs(user?.created_at).format('DD/MM/YYYY')}</Typography>
               </Grid>
            </Grid>
         </Box>
      </>
   );
};

export default ProfileDetail;
