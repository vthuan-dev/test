/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
   AxiosError,
   type AxiosInstance,
   type AxiosRequestConfig,
   type AxiosResponse,
   type InternalAxiosRequestConfig,
} from 'axios';

import middleware from './middleware';

const createInstance = <T extends { data: AxiosResponseData }, D>(baseURL: string) => {
   const config: AxiosRequestConfig<T> = {
      baseURL: baseURL,
      headers: {
         // 'X-Requested-With': 'XMLHttpRequest',
      },
   };

   const axiosInstance: AxiosInstance = axios.create(config);

   axiosInstance.interceptors.request.use(
      (requestConfig: InternalAxiosRequestConfig<T>) => {
         void middleware(requestConfig);
         return requestConfig;
      },

      (requestError: AxiosError) => {
         return Promise.reject(requestError);
      },
   );

   axiosInstance.interceptors.response.use(
      // success response
      (response: AxiosResponse<T, D>): any => {
         if (response && response.data) {
            return response.data as unknown as AxiosResponseData;
         }
         return response;
      },

      // error response
      async (error: Error | AxiosError<T>): Promise<AxiosError<T>> => {
         return Promise.reject(error);
      },
   );

   return axiosInstance;
};

export default createInstance;
