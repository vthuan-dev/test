/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { API_ROUTE } from '@constants';
import { deleteRequest, getRequest, postRequest } from '~/app/configs';

export const getCart = ({
   userId,
   setRooms,
   setProducts,
}: {
   userId: string;
   setRooms: React.Dispatch<React.SetStateAction<CartRoom[]>>;
   setProducts: React.Dispatch<React.SetStateAction<CartProduct[]>>;
}) => {
   return useQuery<ResponseGet<Cart>>({
      queryKey: ['Cart', userId],
      queryFn: () => getRequest(API_ROUTE.CART + `?user_id=${userId}`),
      onSuccess: (data: ResponseGet<Cart>) => {
         setRooms(data.data.cartRoom ?? []);
         setProducts(data.data.cartProduct ?? []);
      },
   });
};

export const deleteCart = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (id: string) => deleteRequest(API_ROUTE.CART + `/remove/${id}`),
      onSuccess: () => {
         toast.success('Cập nhật thành công');
         queryClient.refetchQueries({
            queryKey: ['Cart'],
         });
      },
   });
};

export const createOrder = ({ handleClose }: { handleClose: (res: any) => void }) => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data) => postRequest('/order/add', data),
      onSuccess: (res) => {
         console.log('res:', res);
         queryClient.refetchQueries({
            queryKey: ['Cart'],
         });

         handleClose(res);
        
      },
      onError: (error: any) => {
         // Lấy thông báo lỗi từ response của API
         const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!';

         // Nếu lỗi có thông báo liên quan đến việc phòng đã được đặt
         if (errorMessage.includes('Phòng đã được đặt trong khoảng thời gian này')) {
            toast.error('Lỗi: ' + errorMessage); // Hiển thị thông báo lỗi cụ thể
         } else {
            toast.error('Có lỗi xảy ra, vui lòng thử lại!');
         }
      },
   });
};

export const getRoomOrderTimeline = (data: any) => {
   const isRoomIdsValid = Array.isArray(data.roomIds) && data.roomIds.length > 0;

   // Nếu roomIds không hợp lệ, trả về data null hoặc thông báo lỗi

   return useQuery({
      queryKey: ['getRoomOrderTimeline', data],
      queryFn: () => postRequest('/order/get-order-room-timeline', data),
      enabled: isRoomIdsValid, // Chỉ thực hiện truy vấn khi roomIds có giá trị
   });
};
