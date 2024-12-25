/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { useAuth } from '@App/redux/slices/auth.slice';
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { USER_TYPE } from './user-type';

import useAuth from '~/app/redux/slices/auth.slice';
import { SETTINGS_CONFIG } from '~/app/configs/settings';
import { ROUTE_PATH } from '@constants';

export default function PrivateRouter({ children }: { children?: React.ReactNode }) {
   const { isAuhthentication, user } = useAuth();

   const location = useLocation();

   if (!isAuhthentication || user?.user_type === USER_TYPE.USER) {
      const routeRedirect = location.pathname.includes(ROUTE_PATH.ADMIN_HOME)
         ? SETTINGS_CONFIG.SIGN_OUT_REDIRECT_ADMIN_URL
         : SETTINGS_CONFIG.SIGN_OUT_REDIRECT_CLIENT_URL;

      return <Navigate to={routeRedirect} replace />;
   }

   return children || <Outlet />;
}
