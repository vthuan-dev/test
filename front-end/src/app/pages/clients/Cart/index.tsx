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
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import DiscountIcon from '@mui/icons-material/Discount';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { getCart } from './service';
import CartItem from './components/CartItem';
import RoomItem from './components/RoomItem';
import PaymentModal from './components/PaymentModal/PaymentModal';
import { paymentModal, type PaymentModalType } from './components/PaymentModal/validation';

import useAuth from '~/app/redux/slices/auth.slice';
import { ROUTE_PATH } from '@constants';
import { getAllTimeline } from '@pages/admin/rom/service';

const DiscountModal = ({ open, onClose }) => {
   return (
      <Dialog 
         open={open} 
         onClose={onClose}
         maxWidth="sm"
         fullWidth
         PaperProps={{
            style: {
               borderRadius: '20px',
               backgroundColor: 'transparent'
            }
         }}
      >
         <Paper 
            sx={{
               background: '#1976d2',
               color: 'white',
               p: 3,
               borderRadius: '20px',
               position: 'relative'
            }}
         >
            {/* Close button */}
            <IconButton
               onClick={onClose}
               sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                  '&:hover': {
                     backgroundColor: 'rgba(255,255,255,0.1)'
                  }
               }}
            >
               <CloseIcon />
            </IconButton>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
               <Box 
                  sx={{
                     display: 'inline-flex',
                     p: 2,
                     borderRadius: '50%',
                     backgroundColor: 'rgba(255,255,255,0.1)',
                     mb: 2
                  }}
               >
                  <LocalOfferIcon sx={{ fontSize: 40 }} />
               </Box>
               <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Ưu Đãi Đặc Biệt
               </Typography>
               <Typography variant="subtitle1">
                  Tiết kiệm hơn khi đặt phòng dài hạn
               </Typography>
            </Box>

            {/* Discount Content */}
            <Box sx={{ mb: 3 }}>
               {/* Giảm giá theo thời gian */}
               <Paper 
                  sx={{ 
                     p: 2, 
                     mb: 2, 
                     bgcolor: 'rgba(255,255,255,0.1)',
                     borderRadius: '15px'
                  }}
               >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                     <TimerIcon sx={{ mr: 1 }} />
                     <Typography variant="h6">Giảm Giá Theo Thời Gian</Typography>
                  </Box>
                  <Box sx={{ pl: 4 }}>
                     <Typography sx={{ mb: 1 }}>
                        • Thuê ≥ 30 ngày: <Box component="span" sx={{ color: '#4caf50', fontWeight: 'bold' }}>Giảm 30%</Box>
                     </Typography>
                     <Typography sx={{ mb: 1 }}>
                        • Thuê ≥ 7 ngày: <Box component="span" sx={{ color: '#4caf50', fontWeight: 'bold' }}>Giảm 25%</Box>
                     </Typography>
                     <Typography>
                        • Thuê ≥ 3 ngày: <Box component="span" sx={{ color: '#4caf50', fontWeight: 'bold' }}>Giảm 20%</Box>
                     </Typography>
                  </Box>
               </Paper>

               {/* Giảm giá theo ngày và VIP */}
               <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                     <Paper 
                        sx={{ 
                           p: 2, 
                           height: '100%',
                           bgcolor: 'rgba(255,255,255,0.1)',
                           borderRadius: '15px'
                        }}
                     >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                           <DiscountIcon sx={{ mr: 1 }} />
                           <Typography variant="h6">Giảm Giá Theo Ngày</Typography>
                        </Box>
                        <Typography>
                           Tính 20 giờ thay vì 24 giờ mỗi ngày
                           <Box component="span" sx={{ color: '#4caf50', fontWeight: 'bold', display: 'block', mt: 1 }}>
                              (Giảm 17%)
                           </Box>
                        </Typography>
                     </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <Paper 
                        sx={{ 
                           p: 2, 
                           height: '100%',
                           bgcolor: 'rgba(255,255,255,0.1)',
                           borderRadius: '15px'
                        }}
                     >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                           <StarIcon sx={{ mr: 1 }} />
                           <Typography variant="h6">Thành Viên VIP</Typography>
                        </Box>
                        <Typography>
                           Giảm thêm trên tổng hóa đơn
                           <Box component="span" sx={{ color: '#4caf50', fontWeight: 'bold', display: 'block', mt: 1 }}>
                              10% OFF
                           </Box>
                        </Typography>
                     </Paper>
                  </Grid>
               </Grid>
            </Box>

            {/* Button */}
            <Box sx={{ textAlign: 'center' }}>
               <Button 
                  variant="contained" 
                  onClick={onClose}
                  sx={{
                     bgcolor: 'white',
                     color: '#1976d2',
                     borderRadius: '10px',
                     px: 4,
                     '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                     }
                  }}
               >
                  Đã Hiểu
               </Button>
            </Box>
         </Paper>
      </Dialog>
   );
};

const Cart: React.FC = () => {
   const { user, isAuhthentication } = useAuth();
   const navigate = useNavigate();
   const [rooms, setRooms] = useState<Array<CartRoom>>([]);
   const [isOpen, setIsOpen] = useState<boolean>(false);
   const [showDiscount, setShowDiscount] = useState(true);

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

   return (
      <Container maxWidth="lg">
         <DiscountModal 
            open={showDiscount} 
            onClose={() => setShowDiscount(false)} 
         />
         
         {rooms.length === 0 && products.length === 0 ? (
            <Typography variant="h3" component="h3" textAlign="center" mt={10}>
               Không có sản phẩm nào trong giỏ hàng
            </Typography>
         ) : (
            <>
               <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', marginTop: 3 }}>
                  Giỏ Hàng Đặt Phòng & Sản Phẩm
               </Typography>
               <Button 
                  startIcon={<LocalOfferIcon />}
                  onClick={() => setShowDiscount(true)}
                  variant="outlined"
                  color="primary"
                  sx={{ mb: 2 }}
               >
                  Xem ưu đãi giảm giá
               </Button>
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
