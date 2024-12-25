/* eslint-disable @typescript-eslint/naming-convention */
import * as yup from 'yup';

export const CreateProductSchema = yup.object({
   image_url: yup.string().default(''),
   product_name: yup.string().required('Tên sản phảm không được để trống').default(''),
   price: yup.number().min(1000, 'Giá sản phải > 1000đ').default(0),
   category_id: yup.string().required('Danh mục không được để trống').default(''),
   description: yup.string().default(''),
});

export type CreateProductType = yup.InferType<typeof CreateProductSchema>;

export const CreateCategorySchema = yup.object({
   image_url: yup.string().default(''),
   category_name: yup.string().default(''),
   description: yup.string().default(''),
});

export type CreateCategoryType = yup.InferType<typeof CreateCategorySchema>;
