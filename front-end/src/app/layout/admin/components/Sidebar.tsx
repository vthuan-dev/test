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
            width: 260,
            padding: '24px 12px',
            gap: 1,
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
   borderRadius: 4,
   transition: 'background-color 0.3s ease',
   color: '#333',
});

const StyledLinkOne = styled(NavLink)(({ theme }) => ({
   display: 'flex',
   alignItems: 'center',
   padding: '8px 16px',
   borderRadius: 4,
   transition: 'background-color 0.3s ease',
   color: '#333',
   textDecoration: 'none',
   '&:hover': {
      backgroundColor: '#f0f0f0',
   },
   '&.active': {
      backgroundColor: theme.palette.primary.main,
      p: { color: 'white' },
      svg: { color: 'white' },
   },
}));

export default Sidebar;
