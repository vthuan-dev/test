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
            if (orderIdRef.current) {
               orderIdRef.current.value = res.insertId;
            }
            if (buttonSubmitRef.current) {
               buttonSubmitRef.current.click();
            }
         }
      } else {
         toast.success('Đơn hàng đã được tạo thành công!', {
            position: "top-right",
            autoClose: 3000,
         });
      }
      onClose();
      from.reset();
   };

   const { mutate } = createOrder({
      onSuccess: handleClose,
      onError: (error: any) => {
         // Hiển thị lỗi từ backend
         const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng';
         const conflicts = error?.response?.data?.conflicts;

         if (conflicts && conflicts.length > 0) {
            // Nếu có thông tin về xung đột thời gian, hiển thị chi tiết
            const conflictMessages = conflicts.map((c: any) => c.conflictMessage).join('\n');
            toast.error(
               <div>
                  <p>{errorMessage}</p>
                  <p style={{fontSize: '0.9em', marginTop: '8px'}}>{conflictMessages}</p>
               </div>
            );
         } else {
            // Hiển thị lỗi thông thường
            toast.error(errorMessage);
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
      const selectedTime = dayjs(value);

      // Nếu là thời gian bắt đầu
      if (field === 'start_time') {
         setValue(`rooms[${index}].start_time`, selectedTime.format('YYYY-MM-DD HH:mm:ss'));
         // Tự động set thời gian kết thúc là 1 giờ sau
         const end_time = selectedTime.add(1, 'hour');
         setValue(`rooms[${index}].end_time`, end_time.format('YYYY-MM-DD HH:mm:ss'));
         setValue(`rooms[${index}].total_time`, 1);
      } 
      // Nếu là thời gian kết thúc
      else if (field === 'end_time') {
         const startTime = dayjs(currentRoom.start_time);
         const diffMinutes = selectedTime.diff(startTime, 'minutes');
         
         if (diffMinutes < 60) {
            toast.error('Thời gian đặt phòng phải ít nhất 1 giờ');
            // Reset về thời gian kết thúc mặc định (1 giờ sau start_time)
            const defaultEndTime = dayjs(startTime).add(1, 'hour');
            setValue(`rooms[${index}].end_time`, defaultEndTime.format('YYYY-MM-DD HH:mm:ss'));
            setValue(`rooms[${index}].total_time`, 1);
            return;
         }

         if (selectedTime.isAfter(startTime)) {
            setValue(`rooms[${index}].end_time`, selectedTime.format('YYYY-MM-DD HH:mm:ss'));
            const diffHours = selectedTime.diff(startTime, 'hour', true);
            const roundedHours = Math.ceil(diffHours * 2) / 2;
            setValue(`rooms[${index}].total_time`, roundedHours);
         }
      }

      // Kiểm tra xung đột thời gian
      const hasConflict = checkTimeConflict();
      if (hasConflict) {
         toast.error('Thời gian này đã được đặt. Vui lòng chọn thời gian khác!');
         return;
      }
   };

   const onSubmitForm: SubmitHandler<PaymentModalType> = async (data) => {
      try {
         priceRef.current = data.total_money;

         if (from.formState.errors && Object.keys(from.formState.errors).length > 0) {
            return;
         }

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
      } catch (error) {
         console.error('Submit error:', error);
         toast.error('Có lỗi xảy ra khi xử lý đơn hàng');
      }
   };

   return (
      <Modal open={isOpen} onClose={onClose}>
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
                     <Button variant="outlined" color="error" onClick={onClose}>
                        Hủy
                     </Button>
                     <Button type="submit" variant="contained">
                        Xác nhận
                     </Button>
                  </Box>
               </Box>
            </form>
            
            <Box 
               component="form" 
               sx={{ visibility: 'hidden', position: 'absolute' }} 
               action={`${process.env.REACT_APP_API_URL}/api/order/payment/create`}
               method="POST"
               target="_blank"
            >
               <input name="amount" type="number" value={priceRef.current} readOnly />
               <input type="text" name="orderId" ref={orderIdRef} readOnly />
               <button ref={buttonSubmitRef} type="submit">purchase</button>
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
