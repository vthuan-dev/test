import {
   Box,
   Container,
   Grid,
   IconButton,
   Badge,
   Popover,
   List,
   ListItem,
   ListItemText,
   ListItemAvatar,
   Avatar,
   Typography,
   styled,
   Menu,
   MenuItem,
   ListItemIcon,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Logout from '@mui/icons-material/Logout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRequest } from '~/app/configs';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { createGlobalStyle } from 'styled-components';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

import stillGamingNoBack from '../../../assets/images/still-gaming-no-back.png';
import { ROUTE_PATH } from '@constants';
import useAuth from '~/app/redux/slices/auth.slice';
import notificationSound from '../../../assets/sounds/sound.mp3';

const GlobalStyles = createGlobalStyle`
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const Image = styled('img')({
   height: '40px',
   width: 'auto'
});

const socket = io('http://localhost:5001');

const HeaderAdmin = () => {
   const { authLogout, user } = useAuth();
   const navigate = useNavigate();
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
   const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
   const isOpen = Boolean(anchorEl);
   const [newNotification, setNewNotification] = useState(false);
   const queryClient = useQueryClient();
   const [viewedRequests, setViewedRequests] = useState<number[]>(() => {
      const saved = localStorage.getItem('viewedRequests');
      return saved ? JSON.parse(saved) : [];
   });

   // Tạo audio instance với file từ assets
   const notificationAudio = useMemo(() => new Audio(notificationSound), []);

   // Query để lấy danh sách yêu cầu gia hạn đang chờ duyệt
   const { data: pendingRequests } = useQuery({
      queryKey: ['pending-extend-requests'],
      queryFn: () => getRequest('/order/pending-extend-requests'),
      refetchInterval: 30000,
   });

   // Lưu viewedRequests vào localStorage khi có thay đổi
   useEffect(() => {
      localStorage.setItem('viewedRequests', JSON.stringify(viewedRequests));
   }, [viewedRequests]);

   useEffect(() => {
      const handleNewRequest = (data) => {
         // Phát âm thanh
         notificationAudio.play().catch(err => console.log('Audio play error:', err));
         
         toast.info(`Có yêu cầu gia hạn mới cho phòng ${data.room_name}`, {
            position: "top-right",
            autoClose: 5000,
         });
         setNewNotification(true);
         queryClient.invalidateQueries(['pending-extend-requests']);
      };

      socket.on("new_extend_request", handleNewRequest);

      return () => {
         socket.off("new_extend_request", handleNewRequest);
      };
   }, [queryClient, notificationAudio]);

   const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElNotif(event.currentTarget);
      if (pendingRequests?.data) {
         const newViewedRequests = pendingRequests.data.map(req => req.id);
         setViewedRequests(prev => [...new Set([...prev, ...newViewedRequests])]);
      }
      setNewNotification(false);
   };

   const handleNotifClose = () => {
      setAnchorElNotif(null);
   };

   const handleViewRequest = (orderId: number, requestId: number) => {
      setViewedRequests(prev => [...prev, requestId]);
      setNewNotification(false);
      queryClient.invalidateQueries(['pending-extend-requests']);
      navigate(`/admin/order/${orderId}`);
      handleNotifClose();
   };

   const handleLogout = () => {
      authLogout();
      navigate('/sign-in');
   };

   const unviewedCount = pendingRequests?.data?.filter(
      (request: any) => !viewedRequests.includes(request.id)
   )?.length || 0;

   return (
      <>
         <GlobalStyles />
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
                     <Link to={ROUTE_PATH.ADMIN_HOME}>
                        <Image src={stillGamingNoBack} alt="logo" />
                     </Link>
                  </Grid>
                  <Grid item xs={9} />
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
                           badgeContent={unviewedCount} 
                           color="error"
                           sx={{
                              '& .MuiBadge-badge': {
                                 animation: newNotification ? 'pulse 2s infinite' : 'none'
                              }
                           }}
                        >
                           <NotificationsIcon />
                        </Badge>
                     </IconButton>

                     {/* Admin Avatar */}
                     <IconButton onClick={handleClick}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                           <AccountCircleOutlinedIcon />
                        </Avatar>
                     </IconButton>
                  </Grid>
               </Grid>
            </Container>

            {/* Admin Menu */}
            <Menu
               anchorEl={anchorEl}
               open={isOpen}
               onClose={handleClose}
               onClick={handleClose}
               transformOrigin={{ horizontal: 'right', vertical: 'top' }}
               anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
               PaperProps={{
                  sx: {
                     mt: 1,
                     bgcolor: '#1a1f3c',
                     border: '1px solid rgba(255,255,255,0.1)',
                     boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  }
               }}
            >
               <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                     <Logout fontSize="small" sx={{ color: 'white' }} />
                  </ListItemIcon>
                  <Typography color="white">Đăng xuất</Typography>
               </MenuItem>
            </Menu>

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
                  {!pendingRequests?.data?.length ? (
                     <ListItem sx={{ color: 'white' }}>
                        <ListItemText primary="Không có thông báo mới" />
                     </ListItem>
                  ) : (
                     pendingRequests?.data?.map((request: any) => (
                        <ListItem 
                           key={request.id}
                           onClick={() => handleViewRequest(request.order_id, request.id)}
                           sx={{
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(255,255,255,0.1)',
                              bgcolor: viewedRequests.includes(request.id) 
                                 ? 'rgba(255,255,255,0.02)' 
                                 : 'transparent',
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
      </>
   );
};

export default HeaderAdmin;
