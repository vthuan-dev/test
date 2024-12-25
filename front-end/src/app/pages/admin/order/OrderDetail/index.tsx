/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
   Box,
   Grid,
   Typography,
   Button,
   Card,
   CardContent,
   CardHeader,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import { ROUTE_PATH } from '@constants';
import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { getRequest, putRequest } from '~/app/configs';

const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
];

export const ORDER_STATUS = Object.freeze({
   PENDING: 'PENDING', // trống
   CONFIRMED: 'CONFIRMED', // đã xác nhận đặt
   CHECKED_IN: 'CHECKED_IN', // đẵ đến
   CHECKED_OUT: 'CHECKED_OUT', // đã trả phòng
   CANCELLED: 'CANCELLED', // hủy
});

// Cấu trúc nhãn trạng thái đơn hàng bằng tiếng Việt
export const ORDER_STATUS_LABELS = Object.freeze({
   PENDING: 'Đang chờ xác nhận',
   CONFIRMED: 'Đã xác nhận',
   CHECKED_IN: 'Đã thanh toán',
   CHECKED_OUT: 'Hoàn thành',
   CANCELLED: 'Đã hủy',
});

export type OrderStatusKey = keyof typeof ORDER_STATUS;

// Hàm lấy trạng thái tiếp theo với kiểu dữ liệu cụ thể
export const getNextStatus = (currentStatus: OrderStatusKey): OrderStatusKey => {
   switch (currentStatus) {
      case 'PENDING':
         return 'CONFIRMED';
      case 'CONFIRMED':
         return 'CHECKED_IN';
      case 'CHECKED_IN':
         return 'CHECKED_OUT';
      default:
         return currentStatus;
   }
};

export const statusButtonColors = {
   CONFIRMED: 'info', // or any specific color, e.g., 'primary'
   CHECKED_IN: 'warning',
   CHECKED_OUT: 'success',
   CANCELLED: 'error',
};

const OrderDetail = () => {
   const { id } = useParams();

   const { data, refetch } = useQuery<{ data: OrderResponse }>({
      queryFn: () => getRequest(`/order/detail/${id}`),
   });
   const order = data?.data;

   const currentStatus = order?.order_status as OrderStatusKey | undefined;
   const nextStatus = currentStatus ? getNextStatus(currentStatus) : undefined;

   const { mutate: updateStatusRoom } = useMutation({
      mutationFn: () =>
         putRequest(`/room/update/${id}`, {
            status: nextStatus === 'CHECKED_IN' ? 'ACTIVE' : 'INACTIVE',
         }),
   });

   const { mutate } = useMutation({
      mutationFn: () =>
         putRequest(`/order/update/${order?.order_id}`, {
            status: nextStatus,
         }),
      onSuccess: () => {
         refetch();
         (nextStatus === 'CHECKED_IN' || nextStatus === 'CHECKED_OUT') && updateStatusRoom();
         toast.success('Cập nhật trạng thái thành công');
      },
   });

   const { mutate:mutateCancel } = useMutation({
      mutationFn: () =>
         putRequest(`/order/update/${order?.order_id}`, {
            status: "CANCELLED",
            username: order?.user?.username,
            email: order?.user?.email,
         }),
      onSuccess: () => {
         refetch();
         (nextStatus === 'CHECKED_IN' || nextStatus === 'CHECKED_OUT') && updateStatusRoom();
         toast.success('Cập nhật trạng thái thành công');
      },
   });


   return (
      <BaseBreadcrumbs arialabel="Chi tiết hóa đơn" breadcrumbs={breadcrumbs}>
         {/* Actions Section */}
         <Box display="flex" justifyContent="space-between" my={3}>
            {currentStatus !== 'CANCELLED' && currentStatus !== 'CHECKED_OUT' && (
               <Button
                  variant="contained"
                  color={statusButtonColors[nextStatus as never] || 'primary'} // Default to 'primary' if no color is found
                  sx={{ px: 4 }}
                  onClick={() => mutate()}
               >
                  {ORDER_STATUS_LABELS[nextStatus as never]}
               </Button>
            )}

            {currentStatus !== 'CANCELLED' && currentStatus !== 'CHECKED_OUT' && currentStatus !== 'CHECKED_IN' && (
               <Button variant="outlined" color="secondary" sx={{ px: 4 }}   onClick={() => mutateCancel()}>
                  Hủy hóa đơn
               </Button>
            )}

         </Box>
         {/* Order Overview Section */}
         <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader title="Thông tin đặt hàng" />
            <CardContent>
               <Grid container spacing={2}>
                  <Grid item xs={6}>
                     <Typography variant="body1">
                        <strong>Mã đơn hàng:</strong> {order?.order_id}
                     </Typography>
                     <Typography variant="body1">
                        <strong>Ngày tạo:</strong> {dayjs(order?.order_date).format('DD-MM-YYYY HH:mm:ss')}
                     </Typography>
                     <Typography variant="body1">
                        <strong>Trạng thái hóa đơn:</strong> {order?.order_status}
                     </Typography>
                     <Typography variant="body1" sx={{ display: 'flex', gap: 2 }}>
                        <strong>Tổng tiền:</strong>
                        <Typography color="error">{Number(order?.total_amount).toLocaleString()} đ</Typography>
                     </Typography>
                  </Grid>
                  <Grid item xs={6}>
                     <Typography variant="body1">
                        <strong>Người đặt:</strong> {order?.user?.username}
                     </Typography>
                     <Typography variant="body1">
                        <strong>Email:</strong> {order?.user?.email}
                     </Typography>
                     <Typography variant="body1">
                        <strong>VIP:</strong>{' '}
                        {order?.user?.is_vip ? `VIP (Expires: ${order.user.vip_end_date})` : 'Regular'}
                     </Typography>
                  </Grid>
               </Grid>
            </CardContent>
         </Card>

         {/* Room Booking Table */}
         {order?.rooms && (
            <Card variant="outlined" sx={{ mb: 3 }}>
               <CardHeader title="Chi tiết đặt phòng" />
               <CardContent>
                  <TableContainer>
                     <Table aria-label="room booking table">
                        <TableHead>
                           <TableRow>
                              <TableCell>
                                 <strong>Tên phòng</strong>
                              </TableCell>
                              <TableCell align="center">
                                 <strong>Thời gian vào</strong>
                              </TableCell>
                              <TableCell align="center">
                                 <strong>Thời gian ra</strong>
                              </TableCell>
                              <TableCell align="center">
                                 <strong>Số giờ</strong>
                              </TableCell>
                              <TableCell align="center">
                                 <strong>Total Price</strong>
                              </TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {order.rooms.map((room) => {
                              return (
                                 <TableRow>
                                    <TableCell>{room.room_name}</TableCell>
                                    <TableCell align="center">
                                       {dayjs(room.start_time).format('DD-MM-YYYY HH:mm:ss')}
                                    </TableCell>
                                    <TableCell align="center">
                                       {dayjs(room.end_time).format('DD-MM-YYYY HH:mm:ss')}
                                    </TableCell>
                                    <TableCell align="center">{room.total_time}</TableCell>
                                    <TableCell align="center">{Number(room.total_price).toLocaleString()}đ</TableCell>
                                 </TableRow>
                              );
                           })}
                        </TableBody>
                     </Table>
                  </TableContainer>
               </CardContent>
            </Card>
         )}

         {/* Product Details Table */}
         {order?.products && (
            <Card variant="outlined" sx={{ mb: 1 }}>
               <CardHeader title="Chi tiết sản phẩm" />
               <CardContent>
                  <TableContainer>
                     <Table aria-label="product table">
                        <TableHead>
                           <TableRow>
                              <TableCell>
                                 <strong>Tên sản phẩm</strong>
                              </TableCell>
                              <TableCell align="center">
                                 <strong>Danh mục</strong>
                              </TableCell>
                              <TableCell align="center">
                                 <strong>Số lượng</strong>
                              </TableCell>
                              <TableCell align="center">
                                 <strong>Giá</strong>
                              </TableCell>
                              <TableCell align="center">
                                 <strong>Tổng tiền</strong>
                              </TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {order.products.map((product) => (
                              <TableRow key={product.id}>
                                 <TableCell>{product.product_name}</TableCell>
                                 <TableCell align="center">{product.category}</TableCell>
                                 <TableCell align="center">{product.quantity}</TableCell>
                                 <TableCell align="center">{Number(product.unit_price).toLocaleString()}đ</TableCell>
                                 <TableCell align="center">
                                    {(product.quantity * product.unit_price).toLocaleString()}đ
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </TableContainer>
               </CardContent>
            </Card>
         )}
      </BaseBreadcrumbs>
   );
};

export default OrderDetail;
