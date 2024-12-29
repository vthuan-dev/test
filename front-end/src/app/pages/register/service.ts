/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation } from '@tanstack/react-query';
import type { NavigateFunction } from 'react-router-dom';
import { toast } from 'react-toastify';

import { ROUTE_PATH } from '@constants';
import { postRequest } from '~/app/configs';

export const apiPostRegister = ({ onSuccess, onError }: any) => {
   return useMutation({
      mutationFn: (data: { 
         email: string;
         username: string; 
         password: string;
         passwordComfirm: string;
      }) => postRequest('/auth/create', data),
      onSuccess,
      onError,
   });
};
