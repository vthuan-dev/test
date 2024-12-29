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
import { toast } from 'react-toastify';

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
   const { watch, setValue, getValues, setError } = from;
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
            toast.dismiss('payment-redirect');
            setTimeout(() => {
               toast.success('Đang chuyển đến trang thanh toán...', {
                  toastId: 'payment-redirect',
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
               });
            }, 100);
         }
      } else {
         toast.dismiss('payment-cash-success');
         setTimeout(() => {
            toast.success('Đơn hàng đã được tạo thành công!', {
               toastId: 'payment-cash-success',
               position: "top-right",
               autoClose: 3000,
               hideProgressBar: false,
            });
         }, 100);
      }

      onClose();
      from.reset();
   };

   const { mutate } = createOrder({ handleClose });

   const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPaymentMethod(event.target.value as any);
   };

   const handleRoomChange = (index: number, field: 'start_time' | 'end_time', value: Date | null) => {
      const newRooms = [...watch('rooms')];
      const currentRoom = newRooms[index];

      if (field === 'start_time' && value) {
         const totalTimeInHours = currentRoom.total_time || 1;
         const end_time = new Date(value.getTime() + totalTimeInHours * 60 * 60 * 1000);
         console.log(end_time);
         setValue(`rooms[${index}].start_time`, dayjs(value).format('YYYY-MM-DD HH:mm:ss'));
         setValue(`rooms[${index}].end_time`, dayjs(end_time).format('YYYY-MM-DD HH:mm:ss'));
      } else if (field === 'end_time' && value) {
         const startTime = currentRoom.start_time;
         if (startTime) {
            const totalTimeInMilliseconds = value.getTime() - new Date(startTime).getTime();
            const totalTimeInHours = Math.max(1, totalTimeInMilliseconds / (1000 * 60 * 60));

            setValue(`rooms[${index}].total_time`, totalTimeInHours);
            setValue(`rooms[${index}].end_time`, dayjs(value).format('YYYY-MM-DD HH:mm:ss'));
         }
      }
   };

   const onSubmitForm: SubmitHandler<PaymentModalType> = (data) => {
      priceRef.current = data.total_money;

      // Initialize an array to track any validation errors
      let hasError = false;

      const roomsToSubmit = data.rooms.map((room, index) => {
         const roomTimeline = dataRoomOrderTimeline?.find((timeline: any) => {
            return Number(timeline.room_id) === Number(room.room_id);
         });

         if (roomTimeline) {
            const roomStartTime = dayjs(room.start_time).utc();
            const roomEndTime = dayjs(room.end_time).utc();
            const roomTimelineStartTime = dayjs(roomTimeline.start_time).utc();
            const roomTimelineEndTime = dayjs(roomTimeline.end_time).utc();

            const isTimeOverlap =
               roomStartTime.isBefore(roomTimelineEndTime) && roomEndTime.isAfter(roomTimelineStartTime);

            if (isTimeOverlap) {
               setError(`rooms[${index}].start_time` as never, {
                  type: 'manual',
                  message: `Thời gian của phòng ${room.room_id} trùng với một đơn đặt phòng đã có.`,
               });
               hasError = true;
            }
         }

         return room; // Keep the room object in the map to submit
      });

      // If there are any validation errors, do not proceed with mutation
      if (hasError) {
         return console.log('There is an overlap in room times');
      } else {
         // Perform the mutation if no errors
         mutate({
            ...data,
            payment_method: paymentMethod === 'cash' ? 1 : 2,
            rooms: data.rooms.map((item) => ({
               ...item,
               end_time: dayjs(item.end_time).format('YYYY-MM-DD HH:mm:ss'),
               start_time: dayjs(item.start_time).format('YYYY-MM-DD HH:mm:ss'),
            })),
            user_id: user?.id,
            username: user?.username,
            email: user?.email,
            order_date: '',
         } as any);
      }
   };

   const actionPaymentUrl = SETTINGS_CONFIG.API_URL + '/order/payment/create';
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
                        aria-labelledby="demo-radio-buttons-group-label"
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                        sx={{ mt: 2 }}
                     >
                        <FormControlLabel
                           value="cash"
                           control={<Radio />}
                           checked={paymentMethod === 'cash'}
                           onChange={() => setPaymentMethod('cash')}
                           label="Tiền mặt"
                        />
                        <FormControlLabel
                           value="card"
                           control={<Radio />}
                           checked={paymentMethod === 'card'}
                           onChange={() => setPaymentMethod('card')}
                           label="Thẻ ngân hàng"
                        />
                        {/* Thêm các phương thức thanh toán khác */}
                     </RadioGroup>
                  </Box>
                  <Box display="flex" justifyContent="end" gap={2} mt={3}>
                     <Button variant="outlined" color="error" onClick={handleClose}>
                        Hủy
                     </Button>
                     <Button
                        type="submit"
                        variant="contained"
                        onClick={() => {
                           /* Logic xác nhận */
                           from.handleSubmit(onSubmitForm);
                        }}
                     >
                        Xác nhận
                     </Button>
                  </Box>
               </Box>
            </form>
            <Box component="form" sx={{ visibility: 'hidden', opacity: 0 }} action={actionPaymentUrl} method="post">
               <input name="amount" type="number" value={priceRef.current} />
               <input type="text" name="orderId" ref={orderIdRef} />
               <button ref={buttonSubmitRef} type="submit">
                  purchase
               </button>
            </Box>
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
