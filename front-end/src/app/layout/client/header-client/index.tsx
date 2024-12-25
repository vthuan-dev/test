/* eslint-disable @typescript-eslint/naming-convention */
import {
   Avatar,
   Box,
   Button,
   Container,
   Grid,
   IconButton,
   InputAdornment,
   ListItemIcon,
   Menu,
   MenuItem,
   OutlinedInput,
   Stack,
   styled,
   Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Logout from '@mui/icons-material/Logout';

import stillGamingNoBack from '../../../assets/images/still-gaming-no-back.png';

import { ROUTE_PATH } from '@constants';
import useAuth from '~/app/redux/slices/auth.slice';
import { USER_TYPE } from '~/app/routes/components/user-type';
import { images } from '@assets/images';

export const HeaderClient = () => {
   const navigate = useNavigate();

   const { authLogout, user, isAuhthentication } = useAuth();

   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
   const isOpen = Boolean(anchorEl);

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

   return (
      <Box
         component="header"
         sx={({ base }) => ({
            width: '100%',
            backgroundColor: base.header.backgroundColor as string,
            padding: 1,
            display: 'flex',
            alignItems: 'center',
         })}
      >
         <Container
            sx={({ base }) => ({ display: 'flex', alignItems: 'center', paddingY: 0, minHeight: base.header.height })}
         >
            <Grid container spacing={2}>
               <Grid item xs={2}>
                  <Link to={'/'}>
                     <Image src={stillGamingNoBack} alt="logo" />
                  </Link>
               </Grid>
               <Grid item xs={10} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Grid container spacing={2}>
                     {/* <Grid item xs={4}>
                        <OutlinedInputExtend fullWidth />
                     </Grid> */}
                     <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', gap: 3 }}>
                           {user?.user_type === USER_TYPE.ADMIN && (
                              <Box
                                 component={NavLink}
                                 className={({ isActive }) => (isActive ? 'active' : '')}
                                 sx={{
                                    display: 'flex', // Make sure the Box is a flex container
                                    alignItems: 'center', // Center the items vertically
                                    textDecoration: 'none', // Remove underline from text
                                    // padding: '8px 16px', // Add padding for the Box
                                    borderRadius: '4px', // Optional: add rounded corners
                                    '&.active button': {
                                       bgcolor: '#008b4b', // Background color for active state
                                       color: 'white', // Text color for active state
                                    },
                                    '&:hover button': {
                                       bgcolor: '#007a43', // Optional: hover effect
                                       color: 'white',
                                    },
                                 }}
                                 to={ROUTE_PATH.ADMIN_HOME}
                              >
                                 <ButtonExtend
                                    startIcon={
                                       <Image
                                          sx={{ height: 18 }}
                                          src="https://bizweb.dktcdn.net/100/514/629/themes/951567/assets/icon_poly_hea_5.png?1726824761175"
                                       />
                                    }
                                 >
                                    Hệ Thống
                                 </ButtonExtend>
                              </Box>
                           )}

                           <Box
                              component={NavLink}
                              className={({ isActive }) => (isActive ? 'active' : '')}
                              sx={{
                                 display: 'flex', // Make sure the Box is a flex container
                                 alignItems: 'center', // Center the items vertically
                                 textDecoration: 'none', // Remove underline from text
                                 // padding: '8px 16px', // Add padding for the Box
                                 borderRadius: '4px', // Optional: add rounded corners
                                 '&.active button': {
                                    bgcolor: '#008b4b', // Background color for active state
                                    color: 'white', // Text color for active state
                                 },
                                 '&:hover button': {
                                    bgcolor: '#007a43', // Optional: hover effect
                                    color: 'white',
                                 },
                              }}
                              to={ROUTE_PATH.PRODUCTS}
                           >
                              <ButtonExtend
                                 startIcon={<Image sx={{ height: 18, color: 'inherit' }} src={images.products} />}
                              >
                                 Sản phẩm
                              </ButtonExtend>
                           </Box>

                           <Box
                              component={NavLink}
                              className={({ isActive }) => (isActive ? 'active' : '')}
                              sx={{
                                 display: 'flex', // Make sure the Box is a flex container
                                 alignItems: 'center', // Center the items vertically
                                 textDecoration: 'none', // Remove underline from text
                                 // padding: '8px 16px', // Add padding for the Box
                                 borderRadius: '4px', // Optional: add rounded corners
                                 '&.active button': {
                                    bgcolor: '#008b4b', // Background color for active state
                                    color: 'white', // Text color for active state
                                 },
                                 '&:hover button': {
                                    bgcolor: '#007a43', // Optional: hover effect
                                    color: 'white',
                                 },
                              }}
                              to={ROUTE_PATH.ROOM}
                           >
                              <ButtonExtend
                                 startIcon={<Image sx={{ height: 18, color: 'inherit' }} src={images.monitor} />}
                              >
                                 Phòng
                              </ButtonExtend>
                           </Box>

                           {isAuhthentication && (
                              <Box
                                 component={NavLink}
                                 className={({ isActive }) => (isActive ? 'active' : '')}
                                 sx={{
                                    display: 'flex', // Make sure the Box is a flex container
                                    alignItems: 'center', // Center the items vertically
                                    textDecoration: 'none', // Remove underline from text
                                    // padding: '8px 16px', // Add padding for the Box
                                    borderRadius: '4px', // Optional: add rounded corners
                                    '&.active button': {
                                       bgcolor: '#008b4b', // Background color for active state
                                       color: 'white', // Text color for active state
                                    },
                                    '&:hover button': {
                                       bgcolor: '#007a43', // Optional: hover effect
                                       color: 'white',
                                    },
                                 }}
                                 to={ROUTE_PATH.CART}
                              >
                                 <ButtonExtend
                                    startIcon={
                                       <Image
                                          sx={{ height: 18, color: 'inherit' }}
                                          src="https://bizweb.dktcdn.net/100/514/629/themes/951567/assets/icon_poly_hea_4.png?1726824761175"
                                       />
                                    }
                                 >
                                    Giỏ Hàng
                                 </ButtonExtend>
                              </Box>
                           )}
                           {isAuhthentication ? (
                              <AsideHeader>
                                 <Stack sx={{ flexDirection: 'row', px: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', textAlign: 'center' }}>
                                       <Tooltip title="Account settings">
                                          <IconButton
                                             onClick={handleClick}
                                             size="small"
                                             sx={{ ml: 2 }}
                                             aria-controls={isOpen ? 'account-menu' : undefined}
                                             aria-haspopup="true"
                                             aria-expanded={isOpen ? 'true' : undefined}
                                          >
                                             <Avatar
                                                sx={{ width: 28, height: 28, textTransform: 'uppercase' }}
                                                src={''}
                                             >
                                                {user?.username.split('')[0]}
                                             </Avatar>
                                          </IconButton>
                                       </Tooltip>
                                    </Box>
                                    <Menu
                                       anchorEl={anchorEl}
                                       id="account-menu"
                                       open={isOpen}
                                       onClose={handleClose}
                                       sx={{ zIndex: 999999 }}
                                       PaperProps={stylePaperProps}
                                       transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                       anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                       <MenuItem
                                          component={Link}
                                          to={ROUTE_PATH.USER_PROFILE}
                                          onClick={handleRedirectProfile}
                                       >
                                          <ListItemIcon>
                                             <AccountCircleOutlinedIcon fontSize="small" />
                                          </ListItemIcon>
                                          Tài khoản
                                       </MenuItem>
                                       <MenuItem onClick={handleClickLogout}>
                                          <ListItemIcon>
                                             <Logout fontSize="small" />
                                          </ListItemIcon>
                                          Đăng xuất
                                       </MenuItem>
                                    </Menu>
                                 </Stack>
                              </AsideHeader>
                           ) : (
                              <ButtonExtend startIcon={<LoginIcon />} onClick={() => navigate(ROUTE_PATH.SIGN_IN)}>
                                 Đăng nhập
                              </ButtonExtend>
                           )}
                        </Box>
                     </Grid>
                  </Grid>
               </Grid>
            </Grid>
         </Container>
      </Box>
   );
};

export const Image = styled('img')({
   width: 'auto',
   height: '64px',
});

const OutlinedInputExtend = styled(OutlinedInput)({
   borderRadius: 15,
   backgroundColor: '#FFFFFF',
   '&.css-1d3z3hw-MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
      backgroundColor: '#FFFFFF',
   },
});

export const ButtonExtend = styled(Button)<{ component?: React.ElementType; to?: string }>({
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

OutlinedInputExtend.defaultProps = {
   fullWidth: true,
   size: 'small',
   endAdornment: (
      <InputAdornment position="end">
         <IconButton
            aria-label="toggle password visibility"
            onClick={() => {}}
            onMouseDown={() => {}}
            onMouseUp={() => {}}
            edge="end"
         >
            <SearchIcon />
         </IconButton>
      </InputAdornment>
   ),
};

const AsideHeader = styled('div')({
   // width: `calc(100% - ${theme.base.sidebar.width}px)`,
   borderBottom: '1px solid #eff0f6',
   display: 'flex',
   justifyContent: 'flex-end',
   alignItems: 'center',
});

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
