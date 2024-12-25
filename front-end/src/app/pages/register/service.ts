/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation } from '@tanstack/react-query';
import type { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';

import { ROUTE_PATH } from '@constants';
import { postRequest } from '~/app/configs';

export const apiPostRegister = (navigate: NavigateFunction) => {
   return useMutation({
      mutationFn: (data: { username: string; password: string }) => postRequest('/auth/register', data),
      onSuccess: () => {
         toast.success('Đăng nhập thành công!');
         navigate(ROUTE_PATH.SIGN_IN);
      },
      onError: (data: any) => {
         toast.error(data?.response?.data?.message);
      },
   });
};
