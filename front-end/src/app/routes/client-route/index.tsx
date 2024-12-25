import { Outlet, type RouteObject } from 'react-router-dom';

import ProfileRoute from '../components/profile-route';

import { ROUTE_PATH } from '@constants';
import { HomeClient } from '@pages';
import { LayoutClient } from '@layout';
import Room from '@pages/clients/Room';
import Cart from '@pages/clients/Cart';
import Products from '@pages/clients/Products';
import Profile from '@pages/clients/profile';

/**
 *  Purchase page link for users
 */

const clientRoutes: RouteObject = {
   path: ROUTE_PATH.CLIENT_HOME,
   element: (
      <LayoutClient>
         <Outlet />
      </LayoutClient>
   ),
   children: [
      {
         index: true,
         element: <HomeClient />,
      },
      {
         path: ROUTE_PATH.ROOM,
         element: <Room />,
      },
      {
         path: ROUTE_PATH.CART,
         element: <Cart />,
      },
      {
         path: ROUTE_PATH.PRODUCTS,
         element: <Products />,
      },
      {
         path: ROUTE_PATH.USER_PROFILE,
         element: (
            <ProfileRoute>
               <Profile />
            </ProfileRoute>
         ),
      },
   ],
};

export default clientRoutes;
