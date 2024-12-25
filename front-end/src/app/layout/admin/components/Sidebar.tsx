/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Stack, Typography, styled } from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
   HomeOutlined as HomeOutlinedIcon,
   ReceiptLongOutlined as ReceiptLongOutlinedIcon,
   Inventory2Outlined as Inventory2OutlinedIcon,
   DevicesOutlined as DevicesOutlinedIcon,
   MeetingRoomOutlined as MeetingRoomOutlinedIcon,
   PeopleOutlineOutlined as PeopleOutlineOutlinedIcon,
   ChatOutlined as ChatOutlinedIcon,
} from '@mui/icons-material';

import { ROUTE_PATH } from '@constants';

const sideBars = [
   { title: 'Thống kê', to: ROUTE_PATH.ADMIN_HOME, Icon: HomeOutlinedIcon },
   { title: 'Danh sách hóa đơn', to: ROUTE_PATH.ADMIN_ORDER, Icon: ReceiptLongOutlinedIcon },
   { title: 'Danh sách Sản phẩm', to: ROUTE_PATH.ADMIN_PRODUCTS, Icon: Inventory2OutlinedIcon },
   { title: 'Danh sách thiết bị', to: ROUTE_PATH.ADMIN_DESKTOP, Icon: DevicesOutlinedIcon },
   { title: 'Danh sách phòng', to: ROUTE_PATH.ADMIN_ROM, Icon: MeetingRoomOutlinedIcon },
   { title: 'Danh sách khách hàng', to: ROUTE_PATH.ADMIN_USER, Icon: PeopleOutlineOutlinedIcon },
   { title: 'Tin nhắn', to: ROUTE_PATH.ADMIN_CHAT, Icon: ChatOutlinedIcon },
];

const Sidebar = () => {
   return (
      <Stack
         sx={{
            position: 'fixed',
            top: 64,
            bottom: 0,
            left: 0,
            width: 280,
            padding: '24px 16px',
            gap: 1,
            background: 'linear-gradient(135deg, #1a1f3c 0%, #141728 100%)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(255,255,255,0.15)',
              }
            }
         }}
      >
         {sideBars.map((link) => (
            <SidebarLink key={link.to} text={link.title} to={link.to} Icon={link.Icon} />
         ))}
      </Stack>
   );
};

type SidebarLinkProps = {
   text: string;
   to: string;
   Icon: typeof HomeOutlinedIcon;
};

const SidebarLink = ({ text, to, Icon }: SidebarLinkProps) => {
   return (
      <StyledLinkOne
         to={to}
         className={({ isActive }) => (isActive ? 'active' : '')}
         style={{ textDecoration: 'none' }}
         end
      >
         <StyledLink>
            <Icon fontSize="small" />
            <Typography variant="body1" sx={{ marginLeft: 2 }}>
               {text}
            </Typography>
         </StyledLink>
      </StyledLinkOne>
   );
};

const StyledLink = styled(Box)({
   display: 'flex',
   alignItems: 'center',
   width: '100%',
   borderRadius: 8,
   transition: 'all 0.3s ease',
   color: 'rgba(255,255,255,0.7)',
});

const StyledLinkOne = styled(NavLink)(({ theme }) => ({
   display: 'flex',
   alignItems: 'center',
   padding: '12px 16px',
   borderRadius: 12,
   width: '100%',
   transition: 'all 0.3s ease',
   position: 'relative',
   overflow: 'hidden',
   
   '&::before': {
     content: '""',
     position: 'absolute',
     top: 0,
     left: 0,
     width: '100%',
     height: '100%',
     background: 'rgba(255,255,255,0.05)',
     opacity: 0,
     transition: 'all 0.3s ease',
   },

   '&:hover': {
     transform: 'translateX(5px)',
     '&::before': {
       opacity: 1,
     },
     '& .MuiTypography-root': {
       color: '#00ff88',
     },
     '& svg': {
       color: '#00ff88',
     }
   },

   '& svg': {
     color: 'rgba(255,255,255,0.7)',
     transition: 'all 0.3s ease',
     fontSize: '1.3rem',
   },

   '& .MuiTypography-root': {
     fontSize: '0.95rem',
     fontWeight: 500,
     marginLeft: '16px',
     color: 'rgba(255,255,255,0.7)',
     transition: 'all 0.3s ease',
     letterSpacing: '0.3px',
   },

   '&.active': {
     background: 'linear-gradient(90deg, rgba(0,255,136,0.15) 0%, rgba(0,255,136,0.05) 100%)',
     borderLeft: '3px solid #00ff88',
     
     '& .MuiTypography-root': {
       color: '#00ff88',
       fontWeight: 600,
     },
     '& svg': {
       color: '#00ff88',
     },

     '&:hover': {
       transform: 'none',
     }
   },
}));

export default Sidebar;
