/* eslint-disable @typescript-eslint/naming-convention */
import {
   Box,
   Button,
   Container,
   Grid,
   IconButton,
   ListItemIcon,
   Menu,
   MenuItem,
   Stack,
   styled,
   Tooltip,
   type ButtonProps,
   Badge,
   Popover,
   List,
   ListItem,
   ListItemText,
   ListItemAvatar,
   Avatar,
   Typography,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Logout from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useQuery } from '@tanstack/react-query';
import { getRequest } from '~/app/configs';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { createGlobalStyle } from 'styled-components';

import stillGamingNoBack from '../../../assets/images/still-gaming-no-back.png';

import HeaderMenu from './HeaderMenu';

import useAuth from '~/app/redux/slices/auth.slice';
import { ROUTE_PATH } from '@constants';

const GlobalStyles = createGlobalStyle`
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const HeaderAdmin = () => {
   const { authLogout, user } = useAuth();
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
   const isOpen = Boolean(anchorEl);
   const navigate = useNavigate();
   const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);

   // Query để lấy danh sách yêu cầu gia hạn đang chờ duyệt
   const { data: pendingRequests } = useQuery({
      queryKey: ['pending-extend-requests'],
      queryFn: () => getRequest('/order/pending-extend-requests'),
      refetchInterval: 30000, // Tự động refresh mỗi 30 giây
   });

   const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(anchorEl ? null : event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleRedirectProfile = () => {
      handleClose();
   };

   const handleClickLogout = () => {
      handleClose();
      authLogout();
   };

   const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElNotif(event.currentTarget);
   };

   const handleNotifClose = () => {
      setAnchorElNotif(null);
   };

   const handleViewRequest = (orderId: number) => {
      navigate(`/admin/orders/${orderId}`);
      handleNotifClose();
   };

   return (
      <Box
         component="header"
         sx={{
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #1a1f3c 0%, #141728 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
         }}
      >
         <Container
            sx={{
               display: 'flex',
               alignItems: 'center',
               minHeight: '64px',
               padding: '8px 24px',
            }}
         >
            <Grid container spacing={2} alignItems="center">
               <Grid item xs={2}>
                  <Link to="/">
                     <Image 
                        src={stillGamingNoBack} 
                        alt="logo"
                        sx={{
                           height: '40px',
                           transition: 'all 0.3s ease',
                           '&:hover': {
                              transform: 'scale(1.05)',
                              filter: 'brightness(1.2)'
                           }
                        }}
                     />
                  </Link>
               </Grid>
               <Grid item xs={9}>
                  {/* <HeaderMenu /> */}
               </Grid>
               <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  {/* Notification Icon */}
                  <IconButton
                     onClick={handleNotifClick}
                     sx={{
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                     }}
                  >
                     <Badge 
                        badgeContent={pendingRequests?.data?.length || 0} 
                        color="error"
                        sx={{
                           '& .MuiBadge-badge': {
                              animation: pendingRequests?.data?.length 
                                 ? 'pulse 2s infinite' 
                                 : 'none'
                           }
                        }}
                     >
                        <NotificationsIcon />
                     </Badge>
                  </IconButton>

                  {/* User Menu */}
                  <Box sx={{ position: 'relative' }}>
                     <Tooltip title="Cài đặt tài khoản">
                        <IconButton
                           onClick={handleClick}
                           size="small"
                           sx={{
                              padding: '8px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                 background: 'rgba(0,255,136,0.1)',
                              }
                           }}
                        >
                           <Avatar 
                              sx={{
                                 width: 36,
                                 height: 36,
                                 fontSize: '1rem',
                                 fontWeight: 600,
                                 background: 'linear-gradient(135deg, #00ff88 0%, #00b8ff 100%)',
                                 border: '2px solid rgba(255,255,255,0.1)',
                                 transition: 'all 0.3s ease',
                                 '&:hover': {
                                    borderColor: '#00ff88',
                                    transform: 'scale(1.05)'
                                 }
                              }}
                           >
                              {user?.username.split('')[0].toUpperCase()}
                           </Avatar>
                        </IconButton>
                     </Tooltip>

                     <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={isOpen}
                        onClose={handleClose}
                        onClick={handleClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        sx={{
                           '& .MuiPaper-root': {
                              background: 'linear-gradient(135deg, #1a1f3c 0%, #141728 100%)',
                              borderRadius: 2,
                              border: '1px solid rgba(255,255,255,0.05)',
                              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                              backdropFilter: 'blur(10px)',
                              mt: 1.5,
                              minWidth: 200,
                           }
                        }}
                     >
                        <MenuItem 
                           component={Link} 
                           to={ROUTE_PATH.USER_PROFILE}
                           onClick={handleRedirectProfile}
                           sx={{
                              color: '#fff',
                              gap: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                 background: 'rgba(0,255,136,0.1)',
                                 color: '#00ff88',
                                 '& .MuiListItemIcon-root': {
                                    color: '#00ff88'
                                 }
                              }
                           }}
                        >
                           <ListItemIcon>
                              <AccountCircleOutlinedIcon 
                                 fontSize="small" 
                                 sx={{ color: 'rgba(255,255,255,0.7)' }}
                              />
                           </ListItemIcon>
                           Tài khoản
                        </MenuItem>
                        <MenuItem 
                           onClick={handleClickLogout}
                           sx={{
                              color: '#fff',
                              gap: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                 background: 'rgba(255,59,48,0.1)',
                                 color: '#ff3b30',
                                 '& .MuiListItemIcon-root': {
                                    color: '#ff3b30'
                                 }
                              }
                           }}
                        >
                           <ListItemIcon>
                              <Logout 
                                 fontSize="small" 
                                 sx={{ color: 'rgba(255,255,255,0.7)' }}
                              />
                           </ListItemIcon>
                           Đăng xuất
                        </MenuItem>
                     </Menu>
                  </Box>
               </Grid>
            </Grid>
         </Container>

         {/* Notifications Popover */}
         <Popover
            open={Boolean(anchorElNotif)}
            anchorEl={anchorElNotif}
            onClose={handleNotifClose}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'right',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'right',
            }}
            PaperProps={{
               sx: {
                  width: 400,
                  maxHeight: 500,
                  overflow: 'auto',
                  mt: 1,
                  bgcolor: '#1a1f3c',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
               }
            }}
         >
            <List sx={{ p: 0 }}>
               {pendingRequests?.data?.length === 0 ? (
                  <ListItem sx={{ color: 'white' }}>
                     <ListItemText primary="Không có thông báo mới" />
                  </ListItem>
               ) : (
                  pendingRequests?.data?.map((request: any) => (
                     <ListItem 
                        key={request.id}
                        onClick={() => handleViewRequest(request.order_id)}
                        sx={{
                           cursor: 'pointer',
                           borderBottom: '1px solid rgba(255,255,255,0.1)',
                           '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.05)'
                           }
                        }}
                     >
                        <ListItemAvatar>
                           <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <AccessTimeIcon />
                           </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                           primary={
                              <Typography color="white">
                                 Yêu cầu gia hạn phòng {request.room_name}
                              </Typography>
                           }
                           secondary={
                              <Typography color="grey.400" variant="body2">
                                 {dayjs(request.created_at).format('DD/MM/YYYY HH:mm')}
                              </Typography>
                           }
                        />
                     </ListItem>
                  ))
               )}
            </List>
         </Popover>
      </Box>
   );
};

export const ButtonExtend = styled(Button)<ButtonProps>({
   borderColor: 'rgba(0,0,0,0.09)',
   backgroundColor: '#FFFFFF',
   borderRadius: 50,
   paddingLeft: 24,
   paddingRight: 24,
   color: '#212529',
});

ButtonExtend.defaultProps = {
   variant: 'outlined',
};

export const Image = styled('img')({
   width: 'auto',
   height: '48px',
});

const AsideHeader = styled('div')(({ theme }) => ({
   width: `calc(100% - ${theme.base.sidebar.width}px)`,
   borderBottom: '1px solid #eff0f6',
   display: 'flex',
   justifyContent: 'flex-end',
   alignItems: 'center',
}));

const stylePaperProps = {
   elevation: 0,
   sx: {
      overflow: 'visible',
      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
      mt: 1.5,
      '& .MuiAvatar-root': {
         width: 32,
         height: 32,
         ml: -0.5,
         mr: 1,
      },
      '&:before': {
         content: '""',
         display: 'block',
         position: 'absolute',
         top: 0,
         right: 14,
         width: 10,
         height: 10,
         bgcolor: 'background.paper',
         transform: 'translateY(-50%) rotate(45deg)',
         zIndex: 0,
      },
   },
};

export default HeaderAdmin;
