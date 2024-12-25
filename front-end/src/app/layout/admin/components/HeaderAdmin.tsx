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
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Logout from '@mui/icons-material/Logout';

import stillGamingNoBack from '../../../assets/images/still-gaming-no-back.png';

import HeaderMenu from './HeaderMenu';

import useAuth from '~/app/redux/slices/auth.slice';
import { ROUTE_PATH } from '@constants';

const HeaderAdmin = () => {
   const { authLogout, user } = useAuth();

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
                  <Link to="/">
                     <Image src={stillGamingNoBack} alt="logo" />
                  </Link>
               </Grid>
               <Grid item xs={9} sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* <HeaderMenu /> */}
               </Grid>
               <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
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
                                 <Avatar sx={{ width: 28, height: 28, textTransform: 'uppercase' }} src={''}>
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
                           <MenuItem component={Link} to={ROUTE_PATH.USER_PROFILE} onClick={handleRedirectProfile}>
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
               </Grid>
            </Grid>
         </Container>
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
