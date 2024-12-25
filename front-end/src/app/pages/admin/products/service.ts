/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useMutation, useQuery, type UseMutateFunction } from '@tanstack/react-query';
import type { UseFormReset } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { Dispatch, SetStateAction } from 'react';

import { postRequest, putRequest } from './../../../configs/common/api';
import type { CreateCategoryType, CreateProductType } from './validation';

import { getRequest } from '~/app/configs';
import { API_ROUTE } from '@constants';

export const apiUploadImageFirebase = ({
   uploadFirebaseImage,
   productId,
   createProduct,
   dataForm,
   callbackDeleteImage,
   updateProduct,
}: {
   uploadFirebaseImage: (data: React.ChangeEvent<HTMLInputElement> | null) => Promise<string | string[] | undefined>;
   productId?: number;
   createProduct: UseMutateFunction<any, unknown, any, unknown>;
   dataForm: CreateProductType;
   callbackDeleteImage: UseMutateFunction<boolean, unknown, string | string[], unknown>;
   updateProduct: UseMutateFunction<
      any,
      unknown,
      {
         productId: number;
         data: CreateProductType;
      },
      unknown
   >;
}) => {
   return useMutation({
      mutationFn: async (file: React.ChangeEvent<HTMLInputElement> | null) => {
         return await uploadFirebaseImage(file);
      },
      onSuccess: (data) => {
         if (!productId) {
            return createProduct({
               ...dataForm,
               image_url: data,
            });
         }

         callbackDeleteImage(dataForm.image_url);

         return updateProduct({
            productId,
            data: {
               ...dataForm,
               image_url: data as string,
            },
         });
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

export const apiGetListProduct = (data: any) => {
   const queryParam = new URLSearchParams({
      product_name: String(data.product_name ?? ''),
      page: String(data.page ?? 1),
      category_id: String(data.category_id ?? ''),
      limit: String(10),
      isPagination: String(true),
   });

   return useQuery<ResponseGetList<Product>>({
      queryKey: ['PRODUCT_LIST', data],
      queryFn: () => getRequest(API_ROUTE.PRODUCT + `?${queryParam}`),
   });
};

export const apiCreateProduct = ({
   deleteFirebaseImage,
   setOpen,
   refetchListProduct,
}: {
   refetchListProduct: any;
   deleteFirebaseImage: (srcImage: string | string[]) => Promise<boolean>;
   setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
   return useMutation({
      mutationFn: (data: CreateProductType) => postRequest(API_ROUTE.PRODUCT_ADD, data),
      onSuccess: () => {
         refetchListProduct();
         setOpen(false);
      },
      onError: async (_data, variables) => {
         toast.error('Sản phẩm không tồn tại.');
         await deleteFirebaseImage(variables.image_url);
      },
   });
};

export const apiUpdateProduct = ({
   setOpen,
   refetchListProduct,
}: {
   refetchListProduct?: any;
   setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
   return useMutation({
      mutationFn: ({ productId, data }: { productId: number; data: CreateProductType }) =>
         putRequest(`${API_ROUTE.PRODUCT_UPDATE}/${productId}`, {
            category_id: data.category_id,
            description: data.description,
            image_url: data.image_url,
            price: data.price,
            product_name: data.product_name,
         }),
      onSuccess: () => {
         refetchListProduct?.();
         toast.success('Cập nhật thành công');
         setOpen?.(false);
      },
   });
};

export const apiGetProductDetail = (productId?: number, reset?: UseFormReset<CreateProductType>) => {
   if (productId) {
      return useQuery<ResponseGet<Product>>({
         queryKey: ['PRODUCT_DETAIL', productId],
         queryFn: () => getRequest(`${API_ROUTE.PRODUCT_SEARCH_BY_ID}/${productId}`),
         retry: false,
         onSuccess: (dataResponse) => {
            reset?.({
               ...(dataResponse.data as any),
               price: Number(dataResponse.data.price),
               description: dataResponse.data.description ?? '',
            });
         },
         onError: () => {
            toast.error('Sản phẩm không tồn tại.');
         },
      });
   }
};

export const apiProductDetail = (productId?: number) => {
   return useMutation({
      mutationFn: () => getRequest(`${API_ROUTE.PRODUCT_SEARCH_BY_ID}/${productId}`),
   });
};

export const apiGetCategories = () => {
   return useQuery<ResponseGetList<Categories>>({
      queryKey: [API_ROUTE.CATEGORY],
      queryFn: () => getRequest(API_ROUTE.CATEGORY),
   });
};

export const apiPostCategory = ({
   handleClose,
   refetchCatrgory,
}: {
   handleClose?: () => void;
   refetchCatrgory: () => any;
}) => {
   return useMutation({
      mutationFn: (data: CreateCategoryType) => postRequest(API_ROUTE.CATEGORY_ADD, data),
      onSuccess: () => {
         refetchCatrgory();
         toast.success('Thêm mới thành công');
         handleClose?.();
      },
      onError: (data: any) => {
         toast.error(data.response.data.message as string);
      },
   });
};
