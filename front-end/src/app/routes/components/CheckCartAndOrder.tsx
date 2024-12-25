/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { useAuth } from '@App/redux/slices/auth.slice';
import React from 'react';
import { Outlet } from 'react-router-dom';

import useAuth from '~/app/redux/slices/auth.slice';
import Unauthorized from '@pages/error/Unauthorized';

export default function CheckCartAndOrder({
   children,
   isOrder = false,
}: {
   children?: React.ReactNode;
   isOrder: boolean;
}) {
   const { isAuhthentication } = useAuth();

   if (!isAuhthentication && isOrder) {
      return <Unauthorized />;
   }

   return children || <Outlet />;
}
