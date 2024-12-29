/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useRef, useState } from 'react';
import {
   Button,
   Modal,
   TextField,
   Radio,
   RadioGroup,
   FormControlLabel,
   Box,
   Typography,
   FormHelperText,
} from '@mui/material';
import type { SubmitHandler, UseFormReturn } from 'react-hook-form';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { toast } from 'react-hot-toast';

import { createOrder, getRoomOrderTimeline } from '../../service';

import type { PaymentModalType } from './validation';

import useAuth from '~/app/redux/slices/auth.slice';
import { SETTINGS_CONFIG } from '~/app/configs/settings';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

interface PaymentModalProps {
   isOpen: boolean;
   onClose: () => void;
   from: UseFormReturn<PaymentModalType>;
   rooms: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, from, rooms }) => {
   const { watch, setValue, getValues, setError, clearErrors } = from;
   const { user } = useAuth();
   const buttonSubmitRef = useRef<HTMLButtonElement>(null);
   const priceRef = useRef(0);
   const orderIdRef = useRef(null);

   const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

   const { data: dataRoomOrderTimeline } = getRoomOrderTimeline({
      roomIds: rooms.map((item: any) => item.room_id),
   } as any);

   const handleClose = (res: any) => {
      if (paymentMethod === 'card') {
         if (res && 'insertId' in res) {
            orderIdRef.current.value = res.insertId as number;
            buttonSubmitRef.current && buttonSubmitRef.current.click();
         }
      }

      onClose();
      from.reset();
   };

   const { mutate, mutateAsync } = createOrder({ 
      handleClose: async (orderResponse) => {
         if (orderResponse?.data?.insertId) {
            if (paymentMethod === 'card') {
               await handlePaymentResponse(orderResponse.data.insertId, from.getValues('total_money'));
            } else {
               handleClose(orderResponse);
               toast.success('Đặt phòng thành công!');
            }
         }
      } 
   });

   const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPaymentMethod(event.target.value as any);
   };

   const handleRoomChange = (index: number, field: 'start_time' | 'end_time', value: Date | null) => {
      if (!value) return;

      const newRooms = [...watch('rooms')];
      const currentRoom = newRooms[index];

      try {
         if (field === 'start_time') {
            if (dayjs(value).isBefore(dayjs())) {
               setError(`rooms.${index}.start_time`, {
                  message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại'
               });
               return;
            }

            const totalTimeInHours = currentRoom.total_time || 1;
            const end_time = dayjs(value).add(totalTimeInHours, 'hour').toDate();
            
            setValue(`rooms.${index}.start_time`, value);
            setValue(`rooms.${index}.end_time`, end_time);
            
         } else if (field === 'end_time') {
            const startTime = watch(`rooms.${index}.start_time`);
            
            if (startTime && dayjs(value).isBefore(dayjs(startTime).add(1, 'hour'))) {
               setError(`rooms.${index}.end_time`, {
                  message: 'Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 1 giờ'
               });
               return;
            }

            setValue(`rooms.${index}.end_time`, value);
            
            if (startTime) {
               const totalHours = dayjs(value).diff(dayjs(startTime), 'hour', true);
               setValue(`rooms.${index}.total_time`, Math.max(1, totalHours));
            }
         }

         clearErrors([`rooms.${index}.start_time`, `rooms.${index}.end_time`]);
         
      } catch (error) {
         console.error('Error handling room change:', error);
      }
   };

   const handlePaymentResponse = async (orderId: number, totalMoney: number) => {
      try {
         // Tạo đơn hàng trước
         const orderResponse = await fetch(`${SETTINGS_CONFIG.API_URL}/api/order/add`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
         });

         const orderResult = await orderResponse.json();
         
         if (!orderResult.success) {
            throw new Error(orderResult.message || 'Không thể tạo đơn hàng');
         }

         // Sau đó mới bắt đầu thanh toán
         const paymentUrl = `${SETTINGS_CONFIG.API_URL}/api/order/payment/create`;
         const response = await fetch(paymentUrl, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               amount: Math.floor(totalMoney),
               orderId: orderId.toString(),
            }),
         });

         const data = await response.json();

         if (data.success && data.vnpUrl) {
            window.location.assign(data.vnpUrl);
         } else {
            toast.error('Lỗi tạo thanh toán: ' + (data.message || 'Vui lòng thử lại'));
         }
      } catch (error) {
         console.error('Lỗi thanh toán:', error);
         toast.error('Lỗi khi xử lý thanh toán');
      }
   };

   const onSubmitForm: SubmitHandler<PaymentModalType> = async (data) => {
      try {
         console.log('Form submitted:', data);

         const orderData = {
            ...data,
            payment_method: paymentMethod === 'cash' ? 1 : 2,
            rooms: data.rooms.map((item) => ({
               ...item,
               room_id: parseInt(item.room_id),
               start_time: dayjs(item.start_time).format('YYYY-MM-DD HH:mm:ss'),
               end_time: dayjs(item.end_time).format('YYYY-MM-DD HH:mm:ss'),
            })),
            user_id: user?.id,
            username: user?.username,
            email: user?.email,
            order_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
         };

         if (paymentMethod === 'card') {
            try {
               const paymentUrl = `${SETTINGS_CONFIG.API_URL}/order/payment/create`;
               console.log('Payment URL:', paymentUrl);
               
               const response = await fetch(paymentUrl, {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                     'Accept': 'application/json'
                  },
                  body: JSON.stringify({
                     amount: Math.floor(data.total_money),
                     orderId: orderData.id || Date.now().toString(),
                  }),
               });

               const paymentData = await response.json();
               console.log('Payment response:', paymentData);

               if (paymentData.success && paymentData.vnpUrl) {
                  const width = 1000;
                  const height = 800;
                  const left = window.screenX + (window.outerWidth - width) / 2;
                  const top = window.screenY + (window.outerHeight - height) / 2;

                  const paymentWindow = window.open(
                     paymentData.vnpUrl,
                     'VNPay Payment',
                     `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
                  );

                  if (!paymentWindow) {
                     toast.error('Vui lòng cho phép popup để tiếp tục thanh toán');
                     return;
                  }

                  const checkWindow = setInterval(() => {
                     if (paymentWindow.closed) {
                        clearInterval(checkWindow);
                        toast.success('Đã đóng cửa sổ thanh toán');
                     }
                  }, 500);

               } else {
                  throw new Error(paymentData.message || 'Lỗi tạo thanh toán');
               }
            } catch (error) {
               console.error('Payment error:', error);
               toast.error('Lỗi xử lý thanh toán: ' + (error.message || 'Vui lòng thử lại'));
            }
         } else {
            mutate(orderData);
         }
      } catch (error) {
         console.error('Form submission error:', error);
         toast.error('Có lỗi xảy ra, vui lòng thử lại');
      }
   };

   const actionPaymentUrl = SETTINGS_CONFIG.API_URL + '/order/add/payment';
   console.log('from.formState.errors', from.formState.errors);
   return (
      <Modal
         open={isOpen}
         onClose={handleClose}
         aria-labelledby="modal-modal-title"
         aria-describedby="modal-modal-description"
      >
         <Box sx={style}>
            <Typography variant="h5" p={2}>
               Thông tin đặt phòng
            </Typography>
            <form onSubmit={from.handleSubmit(onSubmitForm)}>
               <Box p={2} pt={0}>
                  {getValues('rooms').map((room, index) => (
                     <Box key={room.room_id} mb={2}>
                        <Typography mb={1}>Phòng {room.room_id}</Typography>
                        <Box display="flex" justifyContent="space-between" gap={2}>
                           <Box>
                              <TextField
                                 label="Thời gian bắt đầu"
                                 type="datetime-local"
                                 value={watch(`rooms[${index}.start_time]`)}
                                 onChange={(e) => handleRoomChange(index, 'start_time', new Date(e.target.value))}
                                 InputLabelProps={{ shrink: true }}
                              />
                              {from.formState.errors?.rooms?.[index]?.start_time && (
                                 <FormHelperText
                                    variant="standard"
                                    sx={({ palette }) => ({ color: palette.error.main, ml: 1 })}
                                 >
                                    {from.formState.errors.rooms[index].start_time.message}
                                 </FormHelperText>
                              )}
                           </Box>
                           <Box>
                              <TextField
                                 label="Thời gian kết thúc"
                                 type="datetime-local"
                                 value={watch(`rooms[${index}.end_time]`)}
                                 onChange={(e) => handleRoomChange(index, 'end_time', new Date(e.target.value))}
                                 InputLabelProps={{ shrink: true }}
                              />
                              {from.formState.errors?.rooms?.[index]?.end_time && (
                                 <FormHelperText
                                    variant="standard"
                                    sx={({ palette }) => ({ color: palette.error.main, ml: 1 })}
                                 >
                                    {from.formState.errors.rooms[index].end_time.message}
                                 </FormHelperText>
                              )}
                           </Box>
                        </Box>
                     </Box>
                  ))}
                  <Box width="max-content">
                     <RadioGroup
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
                        sx={{ mt: 2 }}
                     >
                        <FormControlLabel
                           value="cash"
                           control={<Radio />}
                           label="Tiền mặt"
                        />
                        <FormControlLabel
                           value="card"
                           control={<Radio />}
                           label="Thẻ ngân hàng"
                        />
                     </RadioGroup>
                  </Box>
                  <Box display="flex" justifyContent="end" gap={2} mt={3}>
                     <Button variant="outlined" color="error" onClick={() => handleClose(null)}>
                        Hủy
                     </Button>
                     <Button
                        type="submit"
                        variant="contained"
                        onClick={() => console.log('Submit button clicked')}
                     >
                        Xác nhận
                     </Button>
                  </Box>
               </Box>
            </form>
         </Box>
      </Modal>
   );
};

const style = {
   position: 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   width: 520,
   bgcolor: 'background.paper',
   borderRadius: 2,
   boxShadow: 24,
};

export default PaymentModal;
