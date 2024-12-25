/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, type UseMutateFunction, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import type { UseFormReset } from 'react-hook-form';

import type { RoomCreateType } from './validation';

import { getRequest, postRequest, putRequest } from '~/app/configs';
import { API_ROUTE } from '@constants';

export const getRom = (data: any) => {
   const queryParam = new URLSearchParams({
      page: String(data.page ?? 1),
      // category_id: String(data.category_id ?? ''),
      limit: String(10),
      isPagination: String(true),
   });

   return useQuery<ResponseGetList<RoomItem>>({
      queryKey: ['API_ROUTE_ROOM', data],
      queryFn: () => getRequest(API_ROUTE.ROOM + `?${queryParam}`),
   });
};
export const getAllTimeline = () => {
   return useQuery<ResponseGetList<Time>>({
      queryKey: ['ROOM_ALL_TIMELINE'],
      queryFn: () => getRequest(API_ROUTE.ROOM_ALL_TIMELINE ),
   });
};

export const getRomDetail = (id: number) => {
   return useQuery<ResponseGet<RoomItem>>({
      queryFn: () => getRequest(API_ROUTE.ROOM_SEARCH_BY_ID + '/' + id),
   });
};

export const postRoom = ({ handleClose }: { handleClose?: () => void }) => {
   const queryClient = useQueryClient();

   return useMutation<ResponseGetList<RoomItem>, unknown, RoomCreateType>({
      mutationFn: (data) => postRequest('/room/add', data),
      onSuccess: () => {
         // refetchCatrgory();
         queryClient.refetchQueries({
            queryKey: ['API_ROUTE_ROOM'],
         });
         toast.success('Thêm mới thành công');
         handleClose?.();
      },
      onError: () => {
         toast.error('Có lỗi xảy ra'); // Xử lý lỗi nếu cần
      },
   });
};

export const apiUploadImageFirebase = ({
   uploadFirebaseImage,
   roomId,
   createRoom,
   dataForm,
   callbackDeleteImage,
   updateRoom,
}: {
   uploadFirebaseImage: (data: React.ChangeEvent<HTMLInputElement> | null) => Promise<string | string[] | undefined>;
   roomId?: number;
   createRoom: UseMutateFunction<any, unknown, any, unknown>;
   dataForm: any;
   callbackDeleteImage: UseMutateFunction<boolean, unknown, string | string[], unknown>;
   updateRoom?: UseMutateFunction<any, unknown, RoomCreateType, unknown>;
}) => {
   return useMutation({
      mutationFn: async (file: React.ChangeEvent<HTMLInputElement> | null) => {
         return await uploadFirebaseImage(file);
      },
      onSuccess: (data) => {
         console.log(dataForm)
         if (!roomId) {
            return createRoom({
               ...dataForm,
               image_url: data,
            });
         }

         callbackDeleteImage(dataForm.image_url as any);

         return updateRoom?.({
            ...dataForm,
            image_url: data as string,
         });
      },
      onError: (error: unknown) => {
         console.error('Image upload failed:', error);
      },
   });
};

export const apiDeleteImageFirebase = ({
   deleteFirebaseImage,
}: {
   // file: React.ChangeEvent<HTMLInputElement> | null;
   deleteFirebaseImage: (srcImage: string | string[]) => Promise<boolean>;
   // uploadFirebaseImage: (data: React.ChangeEvent<HTMLInputElement> | null) => Promise<string | string[] | undefined>;
}) => {
   return useMutation({
      mutationFn: async (srcImage: string | string[]) => {
         return await deleteFirebaseImage(srcImage);
      },
      onSuccess: async () => {
         // const image_url = await uploadFirebaseImage(file);
      },
      onError: () => {},
   });
};

export const apiUpdateRoom = ({
   roomId,
   setOpen,
}: {
   roomId?: number;
   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn:  async (data: RoomCreateType) => {
         console.log(data);
         return await putRequest(`/room/update/${roomId}`, data as any);
      },
      onSuccess: () => {
         queryClient.refetchQueries({
            queryKey: ['API_ROUTE_ROOM'],
         });
         setOpen(false);
         toast.success('Cập nhật thành công.');
      },
   });
};

export const apiGetRoomDetail = ({
   roomId,
   reset,
}: {
   roomId?: number | null;
   reset?: UseFormReset<RoomCreateType>;
}) => {
   return useQuery<ResponseGet<RoomDetailItem>>({
      queryKey: ['ROOM_ITEM', roomId], // Include roomId in the query key for caching
      queryFn: () => (roomId ? getRequest(`/room/searchById/${roomId}`) : Promise.resolve(null)), // Provide a fallback
      enabled: !!roomId, // Disable query when roomId is not provided
      onSuccess: (data: ResponseGet<RoomDetailItem>) => {
         const { desktops, ...resRoom } = data.data;

         reset?.({
            ...resRoom,
            position: resRoom.position,
            price: resRoom.room_price,
            image_url: resRoom.image_url,
            room_name: resRoom.room_name,
            description: JSON.parse(resRoom.room_description),
         });
      },
   });
};
