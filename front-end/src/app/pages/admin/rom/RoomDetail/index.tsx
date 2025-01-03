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

   // Parse specifications
   const specifications = useMemo(() => {
      if (!desktop.description) return [];
      const parts = desktop.description.split(',').map(part => part.trim());
      return [
         { label: 'CPU', value: parts[0] || 'Chưa có thông tin', icon: '🔲' },
         { label: 'RAM', value: parts[1] || 'Chưa có thông tin', icon: '💾' },
         { label: 'Card đồ họa', value: parts[2] || 'Chưa có thông tin', icon: '🎮' },
         { label: 'Màn hình', value: parts[3] || 'Chưa có thông tin', icon: '🖥️' }
      ];
   }, [desktop.description]);

   return (
      <>
         <Box 
            onClick={handleOpen}
            sx={{
               border: '1px solid #e0e0e0',
               borderRadius: '16px',
               p: 3,
               cursor: 'pointer',
               transition: 'all 0.3s ease',
               background: '#ffffff',
               '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
               }
            }}
         >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
               <ComputerIcon 
                  sx={{ 
                     fontSize: 40,
                     color: '#1976d2'
                  }}
               />
               <Typography variant="h5" fontWeight="bold" color="#333">
                  {desktop.desktop_name}
               </Typography>
            </Box>
            <Typography 
               sx={{ 
                  color: '#666',
                  fontSize: '1.1rem',
                  fontWeight: 500
               }}
            >
               {desktop.price?.toLocaleString('vi-VN')}đ/giờ
            </Typography>
         </Box>

         <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
               sx: {
                  borderRadius: '20px',
                  background: '#ffffff',
                  color: '#333333',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
               }
            }}
         >
            <DialogTitle sx={{ 
               p: 3,
               display: 'flex',
               alignItems: 'center',
               gap: 2,
               borderBottom: '1px solid #f0f0f0',
               background: 'linear-gradient(to right, #f8f9fa, #ffffff)'
            }}>
               <ComputerIcon 
                  sx={{ 
                     fontSize: 40,
                     color: '#1976d2'
                  }}
               />
               <Typography variant="h4" fontWeight="bold" color="#333">
                  {desktop.desktop_name}
               </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 3, background: '#ffffff' }}>
               <Box 
                  sx={{
                     display: 'grid',
                     gap: 3,
                     gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
                  }}
               >
                  <Box 
                     sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: '1px solid #f0f0f0',
                        background: '#f8f9fa',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
                     }}
                  >
                     <Typography variant="h6" gutterBottom color="#333">
                        Thông tin cơ bản
                     </Typography>
                     <Box sx={{ display: 'grid', gap: 2 }}>
                        <Typography color="#555">
                           <strong>Mã máy:</strong> #{desktop.desktop_id}
                        </Typography>
                        <Typography color="#555">
                           <strong>Giá thuê:</strong> {desktop.price?.toLocaleString('vi-VN')}đ/giờ
                        </Typography>
                     </Box>
                  </Box>

                  <Box 
                     sx={{
                        p: 3,
                        borderRadius: '16px',
                        border: '1px solid #f0f0f0',
                        background: '#f8f9fa',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
                     }}
                  >
                     <Typography variant="h6" gutterBottom color="#333">
                        Cấu hình chi tiết
                     </Typography>
                     <Box sx={{ display: 'grid', gap: 2 }}>
                        {specifications.map((spec, index) => (
                           <Box 
                              key={index} 
                              sx={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: 2,
                                 p: 2,
                                 borderRadius: '12px',
                                 background: '#ffffff',
                                 border: '1px solid #f0f0f0'
                              }}
                           >
                              <Box 
                                 sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f5f5f5',
                                    fontSize: '1.2rem'
                                 }}
                              >
                                 {spec.icon}
                              </Box>
                              <Box>
                                 <Typography color="#666" fontSize="0.9rem">
                                    {spec.label}
                                 </Typography>
                                 <Typography fontWeight="500" color="#333">
                                    {spec.value}
                                 </Typography>
                              </Box>
                           </Box>
                        ))}
                     </Box>
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
