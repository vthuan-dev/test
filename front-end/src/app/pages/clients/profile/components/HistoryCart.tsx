/* eslint-disable @typescript-eslint/naming-convention */
import {
   Box,
   Button,
   Card,
   Chip,
   Divider,
   Grid,
   Modal,
   Stack,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Typography,
   Paper,
   IconButton,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';

import {
   getNextStatus,
   ORDER_STATUS_LABELS,
   statusButtonColors,
   type OrderStatusKey,
} from '@pages/admin/order/OrderDetail';
import { getRequest } from '~/app/configs';
import useAuth from '~/app/redux/slices/auth.slice';

const HistoryCart = () => {
   const { user } = useAuth();
   const [openModal, setOpenModal] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

   const { data: orders } = useQuery<ResponseGet<OrderData[]>>({
      queryKey: ['admin-order-user-id'],
      queryFn: () => getRequest(`/order/get-one-order-by-user-id/${user?.id}`),
   });

   const handleOpenModal = (order: OrderData) => {
      setSelectedOrder(order);
      setOpenModal(true);
   };

   const handleCloseModal = () => {
      setOpenModal(false);
      setSelectedOrder(null);
   };

   return (
      <Box sx={{ p: 3 }}>
         <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
            Lịch sử đặt hàng
         </Typography>

         <TableContainer component={Paper} elevation={3}>
            <Table>
               <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mã đơn</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày đặt</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tổng tiền</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Chi tiết</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {orders?.data?.map((order) => (
                     <TableRow 
                        key={order.id} 
                        hover
                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                     >
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{new Date(order.order_date).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium', color: 'success.main' }}>
                           {order.total_money.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </TableCell>
                        <TableCell>
                           <Chip
                              label={order.order_status}
                              color={order.payment_status === 1 ? 'success' : 'error'}
                              variant="outlined"
                              size="small"
                           />
                        </TableCell>
                        <TableCell>
                           <Button 
                              variant="contained"
                              size="small"
                              onClick={() => handleOpenModal(order)}
                              startIcon={<ReceiptIcon />}
                           >
                              Chi tiết
                           </Button>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TableContainer>

         {/* Modal Chi tiết */}
         <Modal open={openModal} onClose={handleCloseModal}>
            <Box sx={{
               position: 'absolute',
               top: '50%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
               width: { xs: '90%', sm: '80%', md: 800 },
               maxHeight: '90vh',
               bgcolor: 'background.paper',
               borderRadius: 2,
               boxShadow: 24,
               overflow: 'auto',
            }}>
               {/* Header */}
               <Box sx={{ 
                  p: 2, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
               }}>
                  <Typography variant="h6">
                     Chi tiết đơn hàng #{selectedOrder?.id}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
                     <CloseIcon />
                  </IconButton>
               </Box>

               <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                     {/* Thông tin đơn hàng */}
                     <Grid item xs={12}>
                        <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                           <Stack spacing={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <AccessTimeIcon color="primary" />
                                 <Typography>
                                    Ngày đặt: {new Date(selectedOrder?.order_date as string).toLocaleString('vi-VN')}
                                 </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <PaymentIcon color="primary" />
                                 <Stack>
                                    <Typography>
                                       Phương thức: {selectedOrder?.payment_method === 1 ? 
                                          'Thanh toán online' : 'Thanh toán tại quầy'}
                                    </Typography>
                                    <Chip 
                                       label={selectedOrder?.payment_status === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                       color={selectedOrder?.payment_status === 1 ? 'success' : 'error'}
                                       size="small"
                                       sx={{ mt: 1 }}
                                    />
                                 </Stack>
                              </Box>
                           </Stack>
                        </Card>
                     </Grid>

                     {/* Chi tiết phòng */}
                     {selectedOrder?.room_order_details?.map((room) => (
                        <Grid item xs={12} key={room.id}>
                           <Card sx={{ 
                              p: 2,
                              display: 'flex',
                              gap: 2,
                              '&:hover': { boxShadow: 6 },
                              transition: 'box-shadow 0.3s'
                           }}>
                              <Box 
                                 component="img"
                                 src={room.room_image}
                                 sx={{ 
                                    width: 200,
                                    height: 120,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                 }}
                              />
                              <Stack spacing={1} flex={1}>
                                 <Typography variant="h6" color="primary">
                                    {room.room_name}
                                 </Typography>
                                 
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                       {new Date(room.start_time).toLocaleString('vi-VN')} - 
                                       {new Date(room.end_time).toLocaleString('vi-VN')}
                                    </Typography>
                                 </Box>

                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOnIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                       {room.room_position}
                                    </Typography>
                                 </Box>

                                 <Typography 
                                    variant="subtitle1" 
                                    color="success.main"
                                    sx={{ fontWeight: 'bold', mt: 'auto' }}
                                 >
                                    {room.total_price.toLocaleString('vi-VN', { 
                                       style: 'currency', 
                                       currency: 'VND' 
                                    })}
                                 </Typography>
                              </Stack>
                           </Card>
                        </Grid>
                     ))}
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="h6">
                        Tổng tiền: {' '}
                        <Typography 
                           component="span" 
                           color="success.main" 
                           variant="h6" 
                           fontWeight="bold"
                        >
                           {selectedOrder?.total_money.toLocaleString('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND' 
                           })}
                        </Typography>
                     </Typography>
                     <Button variant="contained" onClick={handleCloseModal}>
                        Đóng
                     </Button>
                  </Box>
               </Box>
            </Box>
         </Modal>
      </Box>
   );
};

export default HistoryCart;
