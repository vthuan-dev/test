/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import * as yup from 'yup';
import dayjs from 'dayjs';

export const paymentModal = yup.object({
   total_money: yup.number().default(0),
   order_date: yup.date().default(() => dayjs().toDate()),
   description: yup.string().default(''),
   payment_method: yup.string().default(''),
   carts: yup.array().default([]),
   products: yup
      .array()
      .of(
         yup.object().shape({
            product_id: yup.string().required(),
            quantity: yup.number().required().min(1),
            price: yup.number().required().min(0),
         }),
      )
      .default([]),
   rooms: yup
      .array()
      .of(
         yup.object().shape({
            room_id: yup.string().required(),
            total_price: yup.number().required().min(0),
            start_time: yup
               .date()
               .required('Thời gian bắt đầu không được để trống')
               .test('is-greater-than-now', 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại', function (value) {
                  return value ? dayjs(value).isAfter(dayjs()) : true;
               }),
            end_time: yup
               .date()
               .nullable()
               .test(
                  'is-end-time-greater',
                  'Thời gian kết thúc phải lớn hơn thời gian bắt đầu ít nhất 1 giờ',
                  function (value) {
                     const { start_time } = this.parent; // Lấy start_time từ cùng object
                     if (start_time && value) {
                        return dayjs(value).isAfter(dayjs(start_time).add(0.9, 'hour')); // Kiểm tra end_time phải sau start_time ít nhất 1 giờ
                     }
                     return true; // Nếu không có start_time hoặc end_time thì không kiểm tra
                  },
               ),
            total_time: yup.number().default(1),
         }),
      )
      .default([]),
});

export type PaymentModalType = yup.InferType<typeof paymentModal>;
