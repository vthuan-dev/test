/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { API_ROUTE } from '@constants';
import { postRequest } from '~/app/configs';
import { SETTINGS_CONFIG } from '~/app/configs/settings';

export const apiPostLogin = (authLogin: (data: DataUser) => void) => {
   return useMutation({
      mutationFn: (data: { username: string; password: string }) => postRequest(API_ROUTE.LOGIN, data),
      onSuccess: (response: { data: DataUser; token: string }) => {
         localStorage.setItem(SETTINGS_CONFIG.ACCESS_TOKEN_KEY, response.token);
         authLogin(response.data);
         toast.success('Đăng nhập thành công!');
      },
      onError: (data: any) => {
         toast.error(data?.response?.data?.message);
      },
   });
};
