/* eslint-disable @typescript-eslint/naming-convention */
import * as yup from 'yup';

export const RoomCreateSchema = yup.object({
   room_name: yup.string().required('Tên phòng không được để trống').default(''),
   position: yup.string().nullable().default(''),
   image_url: yup.string().default(''),
   capacity: yup.number().min(1).default(1),
   price: yup.number().min(1000, 'Vui lòng nhập giá tiền > 1000').default(1000),
   description: yup
      .array()
      .of(
         yup.object({
            label: yup.string(),
            value: yup.string(),
         }),
      )
      .nullable()
      .default([{ label: '', value: '' }]),
});

export type RoomCreateType = yup.InferType<typeof RoomCreateSchema>;
