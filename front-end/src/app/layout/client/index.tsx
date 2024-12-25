import React from 'react';
import { Box, Container } from '@mui/material';

import { Footer } from './footer';
import { HeaderClient } from './header-client';
import ClientChatBox from './components/ClientChatBox/ClientChatBox';

export const LayoutClient = ({ children }: { children: React.ReactNode }) => {
   return (
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
         <HeaderClient />
         <Container maxWidth="lg" sx={{ paddingY: 3 }}>
            {children}
         </Container>
         <Footer />
         <ClientChatBox />
      </Box>
   );
};
