/* eslint-disable @typescript-eslint/naming-convention */
import {
   Avatar,
   Box,
   Grid,
   List,
   ListItemIcon,
   ListItemText,
   Typography,
   Paper,
   ListItemButton,
   Stack,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogContentText,
   DialogActions,
   Button,
   Container,
} from '@mui/material';
import { Home, Edit, Lock, ExitToApp } from '@mui/icons-material';
import { useState } from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import ProfileDetail from './components/ProfileDetail';
import ProfileUpdateForm from './components/ProfileUpdateForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import HistoryCart from './components/historyCart';

import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { ROUTE_PATH } from '@constants';
import useAuth from '~/app/redux/slices/auth.slice';

const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
];

const Profile = () => {
   const { user, authLogout } = useAuth();
   const [selectedView, setSelectedView] = useState<'overview' | 'editProfile' | 'changePassword' | 'cart'>('overview');
   const [openLogoutModal, setOpenLogoutModal] = useState(false);

   const handleOpenLogoutModal = () => setOpenLogoutModal(true);
   const handleCloseLogoutModal = () => setOpenLogoutModal(false);
   const handleConfirmLogout = () => {
      authLogout();
      setOpenLogoutModal(false);
   };

   const handleViewChange = (view: 'overview' | 'editProfile' | 'changePassword' | 'cart') => {
      setSelectedView(view);
   };

   const menuItems = [
      { icon: <Home />, text: 'Tổng quan tài khoản', value: 'overview' },
      { icon: <ShoppingCartIcon />, text: 'Lịch sử đặt hàng', value: 'cart' },
      { icon: <Edit />, text: 'Chỉnh sửa hồ sơ', value: 'editProfile' },
      { icon: <Lock />, text: 'Thay đổi mật khẩu', value: 'changePassword' },
   ];

   return (
      <BaseBreadcrumbs arialabel="Tổng quan tài khoản" breadcrumbs={breadcrumbs}>
         <Container maxWidth="xl">
            <Box sx={{ py: 3 }}>
               <Grid container spacing={3}>
                  {/* Sidebar */}
                  <Grid item xs={12} md={3}>
                     <Paper 
                        elevation={0} 
                        sx={{ 
                           p: 3, 
                           borderRadius: 2,
                           bgcolor: 'background.paper',
                           border: '1px solid',
                           borderColor: 'divider'
                        }}
                     >
                        <Box 
                           sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              mb: 3,
                              pb: 3,
                              borderBottom: '1px solid',
                              borderColor: 'divider'
                           }}
                        >
                           <Avatar 
                              sx={{ 
                                 width: 80, 
                                 height: 80, 
                                 mb: 2,
                                 bgcolor: 'primary.main',
                                 fontSize: '2rem'
                              }}
                           >
                              {user?.username?.charAt(0).toUpperCase()}
                           </Avatar>
                           <Typography variant="h6" sx={{ mb: 0.5 }}>
                              {user?.username}
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                              {user?.email}
                           </Typography>
                        </Box>

                        <List sx={{ px: 1 }}>
                           {menuItems.map((item) => (
                              <ListItemButton
                                 key={item.value}
                                 onClick={() => handleViewChange(item.value as any)}
                                 selected={selectedView === item.value}
                                 sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                       bgcolor: 'primary.light',
                                       '&:hover': {
                                          bgcolor: 'primary.light',
                                       },
                                    },
                                 }}
                              >
                                 <ListItemIcon sx={{ minWidth: 40 }}>
                                    {item.icon}
                                 </ListItemIcon>
                                 <ListItemText primary={item.text} />
                              </ListItemButton>
                           ))}
                           
                           <ListItemButton
                              onClick={handleOpenLogoutModal}
                              sx={{
                                 borderRadius: 1,
                                 color: 'error.main',
                                 '&:hover': {
                                    bgcolor: 'error.lighter',
                                 },
                              }}
                           >
                              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                                 <ExitToApp />
                              </ListItemIcon>
                              <ListItemText primary="Đăng xuất" />
                           </ListItemButton>
                        </List>
                     </Paper>
                  </Grid>

                  {/* Main Content */}
                  <Grid item xs={12} md={9}>
                     <Paper 
                        elevation={0} 
                        sx={{ 
                           p: 3, 
                           borderRadius: 2,
                           bgcolor: 'background.paper',
                           border: '1px solid',
                           borderColor: 'divider',
                           minHeight: '600px'
                        }}
                     >
                        {selectedView === 'overview' && <ProfileDetail />}
                        {selectedView === 'cart' && <HistoryCart />}
                        {selectedView === 'editProfile' && <ProfileUpdateForm setSelectedView={setSelectedView} />}
                        {selectedView === 'changePassword' && <ChangePasswordForm />}
                     </Paper>
                  </Grid>
               </Grid>
            </Box>
         </Container>

         {/* Logout Dialog */}
         <Dialog
            open={openLogoutModal}
            onClose={handleCloseLogoutModal}
            PaperProps={{
               sx: {
                  borderRadius: 2,
                  width: '100%',
                  maxWidth: '400px'
               }
            }}
         >
            <DialogTitle sx={{ pb: 2 }}>
               Xác nhận đăng xuất
            </DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
               </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
               <Button
                  onClick={handleCloseLogoutModal}
                  variant="outlined"
                  color="inherit"
               >
                  Hủy
               </Button>
               <Button
                  onClick={handleConfirmLogout}
                  variant="contained"
                  color="error"
                  autoFocus
               >
                  Đăng xuất
               </Button>
            </DialogActions>
         </Dialog>
      </BaseBreadcrumbs>
   );
};

export default Profile;
