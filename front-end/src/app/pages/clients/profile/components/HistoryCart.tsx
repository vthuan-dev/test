/* eslint-disable @typescript-eslint/naming-convention */
import {
   Box,
   Button,
   Card,
   Chip,
   Grid,
   Modal,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Typography,
   Paper,
   IconButton,
   Tabs,
   Tab,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogContentText,
   TextField,
   DialogActions,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { toast } from 'react-toastify';

import {
   getNextStatus,
   ORDER_STATUS_LABELS,
   statusButtonColors,
   type OrderStatusKey,
} from '@pages/admin/order/OrderDetail';
import { getRequest, postRequest } from '~/app/configs';
import useAuth from '~/app/redux/slices/auth.slice';
import { type ResponseGet } from '~/app/types/response';

interface OrderData {
   id: number;
   order_date: string;
   total_money: number;
   order_status: string;
   payment_status: number;
   order_details?: Array<{
      id: number;
      product_name: string;
      product_image: string;
      quantity: number;
      price: number;
   }>;
   room_order_details?: Array<{
      id: number;
      room_id: number;
      room_name: string;
      room_image: string;
      start_time: string;
      end_time: string;
      total_time: number;
      total_price: number;
   }>;
}

const HistoryCart = () => {
   const { user } = useAuth();
   const [openModal, setOpenModal] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
   const [currentTab, setCurrentTab] = useState('all');
   const [extendRoomId, setExtendRoomId] = useState<number | null>(null);
   const [additionalHours, setAdditionalHours] = useState(1);
   const [selectedOrderForExtend, setSelectedOrderForExtend] = useState<number | null>(null);
   const queryClient = useQueryClient();

   const { data: orders } = useQuery<ResponseGet<OrderData[]>>({
      queryKey: ['admin-order-user-id'],
      queryFn: () => getRequest(`/order/get-one-order-by-user-id/${user?.id}`),
   });

   const extendTimeMutation = useMutation({
      mutationFn: (data: { order_id: number; room_order_id: number; additional_hours: number }) =>
         postRequest('/order/extend-room-time', data),
      onSuccess: (response) => {
         queryClient.invalidateQueries(['admin-order-user-id']);
         handleCloseExtendModal();
         toast.success('Gia hạn thời gian thành công');
      },
      onError: (error: any) => {
         const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi gia hạn';
         toast.error(errorMessage);
      }
   });

   const handleOpenModal = (order: OrderData) => {
      setSelectedOrder(order);
      setOpenModal(true);
   };

   const handleCloseModal = () => {
      setOpenModal(false);
      setSelectedOrder(null);
   };

   const handleExtendTime = (roomOrderId: number, orderId: number) => {
      console.log("Extending time for:", { roomOrderId, orderId });
      setExtendRoomId(roomOrderId);
      setSelectedOrderForExtend(orderId);
   };

   const handleConfirmExtend = () => {
      if (!extendRoomId || !selectedOrderForExtend) {
         toast.error('Thiếu thông tin cần thiết để gia hạn');
         return;
      }

      if (additionalHours <= 0 || additionalHours > 24) {
         toast.error('Số giờ gia hạn không hợp lệ');
         return;
      }

      extendTimeMutation.mutate({
         order_id: selectedOrderForExtend,
         room_order_id: extendRoomId,
         additional_hours: additionalHours
      });
   };

   const handleCloseExtendModal = () => {
      setExtendRoomId(null);
      setSelectedOrderForExtend(null);
      setAdditionalHours(1);
   };

   const filteredOrders = orders?.data?.filter(order => {
      const hasProducts = order.order_details && order.order_details.length > 0;
      const hasRooms = order.room_order_details && order.room_order_details.length > 0;

      switch (currentTab) {
         case 'products':
            return hasProducts && !hasRooms;
         case 'rooms':
            return hasRooms && !hasProducts;
         case 'mixed':
            return hasProducts && hasRooms;
         case 'all':
         default:
            return true;
      }
   });

   return (
      <Box sx={{ 
         width: '100%',
         p: 3,
         '& .MuiGrid-root': {
            width: '100%',
            margin: 0
         }
      }}>
         <Typography variant="h4" sx={{ 
            mb: 4, 
            fontWeight: 'bold', 
            color: 'primary.main' 
         }}>
            Lịch sử đặt hàng
         </Typography>

         {/* Tabs Filter */}
         <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            mb: 3,
            width: '100%'
         }}>
            <Tabs 
               value={currentTab} 
               onChange={(e, newValue) => setCurrentTab(newValue)}
               sx={{ 
                  mb: 2,
                  '& .MuiTabs-flexContainer': {
                     gap: 2
                  }
               }}
            >
               <Tab
                  icon={<ReceiptIcon />}
                  iconPosition="start"
                  label="Tất cả đơn hàng"
                  value="all"
               />
               <Tab
                  icon={<ShoppingCartIcon />}
                  iconPosition="start"
                  label="Đơn hàng sản phẩm"
                  value="products"
               />
               <Tab
                  icon={<MeetingRoomIcon />}
                  iconPosition="start"
                  label="Đơn đặt phòng"
                  value="rooms"
               />
               <Tab
                  icon={<ReceiptIcon />}
                  iconPosition="start"
                  label="Đơn tổng hợp"
                  value="mixed"
               />
            </Tabs>
         </Box>

         {/* Orders Table */}
         <TableContainer component={Paper} 
            sx={{
               width: '100%',
               overflowX: 'auto',
               '& .MuiTable-root': {
                  minWidth: '100%',
               },
               '& .MuiTableCell-root': {
                  whiteSpace: 'nowrap',
                  px: 2
               }
            }}
         >
            <Table>
               <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mã đơn</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày đặt</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tổng tiền</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loại đơn</TableCell>
                     <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Chi tiết</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {filteredOrders?.map((order) => (
                     <TableRow key={order.id} hover>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>
                           {new Date(order.order_date).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'medium', color: 'success.main' }}>
                           {order.total_money.toLocaleString('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND' 
                           })}
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
                           <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              gap: 1 
                           }}>
                              {order.order_details?.length > 0 && (
                                 <Chip
                                    icon={<ShoppingCartIcon />}
                                    label="Sản phẩm"
                                    size="small"
                                    color="info"
                                 />
                              )}
                              {order.room_order_details?.length > 0 && (
                                 <Chip
                                    icon={<MeetingRoomIcon />}
                                    label="Phòng"
                                    size="small"
                                    color="secondary"
                                 />
                              )}
                           </Box>
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

               {/* Content */}
               <Box sx={{ p: 3 }}>
                  {/* Thông tin đơn hàng */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                     <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                           <AccessTimeIcon color="action" />
                           <Typography>
                              Ngày đặt: {selectedOrder && new Date(selectedOrder.order_date).toLocaleDateString('vi-VN')}
                           </Typography>
                        </Box>
                     </Grid>
                     <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                           <PaymentIcon color="action" />
                           <Typography>
                              Tổng tiền: {selectedOrder?.total_money.toLocaleString('vi-VN')}đ
                           </Typography>
                        </Box>
                     </Grid>
                  </Grid>

                  {/* Chi tiết phòng */}
                  {selectedOrder?.room_order_details && selectedOrder.room_order_details.length > 0 && (
                     <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Chi tiết phòng</Typography>
                        <TableContainer component={Paper}>
                           <Table>
                              <TableHead>
                                 <TableRow>
                                    <TableCell>Tên phòng</TableCell>
                                    <TableCell>Thời gian bắt đầu</TableCell>
                                    <TableCell>Thời gian kết thúc</TableCell>
                                    <TableCell>Hành động</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 {selectedOrder.room_order_details.map((room) => (
                                    <TableRow key={room.id}>
                                       <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                             <img 
                                                src={room.room_image}
                                                alt={room.room_name}
                                                style={{ 
                                                   width: 50, 
                                                   height: 50, 
                                                   objectFit: 'cover',
                                                   borderRadius: '4px',
                                                   display: 'block'
                                                }}
                                             />
                                             {room.room_name}
                                          </Box>
                                       </TableCell>
                                       <TableCell>{new Date(room.start_time).toLocaleString('vi-VN')}</TableCell>
                                       <TableCell>{new Date(room.end_time).toLocaleString('vi-VN')}</TableCell>
                                       <TableCell>
                                          <Button
                                             variant="contained"
                                             color="primary"
                                             size="small"
                                             onClick={() => handleExtendTime(room.id, selectedOrder!.id)}
                                             disabled={new Date(room.end_time) < new Date()}
                                          >
                                             Gia hạn
                                          </Button>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </TableContainer>
                     </Box>
                  )}

                  {/* Chi tiết sản phẩm */}
                  {selectedOrder?.order_details && selectedOrder.order_details.length > 0 && (
                     <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>Chi tiết sản phẩm</Typography>
                        <TableContainer component={Paper}>
                           <Table>
                              <TableHead>
                                 <TableRow>
                                    <TableCell>Tên sản phẩm</TableCell>
                                    <TableCell align="center">Số l��ợng</TableCell>
                                    <TableCell align="right">Đơn giá</TableCell>
                                    <TableCell align="right">Thành tiền</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 {selectedOrder.order_details.map((product) => (
                                    <TableRow key={product.id}>
                                       <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                             <img 
                                                src={product.product_image}
                                                alt={product.product_name}
                                                style={{ 
                                                   width: 50, 
                                                   height: 50, 
                                                   objectFit: 'cover',
                                                   borderRadius: '4px',
                                                   display: 'block'
                                                }}
                                             />
                                             {product.product_name}
                                          </Box>
                                       </TableCell>
                                       <TableCell align="center">{product.quantity}</TableCell>
                                       <TableCell align="right">{product.price.toLocaleString('vi-VN')}đ</TableCell>
                                       <TableCell align="right">
                                          {(product.quantity * product.price).toLocaleString('vi-VN')}đ
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </TableContainer>
                     </Box>
                  )}
               </Box>
            </Box>
         </Modal>

         {/* Modal gia hạn thời gian */}
         <Dialog open={!!extendRoomId} onClose={handleCloseExtendModal}>
            <DialogTitle>Gia hạn thời gian</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Chọn số giờ muốn gia hạn thêm:
               </DialogContentText>
               <TextField
                  type="number"
                  value={additionalHours}
                  onChange={(e) => setAdditionalHours(Number(e.target.value))}
                  inputProps={{ min: 1, max: 24 }}
                  fullWidth
                  margin="dense"
                  disabled={extendTimeMutation.isPending}
               />
            </DialogContent>
            <DialogActions>
               <Button onClick={handleCloseExtendModal} disabled={extendTimeMutation.isPending}>
                  Hủy
               </Button>
               <Button 
                  onClick={handleConfirmExtend}
                  variant="contained"
                  disabled={extendTimeMutation.isPending}
               >
                  {extendTimeMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
};

export default HistoryCart;
