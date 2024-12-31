/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useMemo, useState } from 'react';
import { 
   Divider, 
   Grid, 
   Typography, 
   Button, 
   Box, 
   Container,
   Dialog,
   DialogContent,
   IconButton,
   Paper,
   Fade,
   useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-hot-toast';

import { getCart } from './service';
import CartItem from './components/CartItem';
import RoomItem from './components/RoomItem';
import PaymentModal from './components/PaymentModal/PaymentModal';
import { paymentModal, type PaymentModalType } from './components/PaymentModal/validation';

import useAuth from '~/app/redux/slices/auth.slice';
import { ROUTE_PATH } from '@constants';
import { getAllTimeline } from '@pages/admin/rom/service';

const Cart: React.FC = () => {
   const { user, isAuhthentication } = useAuth();
   const navigate = useNavigate();
   const [rooms, setRooms] = useState<Array<CartRoom>>([]);
   const [isOpen, setIsOpen] = useState<boolean>(false);

   const onClose = () => setIsOpen(false);

   const from = useForm<PaymentModalType>({
      resolver: yupResolver(paymentModal),
      defaultValues: paymentModal.getDefault(),
      mode: 'onChange',
   });

   const [products, setProducts] = useState<Array<CartProduct>>([]);

   getCart({
      userId: user?.id as unknown as string,
      setRooms: setRooms,
      setProducts: setProducts,
   });

   useEffect(() => {
      !isAuhthentication && navigate(ROUTE_PATH.CLIENT_HOME);
   }, []);

   const handleRoomQuantityChange = (cart_id: number, newQuantity: number) => {
      setRooms(rooms.map((room) => (room.cart_id === cart_id ? { ...room, quantity: newQuantity } : room)));
   };

   const handleProductQuantityChange = (id: number, newQuantity: number) => {
      setProducts(products.map((product) => (product.id === id ? { ...product, quantity: newQuantity } : product)));
   };

   const handleDeleteRoom = (cart_id: number) => {
      setRooms(rooms.filter((room) => room.cart_id !== cart_id));
   };

   const handleDeleteProduct = (id: number) => {
      setProducts(products.filter((product) => product.id !== id));
   };

   const totalProductAmount = products.reduce((total, product) => total + Number(product.price) * product.quantity, 0);
   const totalRoomAmount = rooms.reduce((total, room) => total + Number(room.price) * (room.quantity ?? 1), 0);
   const totalAmount = totalProductAmount + totalRoomAmount;

   const onOpen = () => {
      from.reset({
         description: '',
         total_money: totalAmount,
         order_date: dayjs().toDate(),
         carts: [...products.map((item) => item.cart_id), ...rooms.map((item) => item.cart_id)],
         products: products.map((item) => {
            return {
               product_id: String(item.product_id),
               price: Number(item.price),
               quantity: item.quantity,
            };
         }),
         rooms: rooms.map((item) => {
            return {
               room_id: String(item.room_id),
               price: Number(item.price),
               total_time: Number(item.quantity),
               start_time: undefined,
               end_time: null,
               total_price: totalRoomAmount,
            };
         }),
      });

      setIsOpen(true);
   };

   const { data: timeLine } = getAllTimeline();
   console.log('timeLine:', timeLine)

   const dataRender = useMemo(()=>{
      const a = rooms.map(item=>{
         const bookTime = timeLine?.data.find(time=>time.id === item.id)
         let time:string[] = []
         if(bookTime?.booking_times){
            time = bookTime.booking_times.split(';')
         }
         return {
            ...item,
            time
         }
      })
      return a
   },[rooms,timeLine])

   const onSubmitForm: SubmitHandler<PaymentModalType> = async (data) => {
      try {
         // Kiểm tra thời gian đặt phòng
         const startTime = new Date(data.rooms[0].start_time);
         const endTime = new Date(data.rooms[0].end_time);
         const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
         
         if (diffHours < 1) {
            toast.error('Thời gian đặt phòng phải ít nhất 1 giờ');
            return;
         }

         // ... phần code xử lý submit tiếp theo
      } catch (error) {
         console.error('Error submitting form:', error);
      }
   };

   return (
      <Container maxWidth="lg">
         {rooms.length === 0 && products.length === 0 ? (
            <Typography variant="h3" component="h3" textAlign="center" mt={10}>
               Không có sản phẩm nào trong giỏ hàng
            </Typography>
         ) : (
            <>
               <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', marginTop: 3 }}>
                  Giỏ Hàng Đặt Phòng & Sản Phẩm
               </Typography>
               <Divider sx={{ marginBottom: 3 }} />

               <Grid container spacing={2} sx={{ position: 'relative' }}>
                  <Grid item xs={8}>
                     {/* Giỏ Hàng Đặt Phòng */}
                     {dataRender.map((room) => {
                           return (
                              <React.Fragment key={room.id}>
                                 <RoomItem
                                    room={room}
                                    onDeleteRoom={handleDeleteRoom}
                                    handleRoomQuantityChange={handleRoomQuantityChange}
                                 />
                                 <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
                              </React.Fragment>
                           );
                        })}

                     {/* Giỏ Hàng Sản Phẩm */}
                     {products.length > 0 && (
                        <>
                           {products.map((item) => (
                              <React.Fragment key={item.id}>
                                 <CartItem
                                    cartProduct={item}
                                    handleDeleteProduct={handleDeleteProduct}
                                    handleProductQuantityChange={handleProductQuantityChange}
                                 />
                                 <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
                              </React.Fragment>
                           ))}
                        </>
                     )}
                  </Grid>

                  <Grid item xs={4}>
                     <Box sx={{ position: 'sticky', top: 0 }}>
                        {/* Add top: 0 to make it sticky */}
                        <Grid container justifyContent="space-between" sx={{ marginBottom: 3 }}>
                           <Typography variant="h6">Tổng tiền phòng:</Typography>
                           <Typography variant="h6">{totalRoomAmount.toLocaleString()} VND</Typography>
                        </Grid>
                        <Grid container justifyContent="space-between" sx={{ marginBottom: 3 }}>
                           <Typography variant="h6">Tổng tiền sản phẩm:</Typography>
                           <Typography variant="h6">{totalProductAmount.toLocaleString()} VND</Typography>
                        </Grid>
                        <Grid container justifyContent="space-between" sx={{ marginBottom: 4 }}>
                           <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                              Tổng cộng:
                           </Typography>
                           <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                              {totalAmount.toLocaleString()} VND
                           </Typography>
                        </Grid>

                        {/* <Button variant="contained" color="warning" fullWidth onClick={onClickPay} sx={{ mb: 1 }}>
                           Cập nhật giỏ hàng
                        </Button> */}
                        <Button variant="contained" color="primary" fullWidth onClick={onOpen}>
                           Thanh Toán
                        </Button>
                     </Box>
                  </Grid>
               </Grid>
            </>
         )}

         {/* Tổng cộng */}
         {/* <Grid container justifyContent="space-between" sx={{ marginBottom: 3 }}>
            <Typography variant="h6">Tổng tiền phòng:</Typography>
            <Typography variant="h6">{totalRoomAmount.toLocaleString()} VND</Typography>
         </Grid> */}
         <PaymentModal from={from} rooms={rooms} isOpen={isOpen} onClose={onClose} />
      </Container>
   );
};

export default Cart;
