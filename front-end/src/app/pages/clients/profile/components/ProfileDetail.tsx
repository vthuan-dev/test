import { Avatar, Box, Button, Card, Divider, Grid, Paper, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';

import useAuth from '~/app/redux/slices/auth.slice';

const ProfileDetail = () => {
   const { user } = useAuth();
   const theme = useTheme();

   return (
      <Card sx={{ p: 3, boxShadow: theme.shadows[3] }}>
         <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
               <Avatar 
                  sx={{ 
                     width: 64, 
                     height: 64, 
                     bgcolor: 'primary.main',
                     fontSize: '2rem'
                  }}
               >
                  {user?.username?.charAt(0).toUpperCase()}
               </Avatar>
               <Box>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                     {user?.username || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     {user?.email || 'N/A'}
                  </Typography>
               </Box>
            </Box>
            <Button 
               variant="contained" 
               startIcon={<EditIcon />}
               sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3
               }}
            >
               Chỉnh sửa hồ sơ
            </Button>
         </Box>

         <Divider sx={{ my: 3 }} />

         <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
               <Paper sx={{ p: 2, height: '100%', boxShadow: theme.shadows[1] }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                     <PersonIcon color="primary" />
                     <Typography variant="subtitle1" fontWeight="bold">
                        Thông tin cá nhân
                     </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                     <Box>
                        <Typography variant="body2" color="text.secondary">
                           Tên tài khoản
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                           {user?.username || 'N/A'}
                        </Typography>
                     </Box>
                     <Box>
                        <Typography variant="body2" color="text.secondary">
                           Số điện thoại
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                           {user?.phone || 'Chưa cập nhật'}
                        </Typography>
                     </Box>
                     <Box>
                        <Typography variant="body2" color="text.secondary">
                           Email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                           {user?.email || 'N/A'}
                        </Typography>
                     </Box>
                  </Box>
               </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
               <Paper sx={{ p: 2, height: '100%', boxShadow: theme.shadows[1] }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                     <AdminPanelSettingsIcon color="primary" />
                     <Typography variant="subtitle1" fontWeight="bold">
                        Thông tin tài khoản
                     </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                     <Box>
                        <Typography variant="body2" color="text.secondary">
                           Loại tài khoản
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                           {user?.user_type === 1 ? 'Admin' : 'Người dùng thường'}
                        </Typography>
                     </Box>
                     <Box>
                        <Typography variant="body2" color="text.secondary">
                           Trạng thái VIP
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                           <WorkspacePremiumIcon 
                              color={user?.is_vip ? "warning" : "disabled"} 
                           />
                           <Typography variant="body1" fontWeight="medium">
                              {user?.is_vip ? 'Thành viên VIP' : 'Thành viên thường'}
                           </Typography>
                        </Box>
                     </Box>
                     <Box>
                        <Typography variant="body2" color="text.secondary">
                           Ngày tham gia
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                           {dayjs(user?.created_at).format('DD/MM/YYYY')}
                        </Typography>
                     </Box>
                  </Box>
               </Paper>
            </Grid>
         </Grid>
      </Card>
   );
};

export default ProfileDetail;
