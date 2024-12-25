/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { API_ROUTE } from '@constants';
import { getRequest, postRequest } from '~/app/configs';

export const apiGetListDesktop = ({ limit, page, status }: { limit: number; page: number; status: string }) => {
   const queryParam = new URLSearchParams({
      isPagination: String(true), // Convert boolean to string
      limit: String(limit), // Convert number to string
      page: String(page),
      status: status,
   });

   return useQuery<ResponseGetList<Desktop>>({
      queryKey: [API_ROUTE.DESTKTOP, { limit, page, status }],
      queryFn: () => getRequest(API_ROUTE.DESTKTOP + `?${queryParam as unknown as string}`),
   });
};

export const apiGetDesktopDetail = () => {
   return useQuery<ResponseGetList<Desktop>>({
      queryKey: [API_ROUTE.DESTKTOP_SEARCH_BY_ID.split('/')],
      queryFn: () => getRequest(API_ROUTE.DESTKTOP_SEARCH_BY_ID),
   });
};

export const apiPostDesktop = ({ handleClose }: { handleClose?: () => void }) => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: { price: number; room_id: string; description?: string }) =>
         postRequest(API_ROUTE.DESTKTOP_ADD, data),
      onSuccess: () => {
         queryClient.refetchQueries({
            queryKey: [API_ROUTE.DESTKTOP],
         });
         toast.success('Thêm mới thành công');
         handleClose?.();
      },
      onError: (data: any) => {
         toast.error(data.response.data.message as string);
      },
   });
};

export const getRoomByCountDesktop = () => {
   return useQuery<ResponseGet<Array<RoomByCountDesktop>>>({
      queryKey: ['/room/get-by-count-desktop'],
      queryFn: () => getRequest('/room/get-by-count-desktop'),
   });
};

export const getRom = () => {
   return useQuery<ResponseGetList<RoomItem>>({
      queryKey: ['API_ROUTE_ROOM'],
      queryFn: () => getRequest(API_ROUTE.ROOM),
   });
};
