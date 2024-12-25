/* eslint-disable @typescript-eslint/naming-convention */
import * as yup from 'yup';

export const CreateDesktopSchema = yup.object({
   desktop_name: yup.string().default(''),
   price: yup.number().min(1000, 'Giá sản phải > 1000đ').default(1000),
   room_id: yup.string().required('Phòng không được để trống').default(''),
   description: yup
      .array()
      .of(
         yup.object({
            label: yup.string(),
            value: yup.string(),
         }),
      )
      .default([{ label: 'Mô tả phòng', value: '' }]), // Khởi tạo description là một mảng rỗng
});

export type CreateDesktopType = yup.InferType<typeof CreateDesktopSchema>;

export const CreateCategorySchema = yup.object({
   image_url: yup.string().default(''),
   category_name: yup.string().default(''),
   description: yup.string().default(''),
});

export type CreateCategoryType = yup.InferType<typeof CreateCategorySchema>;
