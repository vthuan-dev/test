import { type InternalAxiosRequestConfig } from 'axios';

import { SETTINGS_CONFIG } from '../settings';

const middleware = <T>(requestConfig: InternalAxiosRequestConfig<T>) => {
   const authToken = localStorage.getItem(SETTINGS_CONFIG.ACCESS_TOKEN_KEY);

   if (authToken) {
      requestConfig.headers.Authorization = `Bearer ${authToken}`;
      return requestConfig;
   }

   return requestConfig;
};

export default middleware;
