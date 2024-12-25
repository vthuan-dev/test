/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { API_ROUTE } from '@constants';
import { getRequest, postRequest } from '~/app/configs';

export const apiAddOrderRoom = () => {
   return useMutation({
      mutationFn: (data: any) =>
         postRequest(API_ROUTE.ORDER_CART, {
            ...data,
            quantity: 1,
         }),
      onSuccess: () => {
         toast.success('Thêm vào giỏ hàng thành công.');
      },
   });
};

export const apiGetListProduct = (data: any) => {
   const queryParam = new URLSearchParams({
      isPagination: String(true), // Convert boolean to string
      limit: String(4), // Convert number to string
      page: String(1),
   });

   return useQuery<ResponseGetList<Product>>({
      queryKey: ['PRODUCT_LIST', data],
      queryFn: () =>
         getRequest(
            API_ROUTE.PRODUCT +
               `?page=${data?.page ?? ''}&category_id=${data?.category_id ?? ''}&sort_type=${data?.sort_type ?? ''}&limit=5`,
         ),
   });
};

export const getRom = () => {
   const queryParam = new URLSearchParams({
      isPagination: String(true), // Convert boolean to string
      limit: String(4), // Convert number to string
      page: String(1),
   });

   return useQuery<ResponseGetList<RoomItem>>({
      queryKey: ['API_ROUTE_ROOM'],
      queryFn: () => getRequest(API_ROUTE.ROOM + '?' + queryParam),
   });
};
