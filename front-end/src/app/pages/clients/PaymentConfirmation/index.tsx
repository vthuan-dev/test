/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Button, Divider } from '@mui/material';
import { getUserInfo, getCartDetails } from './api'; // Giả định bạn có một API lấy thông tin người dùng và giỏ hàng

const PaymentConfirmation: React.FC = () => {
   const [user, setUser] = useState<User | null>(null);
   const [orderDetails, setOrderDetails] = useState<CartProduct[]>([]);
   const [totalAmount, setTotalAmount] = useState(0);

   useEffect(() => {
      // Lấy thông tin người dùng
      getUserInfo().then(setUser);

      // Lấy thông tin giỏ hàng
      getCartDetails().then((data) => {
         setOrderDetails(data.cartProduct);
         const total = data.cartProduct.reduce((acc, product) => acc + product.price * product.quantity, 0);
         setTotalAmount(total);
      });
   }, []);

   const handleConfirm = () => {
      // Xử lý xác nhận thanh toán
   };

   if (!user || orderDetails.length === 0) {
      return <Typography>Loading...</Typography>; // Hoặc trang loading
   }

   return (
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
         <Typography variant="h4" gutterBottom align="center">
            Xác Nhận Thanh Toán
         </Typography>
         <Divider sx={{ marginBottom: 3 }} />

         {/* Thông Tin Người Dùng */}
         <Typography variant="h6" gutterBottom>
            Thông Tin Người Dùng
         </Typography>
         <Typography>{user.name}</Typography>
         <Typography>{user.address}</Typography>
         <Typography>{user.phone}</Typography>

         <Divider sx={{ marginY: 3 }} />

         {/* Thông Tin Đặt Hàng */}
         <Typography variant="h6" gutterBottom>
            Thông Tin Đặt Hàng
         </Typography>
         {orderDetails.map((item) => (
            <Grid container justifyContent="space-between" key={item.id}>
               <Grid item xs={8}>
                  <Typography>{item.product_name}</Typography>
                  <Typography variant="body2">Số lượng: {item.quantity}</Typography>
               </Grid>
               <Grid item xs={4}>
                  <Typography>{(item.price * item.quantity).toLocaleString()} VND</Typography>
               </Grid>
            </Grid>
         ))}

         <Divider sx={{ marginY: 2 }} />

         {/* Tổng cộng */}
         <Grid container justifyContent="space-between" sx={{ marginBottom: 2 }}>
            <Typography variant="h6">Tổng cộng:</Typography>
            <Typography variant="h6">{totalAmount.toLocaleString()} VND</Typography>
         </Grid>

         {/* Nút Xác Nhận */}
         <Button variant="contained" color="primary" fullWidth onClick={handleConfirm}>
            Xác Nhận Thanh Toán
         </Button>
      </Container>
   );
};

export default PaymentConfirmation;
