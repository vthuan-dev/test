import { Outlet, type RouteObject } from 'react-router-dom';

import PrivateRouter from '../components/private-router';

import { ROUTE_PATH } from '@constants';
import LayoutAdmin from '@layout/admin';
import { AdminProduct, Dashboard, Desktop, Rom, AdminChat } from '@pages/admin';
import RoomDetail from '@pages/admin/rom/RoomDetail';
import Order from '@pages/admin/order';
import OrderRoom from '@pages/admin/orderRoom';
import User from '@pages/admin/user';
import OrderDetail from '@pages/admin/order/OrderDetail';
import UserDetail from '@pages/admin/user/UserDetail';

const adminRoutes: RouteObject = {
   path: ROUTE_PATH.ADMIN_HOME,
   element: (
      <PrivateRouter>
         <LayoutAdmin>
            <Outlet />
         </LayoutAdmin>
      </PrivateRouter>
   ),
   children: [
      {
         index: true,
         element: <Dashboard />,
      },
      {
         path: ROUTE_PATH.ADMIN_PRODUCTS,
         element: <AdminProduct />,
      },
      {
         path: ROUTE_PATH.ADMIN_DESKTOP,
         element: <Desktop />,
      },
      {
         path: ROUTE_PATH.ADMIN_ORDER,
         element: <Outlet />,
         children: [
            {
               index: true,
               element: <Order />,
            },
            {
               path: ROUTE_PATH.ADMIN_ORDER + '/:id',
               element: <OrderDetail />,
            },
         ],
      },
      {
         path: ROUTE_PATH.ADMIN_ORDER_ROOM,
         element: <OrderRoom />,
      },
      {
         path: ROUTE_PATH.ADMIN_USER,
         element: <Outlet />,
         children: [
            {
               index: true,
               element: <User />,
            },
            {
               path: ROUTE_PATH.ADMIN_USER + '/:id',
               element: <UserDetail />,
            },
         ],
      },
      {
         path: ROUTE_PATH.ADMIN_ROM,
         element: <Outlet />,
         children: [
            {
               index: true,
               element: <Rom />,
            },
            {
               path: ':id',
               element: <RoomDetail />,
            },
         ],
      },
      {
         path: ROUTE_PATH.ADMIN_CHAT,
         element: <AdminChat />,
      },
   ],
};

export default adminRoutes;
