/* eslint-disable @typescript-eslint/naming-convention */
import {
   Avatar,
   Box,
   Button,
   Card,
   CardContent,
   Grid,
   Paper,
   Typography,
   Table,
   TableHead,
   TableRow,
   TableCell,
   TableBody,
   Modal,
   Divider,
   Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import { getNextStatus, ORDER_STATUS_LABELS, statusButtonColors, type OrderStatusKey } from '../order/OrderDetail';

import { ROUTE_PATH } from '@constants';
import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { getRequest } from '~/app/configs';

const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
   {
      title: 'Danh sách người dùng',
      link: ROUTE_PATH.ADMIN_USER,
   },
];

const UserDetail = () => {
   const { id } = useParams();
   const [openModal, setOpenModal] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

   const { data: user } = useQuery<ResponseGet<UserData>>({
      queryKey: ['admin-user-info'],
      queryFn: () => getRequest(`/auth/find-by-id/${id}`),
   });

   const { data: orders } = useQuery<ResponseGet<OrderData[]>>({
      queryKey: ['admin-order-user-id', id],
      queryFn: () => getRequest(`/order/get-one-order-by-user-id/${id}`),
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
      <BaseBreadcrumbs arialabel="Chi tiết người dùng" breadcrumbs={breadcrumbs}>
         <Card variant="outlined" sx={{ marginTop: 4 }}>
            <CardContent>
               <Grid container spacing={2} alignItems="center">
                  <Grid item>
                     <Avatar
                        alt={user?.data.username}
                        src="/static/images/avatar/1.jpg"
                        sx={{ width: 80, height: 80 }}
                     />
                  </Grid>
                  <Grid item xs>
                     <Typography variant="h4" component="div" gutterBottom>
                        {user?.data.username}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        Ngày tạo: {new Date(user?.data.created_at as never).toLocaleDateString()}
                     </Typography>
                  </Grid>
               </Grid>
               <Box mt={2}>
                  <Typography variant="h6">Thông tin chi tiết:</Typography>
                  <Typography variant="body1">Email: {user?.data.email}</Typography>
                  <Typography variant="body1">Trạng thái VIP: {user?.data.is_vip ? 'Có' : 'Không'}</Typography>
               </Box>
            </CardContent>
         </Card>

         <Box mt={4}>
            <Typography variant="h5">Lịch sử đặt hàng:</Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableCell>Mã đơn hàng</TableCell>
                        <TableCell>Ngày đặt</TableCell>
                        <TableCell>Tổng tiền</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Chi tiết</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {orders?.data && orders?.data.length > 0 ? (
                        orders.data.map((order) => {
                           const currentStatus = order.order_status as OrderStatusKey | undefined;
                           const nextStatus = currentStatus ? getNextStatus(currentStatus) : undefined;
                           return (
                              <TableRow key={order.id} hover>
                                 <TableCell>{order.id}</TableCell>
                                 <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                 <TableCell>{order.total_money.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                                 <TableCell>
                                    <Chip
                                       label={ORDER_STATUS_LABELS[nextStatus as never]}
                                       color={statusButtonColors[nextStatus as never] || 'primary'}
                                    />
                                 </TableCell>
                                 <TableCell>
                                    <Button variant="contained" color="primary" onClick={() => handleOpenModal(order)}>
                                       Xem chi tiết
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           );
                        })
                     ) : (
                        <TableRow>
                           <TableCell colSpan={5} align="center">
                              Không có đơn hàng nào.
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </Paper>
         </Box>

         {/* Modal hiển thị chi tiết đơn hàng */}
         <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="order-details-title"
            aria-describedby="order-details-description"
         >
            <Box
               sx={{
                  p: 4,
                  bgcolor: '#fff',
                  borderRadius: 2,
                  maxWidth: 600,
                  margin: 'auto',
                  marginTop: '100px',
                  boxShadow: 24,
                  maxHeight: '80vh',
                  overflowY: 'auto',
               }}
            >
               <Typography id="order-details-title" variant="h5" component="h2" gutterBottom>
                  Chi tiết đơn hàng #{selectedOrder?.id}
               </Typography>
               <Divider sx={{ mb: 2 }} />
               <Grid container spacing={2}>
                  <Grid item xs={12}>
                     <Typography variant="body1" sx={{ color: '#3f51b5', mb: 1 }}>
                        Ngày đặt hàng:{' '}
                        <strong>{new Date(selectedOrder?.order_date as never).toLocaleDateString()}</strong>
                     </Typography>
                  </Grid>
                  <Grid item xs={12}>
                     <Typography
                        variant="body1"
                        sx={{ color: selectedOrder?.order_status === 'Đã giao' ? 'green' : 'red', mb: 1 }}
                     >
                        Trạng thái: <strong>{selectedOrder?.order_status}</strong>
                     </Typography>
                  </Grid>
                  <Grid item xs={12}>
                     <Typography variant="body1" sx={{ mb: 2 }}>
                        Tổng tiền: <strong>{selectedOrder?.total_money.toLocaleString()} VND</strong>
                     </Typography>
                  </Grid>
                  <Grid item xs={12} mt={2}>
                     <Typography variant="h6" sx={{ color: '#3f51b5', fontWeight: 'bold', mb: 1 }}>
                        Chi tiết sản phẩm:
                     </Typography>
                     <Grid container spacing={2}>
                        {selectedOrder?.order_details && selectedOrder.order_details.length > 0 ? (
                           selectedOrder.order_details.map((detail) => (
                              <Grid item xs={6} key={detail.id}>
                                 {/* 2 sản phẩm mỗi hàng */}
                                 <Card sx={{ display: 'flex', padding: 2, borderRadius: 2 }}>
                                    <img
                                       src={detail.product_image}
                                       alt={detail.product_name}
                                       style={{
                                          width: 80,
                                          height: 80,
                                          borderRadius: 8,
                                          marginRight: 12,
                                       }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                       <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                          Sản phẩm: {detail.product_name}
                                       </Typography>
                                       <Typography variant="body2">
                                          Số lượng: <strong>{detail.quantity}</strong>
                                       </Typography>
                                       <Typography variant="body2">
                                          Giá: <strong>{Number(detail.price).toLocaleString()} VND</strong>
                                       </Typography>
                                       <Typography variant="body2">
                                          Tổng:{' '}
                                          <strong>
                                             {(Number(detail.quantity) * Number(detail.price)).toLocaleString()} VND
                                          </strong>
                                       </Typography>
                                    </Box>
                                 </Card>
                              </Grid>
                           ))
                        ) : (
                           <Typography variant="body2">Không có sản phẩm nào.</Typography>
                        )}
                     </Grid>
                  </Grid>
                  <Grid item xs={12} mt={2}>
                     <Typography variant="h6" sx={{ color: '#3f51b5', fontWeight: 'bold', mb: 1 }}>
                        Chi tiết đặt phòng:
                     </Typography>
                     <Grid container spacing={2}>
                        {selectedOrder?.room_order_details && selectedOrder.room_order_details.length > 0 ? (
                           selectedOrder.room_order_details.map((roomDetail) => (
                              <Grid item xs={12} key={roomDetail.room_id}>
                                 <Card sx={{ display: 'flex', padding: 2, borderRadius: 2 }}>
                                    <img
                                       src={roomDetail.room_image} // Assuming room_image is provided
                                       alt={`Room ${roomDetail.room_id}`}
                                       style={{
                                          width: 80,
                                          height: 80,
                                          borderRadius: 8,
                                          marginRight: 12,
                                       }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                       <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                          Phòng ID: <strong>{roomDetail.room_id}</strong>
                                       </Typography>
                                       <Typography variant="body2">
                                          Thời gian bắt đầu:{' '}
                                          <strong>{new Date(roomDetail.start_time).toLocaleString()}</strong>
                                       </Typography>
                                       <Typography variant="body2">
                                          Thời gian kết thúc:{' '}
                                          <strong>{new Date(roomDetail.end_time).toLocaleString()}</strong>
                                       </Typography>
                                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                          <Typography variant="body2">
                                             Tổng giá: <strong>{roomDetail.total_price.toLocaleString()} VND</strong>
                                          </Typography>
                                          {selectedOrder?.order_status !== 'CHECKED_OUT' && 
                                           selectedOrder?.order_status !== 'CANCELLED' && (
                                            <Button
                                              startIcon={<SwapHorizIcon />}
                                              variant="outlined"
                                              size="small"
                                              color="primary"
                                              onClick={() => {
                                                setSelectedRoom(roomDetail);
                                                setChangeRoomOpen(true);
                                              }}
                                            >
                                              Đổi phòng
                                            </Button>
                                          )}
                                       </Box>
                                    </Box>
                                 </Card>
                              </Grid>
                           ))
                        ) : (
                           <Typography variant="body2">Không có phòng nào.</Typography>
                        )}
                     </Grid>
                  </Grid>
               </Grid>
               <Box mt={3} display="flex" justifyContent="flex-end">
                  <Button variant="outlined" color="primary" onClick={handleCloseModal}>
                     Đóng
                  </Button>
               </Box>
            </Box>
         </Modal>
      </BaseBreadcrumbs>
   );
};

export default UserDetail;
