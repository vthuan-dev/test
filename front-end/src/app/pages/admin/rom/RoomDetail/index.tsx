/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Box, Grid, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ComputerIcon from '@mui/icons-material/Computer';

import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { ROUTE_PATH } from '@constants';
import { getRequest, deleteRequest } from '~/app/configs';
import { toast } from 'react-toastify';
import { useState, useMemo } from 'react';

const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
   {
      title: 'Danh sách phòng',
      link: ROUTE_PATH.ADMIN_ROM,
   },
];

// Component hiển thị thông tin chi tiết máy tính
const DesktopDetail = ({ desktop, isRoomActive }: { desktop: any, isRoomActive: boolean }) => {
   const [open, setOpen] = useState(false);

   const handleOpen = () => setOpen(true);
   const handleClose = () => setOpen(false);

   const isActive = isRoomActive || desktop.status === 'ACTIVE';

   // Tạo mảng cấu hình từ description text
   const specifications = useMemo(() => {
      if (!desktop.description) return [];

      // Phân tích chuỗi description thành các phần
      const parts = desktop.description.split(',').map(part => part.trim());
      
      return [
         { label: 'CPU', value: parts[0] || 'Chưa có thông tin' },
         { label: 'RAM', value: parts[1] || 'Chưa có thông tin' },
         { label: 'Card đồ họa', value: parts[2] || 'Chưa có thông tin' },
         { label: 'Màn hình', value: parts[3] || 'Chưa có thông tin' }
      ];
   }, [desktop.description]);

   return (
      <>
         <Box 
            onClick={handleOpen}
            sx={{
               border: '1px solid #ddd',
               borderRadius: '8px',
               p: 2,
               cursor: 'pointer',
               transition: 'all 0.3s',
               backgroundColor: isActive ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
               '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)'
               }
            }}
         >
            <Box display="flex" alignItems="center" gap={1}>
               <ComputerIcon color={isActive ? 'success' : 'error'} />
               <Typography variant="h6">{desktop.desktop_name}</Typography>
            </Box>
            <Typography color={isActive ? 'success.main' : 'error.main'}>
               {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
               Giá: {desktop.price?.toLocaleString('vi-VN')}đ/giờ
            </Typography>
         </Box>

         <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
               Chi tiết máy {desktop.desktop_name}
            </DialogTitle>
            <DialogContent>
               <Box p={2}>
                  <Typography><strong>Trạng thái:</strong> {isActive ? 'Đang hoạt động' : 'Không hoạt động'}</Typography>
                  <Typography><strong>Giá:</strong> {desktop.price?.toLocaleString('vi-VN')}đ/giờ</Typography>
                  
                  <Box mt={2}>
                     <Typography variant="h6" gutterBottom>Cấu hình máy:</Typography>
                     {specifications.map((spec, index) => (
                        <Box key={index} display="flex" gap={2} mt={1}>
                           <Typography flex={1} fontWeight="bold">{spec.label}:</Typography>
                           <Typography flex={2}>{spec.value}</Typography>
                        </Box>
                     ))}
                  </Box>
               </Box>
            </DialogContent>
         </Dialog>
      </>
   );
};

const RoomDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();

   // Thêm query để kiểm tra trạng thái phòng
   const { data: roomStatus } = useQuery({
      queryKey: ['roomStatus', id],
      queryFn: () => getRequest(`/room/check-in-use/${id}`),
   });

   const { data: roomDetail } = useQuery({
      queryKey: ['roomDetail', id],
      queryFn: () => getRequest(`/room/searchById/${id}`),
   });

   const description = useMemo(() => {
      try {
         return roomDetail?.data.room_description ? 
            JSON.parse(roomDetail.data.room_description) : [];
      } catch (error) {
         console.error('Error parsing room description:', error);
         return [];
      }
   }, [roomDetail?.data.room_description]);

   const isRoomActive = roomStatus?.data?.isInUse || false;

   const handleDeleteRoom = async () => {
      try {
         if (isRoomActive) {
            toast.warning('Không thể xóa phòng này vì đang có người đặt!');
            return;
         }

         if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
            return;
         }

         await deleteRequest(`/room/${id}`);
         toast.success('Xóa phòng thành công');
         navigate(ROUTE_PATH.ADMIN_ROM);
         
      } catch (error: any) {
         console.error('Delete room error:', error);
         const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng';
         toast.error(errorMessage);
      }
   };

   return (
      <BaseBreadcrumbs arialabel={`Chi tiết phòng ${roomDetail?.data.room_name}`} breadcrumbs={breadcrumbs}>
         <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
               variant="contained"
               color="error"
               startIcon={<DeleteIcon />}
               onClick={handleDeleteRoom}
            >
               Xóa phòng
            </Button>
         </Box>
         <Grid container spacing={3}>
            <Grid item xs={6}>
               <Box
                  component="img"
                  src={roomDetail?.data.image_url}
                  sx={{
                     height: 250,
                     width: '100%',
                     objectFit: 'cover',
                     borderRadius: '20px',
                  }}
               />
            </Grid>
            <Grid item xs={6}>
               <Box>
                  {description.map((item: any, index: number) => (
                     <Box key={index} display="flex" alignItems="flex-start" gap={2}>
                        <Typography flex={1} textTransform="capitalize" fontWeight={700}>
                           {item.label}:
                        </Typography>
                        <Typography flex={3}>{item.value}</Typography>
                     </Box>
                  ))}
               </Box>
            </Grid>
         </Grid>
         
         <Box mt={4}>
            <Typography variant="h5" color="primary" gutterBottom>
               Danh sách máy ({roomDetail?.data.desktops?.length || 0} máy)
            </Typography>
            <Grid container spacing={2}>
               {roomDetail?.data.desktops?.map((desktop: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} key={desktop.desktop_id || index}>
                     <DesktopDetail 
                        desktop={desktop} 
                        isRoomActive={isRoomActive}
                     />
                  </Grid>
               ))}
            </Grid>
         </Box>
      </BaseBreadcrumbs>
   );
};

export default RoomDetail;
