/* eslint-disable @typescript-eslint/naming-convention */
import {
   Box,
   Button,
   Card,
   Chip,
   Divider,
   Grid,
   Modal,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
      <>
         <Box mt={4}>
            <Typography variant="h5">Lịch sử đặt hàng:</Typography>
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
                              <TableCell>{order.total_money.toLocaleString('vi-VN', 
                                    { style: 'currency', currency: 'VND' })}</TableCell>
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
                                          <Typography variant="body2">
                                             Tổng giá: <strong>{roomDetail.total_price.toLocaleString()} VND</strong>
                                          </Typography>
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
         </Box>
      </>
   );
};

export default HistoryCart;
