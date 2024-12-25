/* eslint-disable import/order */
import { Box, Container, useTheme } from '@mui/material';

import HeaderAdmin from './components/HeaderAdmin';
import Sidebar from './components/sidebar';

import './header.css';

const LayoutAdmin = ({ children }: { children: React.ReactNode }) => {
   const theme = useTheme();

   return (
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
         <HeaderAdmin />
         <Sidebar />
         <Box
            sx={{
               marginLeft: '250px',
               minHeight: 'calc(100vh - 64px)',
               width: 'calc(100% - 250px)',
               backgroundColor: theme.palette.background.default,
               padding: 2,
            }}
         >
            <Container sx={{ minWidth: '100%', margin: 0, bgcolor: 'white', borderRadius: '12px', py: 2 }}>
               {children}
            </Container>
         </Box>
      </Box>
   );
};

export default LayoutAdmin;
