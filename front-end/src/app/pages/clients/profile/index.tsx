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

   // Function to handle logout modal open
   const handleOpenLogoutModal = () => {
      setOpenLogoutModal(true);
   };

   // Function to handle logout modal close
   const handleCloseLogoutModal = () => {
      setOpenLogoutModal(false);
   };

   // Function to confirm logout
   const handleConfirmLogout = () => {
      authLogout(); // Call logout function
      setOpenLogoutModal(false);
   };

   const handleViewChange = (view: 'overview' | 'editProfile' | 'changePassword' | 'cart') => {
      setSelectedView(view);
   };

   return (
      <BaseBreadcrumbs arialabel="Tổng quan tài khoản" breadcrumbs={breadcrumbs}>
         <Box>
            <Grid container spacing={2}>
               {/* Sidebar */}
               <Grid item xs={12} md={4}>
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                     <Box display="flex" flexDirection="row" justifyContent="center" gap={2} alignItems="center">
                        <Avatar sx={{ width: 56, height: 56 }}>L</Avatar>
                        <Stack>
                           <Typography variant="h6">{user?.username}</Typography>
                           <Typography variant="body2" color="textSecondary">
                              {user?.email}
                           </Typography>
                        </Stack>
                     </Box>
                     <List sx={{ mt: 2 }}>
                        <ListItemButton onClick={() => handleViewChange('overview')}>
                           <ListItemIcon>
                              <Home color="primary" />
                           </ListItemIcon>
                           <ListItemText primary="Tổng quan tài khoản" />
                        </ListItemButton>
                        <ListItemButton onClick={() => handleViewChange('cart')}>
                           <ListItemIcon>
                              <ShoppingCartIcon color="primary" />
                           </ListItemIcon>
                           <ListItemText primary="Lịch sử đặt hàng" />
                        </ListItemButton>
                        <ListItemButton onClick={() => handleViewChange('editProfile')}>
                           <ListItemIcon>
                              <Edit color="primary" />
                           </ListItemIcon>
                           <ListItemText primary="Chỉnh sửa hồ sơ" />
                        </ListItemButton>
                        <ListItemButton onClick={() => handleViewChange('changePassword')}>
                           <ListItemIcon>
                              <Lock color="primary" />
                           </ListItemIcon>
                           <ListItemText primary="Thay đổi mật khẩu" />
                        </ListItemButton>
                        <ListItemButton onClick={handleOpenLogoutModal}>
                           <ListItemIcon>
                              <ExitToApp color="primary" />
                           </ListItemIcon>
                           <ListItemText primary="Thoát" />
                        </ListItemButton>
                     </List>
                  </Paper>
               </Grid>

               {/* Profile Details / Edit Form */}
               <Grid item xs={12} md={8}>
                  <Paper elevation={1} sx={{ p: 3, bgcolor: '#fff', borderRadius: 2 }}>
                     {selectedView === 'overview' && <ProfileDetail />}
                     {selectedView === 'cart' && <HistoryCart />}
                     {selectedView === 'editProfile' && <ProfileUpdateForm setSelectedView={setSelectedView} />}
                     {selectedView === 'changePassword' && <ChangePasswordForm />}
                  </Paper>
               </Grid>
            </Grid>
         </Box>

         {/* Logout Confirmation Modal */}
         <Dialog
            open={openLogoutModal}
            onClose={handleCloseLogoutModal}
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
         >
            <DialogTitle id="logout-dialog-title">Xác nhận đăng xuất</DialogTitle>
            <DialogContent>
               <DialogContentText id="logout-dialog-description">
                  Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseLogoutModal} color="error" variant="outlined">
                  Hủy
               </Button>
               <Button onClick={handleConfirmLogout} color="primary" variant="contained">
                  Đăng xuất
               </Button>
            </DialogActions>
         </Dialog>
      </BaseBreadcrumbs>
   );
};

export default Profile;
