/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { useAuth } from '@App/redux/slices/auth.slice';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import useAuth from '~/app/redux/slices/auth.slice';

export default function ProfileRoute({ children }: { children?: React.ReactNode }) {
   const { isAuhthentication } = useAuth();

   if (!isAuhthentication) {
      return <Navigate to={'/'} replace />;
   }

   return children || <Outlet />;
}
