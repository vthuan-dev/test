/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { useAuth } from '@App/redux/slices/auth.slice';
import { Navigate, Outlet } from 'react-router-dom';

import { USER_TYPE } from './user-type';

import { SETTINGS_CONFIG } from '~/app/configs/settings';
import useAuth from '~/app/redux/slices/auth.slice';

function PublicRouter({ children }: { children?: React.ReactNode }) {
   const { isAuhthentication, isInitialized, user } = useAuth();

   if (isAuhthentication && isInitialized) {
      const routeRedirect =
         user?.user_type == USER_TYPE.ADMIN
            ? SETTINGS_CONFIG.SIGN_IN_REDIRECT_URL_ADMIN
            : SETTINGS_CONFIG.SIGN_IN_REDIRECT_URL_CLIENT;

      return <Navigate to={routeRedirect} />;
   }

   return children || <Outlet />;
}
export default PublicRouter;
