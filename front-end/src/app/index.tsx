import { ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient, focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';

import Routers from '~/app/routes';
import theme from '~/Theme';
import { InitApp } from '@helpers';
import { ROUTE_PATH } from '@constants';

const queryClient = new QueryClient();
focusManager.setFocused(false);

const App = () => {
   useEffect(() => {
      if (window.location.pathname !== ROUTE_PATH.ORDER) return localStorage.removeItem('order');
   }, []);

   return (
      <QueryClientProvider client={queryClient}>
         <ThemeProvider theme={theme}>
            <BrowserRouter>
               <InitApp>
                  <Routers />
               </InitApp>
            </BrowserRouter>
         </ThemeProvider>
      </QueryClientProvider>
   );
};

export default App;
