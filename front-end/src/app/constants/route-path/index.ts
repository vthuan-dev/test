import * as yup from 'yup';

import ADMIN_ROUTE from './admin-route-path';
import CLIENT_ROUTE_PATH from './client-route-path';

export const ROUTE_PATH = {
   /**
    * @admin
    */
   ...ADMIN_ROUTE,

   /**
    * @client
    */
   ...CLIENT_ROUTE_PATH,

   SIGN_IN: '/sign-in',
   REGISTER: '/register',

   ERROR_404: '/error/404',

   ALL: '*',
} as const;

export const routePathSchema = yup.string().oneOf(Object.values(ROUTE_PATH)).required();

export type RoutePath = yup.InferType<typeof routePathSchema>;
