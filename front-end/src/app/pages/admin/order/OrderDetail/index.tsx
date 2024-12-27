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
   IconButton,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   TextField,
   MenuItem,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useState } from 'react';

import { ROUTE_PATH } from '@constants';
import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { getRequest, putRequest, postRequest } from '~/app/configs';

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
   const queryClient = useQueryClient();

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

   const [changeRoomOpen, setChangeRoomOpen] = useState(false);
   const [selectedRoom, setSelectedRoom] = useState<any>(null);
   const [newRoomId, setNewRoomId] = useState<string>('');

   const { data: availableRooms } = useQuery({
      queryKey: ['available-rooms'],
      queryFn: () => getRequest('/order-room-detail/available-rooms'),
      enabled: changeRoomOpen,
   });

   const { mutate: mutateChangeRoom, isLoading: isChangingRoom } = useMutation({
      mutationFn: (data: any) => {
         return postRequest('/order-room-detail/change-room', data);
      },
      onSuccess: () => {
         toast.success('Đổi phòng thành công');
         setChangeRoomOpen(false);
         queryClient.invalidateQueries(['order', id]);
      },
      onError: (error: any) => {
         console.error('Change room error:', error);
         toast.error(error?.response?.data?.message || 'Đổi phòng thất bại');
      },
   });

   const handleRoomChange = (room: OrderRoom) => {
      console.log('Original room data:', room);
      
      // Đảm bảo có đủ thông tin cần thiết
      const roomData = {
         id: room.id,                // ID của room_order_detail
         room_id: room.room_id,      // ID của room
         room_name: room.room_name,
         start_time: room.start_time,
         end_time: room.end_time,
         total_price: room.total_price,
         total_time: room.total_time
      };
      
      console.log('Room data before setting:', roomData);
      setSelectedRoom(roomData);
      setChangeRoomOpen(true);
   };

   const handleChangeRoom = () => {
      if (!selectedRoom || !newRoomId) {
         toast.error('Vui lòng chọn phòng');
         return;
      }

      // Log để kiểm tra dữ liệu
      console.log('Selected room:', selectedRoom);
      console.log('Order ID:', order?.order_id);

      // Kiểm tra và chuyển đổi kiểu dữ liệu
      const orderId = Number(order?.order_id);
      const orderDetailId = Number(selectedRoom.id);
      const oldRoomId = Number(selectedRoom.room_id);
      const newRoomIdNum = Number(newRoomId);

      // Kiểm tra tính hợp lệ của dữ liệu
      if (isNaN(orderId) || isNaN(orderDetailId) || isNaN(oldRoomId) || isNaN(newRoomIdNum)) {
         console.error('Invalid data:', { orderId, orderDetailId, oldRoomId, newRoomIdNum });
         toast.error('Dữ liệu không hợp lệ');
         return;
      }

      const changeRoomData: ChangeRoomRequest = {
         orderId,
         orderDetailId,
         oldRoomId,
         newRoomId: newRoomIdNum,
         startTime: dayjs(selectedRoom.start_time).format(),
         endTime: dayjs(selectedRoom.end_time).format()
      };

      console.log('Final change room request:', changeRoomData);
      mutateChangeRoom(changeRoomData);
   };

   const RoomChangeDialog = () => {
      return (
         <Dialog
            open={changeRoomOpen}
            onClose={() => {
               setChangeRoomOpen(false);
               setSelectedRoom(null);
               setNewRoomId('');
            }}
            maxWidth="sm"
            fullWidth
         >
            <DialogTitle>
               {selectedRoom ? `Đổi phòng ${selectedRoom.room_name}` : 'Đổi phòng'}
            </DialogTitle>
            <DialogContent>
               <Box sx={{ mt: 2 }}>
                  {selectedRoom && (
                     <>
                        <Typography variant="body2" gutterBottom>
                           Thời gian: {dayjs(selectedRoom.start_time).format('DD/MM/YYYY HH:mm')} - 
                           {dayjs(selectedRoom.end_time).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                           Giá hiện tại: {Number(selectedRoom.total_price).toLocaleString()}đ
                        </Typography>
                     </>
                  )}
                  
                  <TextField
                     select
                     fullWidth
                     label="Chọn phòng mới"
                     value={newRoomId}
                     onChange={(e) => setNewRoomId(e.target.value)}
                     sx={{ mt: 2 }}
                  >
                     {availableRooms?.data?.map((room: any) => (
                        <MenuItem 
                           key={room.room_id}
                           value={room.room_id}
                           disabled={room.room_id === selectedRoom?.room_id}
                        >
                           {room.name} - {room.status} - {Number(room.price).toLocaleString()}đ/giờ
                        </MenuItem>
                     ))}
                  </TextField>
               </Box>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setChangeRoomOpen(false)}>Hủy</Button>
               <Button 
                  variant="contained" 
                  color="primary"
                  disabled={!selectedRoom || !newRoomId || isChangingRoom}
                  onClick={handleChangeRoom}
               >
                  {isChangingRoom ? 'Đang xử lý...' : 'Xác nhận đổi phòng'}
               </Button>
            </DialogActions>
         </Dialog>
      );
   };

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
                        <strong>Ngày từ:</strong> {dayjs(order?.order_date).format('DD-MM-YYYY HH:mm:ss')}
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
                              <TableCell align="center"><strong>Thao tác</strong></TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {order.rooms.map((room) => (
                              <TableRow key={room.order_detail_id || room.id}>
                                 <TableCell>{room.room_name}</TableCell>
                                 <TableCell align="center">
                                    {dayjs(room.start_time).format('DD-MM-YYYY HH:mm:ss')}
                                 </TableCell>
                                 <TableCell align="center">
                                    {dayjs(room.end_time).format('DD-MM-YYYY HH:mm:ss')}
                                 </TableCell>
                                 <TableCell align="center">{room.total_time}</TableCell>
                                 <TableCell align="center">{Number(room.total_price).toLocaleString()}đ</TableCell>
                                 <TableCell align="center">
                                    {currentStatus !== 'CHECKED_OUT' && currentStatus !== 'CANCELLED' && (
                                       <IconButton
                                          onClick={() => handleRoomChange({
                                             id: room.id,                // ID của room_order_detail 
                                             room_id: room.room_id,      // ID của room
                                             room_name: room.room_name,
                                             start_time: room.start_time,
                                             end_time: room.end_time,
                                             total_price: room.total_price,
                                             total_time: room.total_time
                                          })}
                                          sx={{
                                             color: 'primary.main',
                                             '&:hover': {
                                                backgroundColor: 'rgba(0, 127, 255, 0.08)'
                                             }
                                          }}
                                       >
                                          <SwapHorizIcon />
                                       </IconButton>
                                    )}
                                 </TableCell>
                              </TableRow>
                           ))}
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

         <RoomChangeDialog />
      </BaseBreadcrumbs>
   );
};

export default OrderDetail;
