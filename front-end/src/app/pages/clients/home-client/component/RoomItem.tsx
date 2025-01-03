/* eslint-disable @typescript-eslint/naming-convention */
import { useState } from 'react';
import { Box, Button, Chip, Stack, Typography, Dialog, DialogTitle, DialogContent, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import InfoIcon from '@mui/icons-material/Info';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ComputerIcon from '@mui/icons-material/Computer';

import { apiAddOrderRoom, getRoomDetail } from '../service';
import { LazyLoadingImage } from '@components';
import noImage from '@assets/images/no-image.png';
import useAuth from '~/app/redux/slices/auth.slice';

const RoomItem = ({ room }: { room: RoomItem }) => {
   const { user, isAuhthentication } = useAuth();
   const [open, setOpen] = useState(false);

   const { data: roomDetail, isLoading } = useQuery({
      queryKey: ['room-detail', room.id],
      queryFn: () => getRoomDetail(room.id),
      enabled: open,
   });

   console.log('Room Detail:', roomDetail);

   const { mutate } = apiAddOrderRoom();

   const addRoomToCard = () => {
      if (!isAuhthentication) return toast.error('Vui lòng đăng nhập');
      mutate({
         user_id: user?.id,
         room_id: room.id,
         type: 1,
      });
   };

   return (
      <>
         <Box
            sx={{
               border: '1px solid #f4f6fa',
               borderRadius: '12px',
               backgroundColor: '#ffffff',
               overflow: 'hidden',
               transition: 'all 0.3s ease',
               '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  '.action-buttons': {
                     opacity: 1,
                     transform: 'translateY(0)',
                  }
               }
            }}
         >
            <Box sx={{ position: 'relative' }}>
               <LazyLoadingImage
                  src={room.image_url || noImage}
                  alt={room.room_name}
                  style={{
                     width: '100%',
                     height: '200px',
                     objectFit: 'cover',
                  }}
               />
               <Box
                  className="action-buttons"
                  sx={{
                     position: 'absolute',
                     bottom: 0,
                     left: 0,
                     right: 0,
                     p: 2,
                     display: 'flex',
                     gap: 1,
                     background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                     opacity: 0,
                     transform: 'translateY(10px)',
                     transition: 'all 0.3s ease',
                  }}
               >
                  <Button
                     variant="contained"
                     startIcon={<InfoIcon />}
                     onClick={() => setOpen(true)}
                     fullWidth
                  >
                     Chi tiết
                  </Button>
                  <Button
                     variant="contained"
                     color="primary"
                     startIcon={<ShoppingCartIcon />}
                     onClick={addRoomToCard}
                     fullWidth
                  >
                     Đặt phòng
                  </Button>
               </Box>
            </Box>

            <Box p={2}>
               <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {room.room_name}
               </Typography>
               <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                     <Typography color="text.secondary" fontSize="0.875rem">
                        Giá thuê
                     </Typography>
                     <Typography color="error" fontWeight="600">
                        {room.price?.toLocaleString()}đ/giờ
                     </Typography>
                  </Box>
                  <Box textAlign="right">
                     <Typography color="text.secondary" fontSize="0.875rem">
                        Số máy
                     </Typography>
                     <Chip 
                        size="small" 
                        label={room.capacity} 
                        color="primary"
                        sx={{ fontWeight: 500 }}
                     />
                  </Box>
               </Stack>
            </Box>
         </Box>

         <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
               sx: {
                  background: '#0a1929',
                  backgroundImage: 'linear-gradient(rgba(10, 25, 41, 0.8), rgba(10, 25, 41, 0.8)), url("/cyber-bg.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid rgba(0, 255, 255, 0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.15)',
                  color: '#fff',
               }
            }}
         >
            <DialogTitle 
               sx={{ 
                  p: 3,
                  background: 'linear-gradient(90deg, rgba(0,212,255,0.1) 0%, rgba(0,212,255,0.2) 100%)',
                  borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  '& .MuiTypography-root': {
                     background: 'linear-gradient(90deg, #00d4ff 0%, #00f7ff 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                  }
               }}
            >
               <ComputerIcon sx={{ color: '#00d4ff', fontSize: 28 }} />
               <Typography variant="h5" fontWeight="bold">
                  {room.room_name}
               </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
               {isLoading ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                     <Typography sx={{ color: '#00d4ff' }}>Đang tải thông tin...</Typography>
                  </Box>
               ) : (
                  <Grid container spacing={3}>
                     <Grid item xs={12}>
                        <Box
                           sx={{
                              background: 'rgba(0, 212, 255, 0.05)',
                              borderRadius: '12px',
                              p: 3,
                              border: '1px solid rgba(0, 255, 255, 0.1)',
                           }}
                        >
                           <Typography 
                              variant="h6" 
                              gutterBottom
                              sx={{
                                 color: '#00d4ff',
                                 fontWeight: 'bold',
                                 mb: 2
                              }}
                           >
                              Thông tin phòng
                           </Typography>
                           <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                 <Box sx={{ mb: 2 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                                       Tổng số máy
                                    </Typography>
                                    <Typography 
                                       variant="h4" 
                                       sx={{ 
                                          color: '#00d4ff',
                                          fontWeight: 'bold',
                                          textShadow: '0 0 10px rgba(0,212,255,0.5)'
                                       }}
                                    >
                                       {roomDetail?.data?.total_desktops || 0}
                                       <Typography component="span" sx={{ fontSize: '1rem', ml: 1, color: 'rgba(255,255,255,0.7)' }}>
                                          máy
                                       </Typography>
                                    </Typography>
                                 </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                 <Box>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                                       Giá thuê
                                    </Typography>
                                    <Typography 
                                       variant="h4" 
                                       sx={{ 
                                          color: '#00ffaa',
                                          fontWeight: 'bold',
                                          textShadow: '0 0 10px rgba(0,255,170,0.5)'
                                       }}
                                    >
                                       {roomDetail?.data?.price?.toLocaleString()}
                                       <Typography component="span" sx={{ fontSize: '1rem', ml: 1, color: 'rgba(255,255,255,0.7)' }}>
                                          đ/giờ
                                       </Typography>
                                    </Typography>
                                 </Box>
                              </Grid>
                           </Grid>
                        </Box>
                     </Grid>

                     <Grid item xs={12}>
                        <Typography 
                           variant="h6" 
                           sx={{ 
                              mb: 3,
                              color: '#00d4ff',
                              fontWeight: 'bold'
                           }}
                        >
                           Danh sách máy tính
                        </Typography>
                        <Grid container spacing={2}>
                           {roomDetail?.data?.desktops?.map((desktop: any) => (
                              <Grid item xs={12} sm={6} md={4} key={desktop.desktop_id}>
                                 <Box
                                    sx={{
                                       p: 2.5,
                                       background: 'rgba(0, 212, 255, 0.05)',
                                       border: '1px solid rgba(0, 255, 255, 0.1)',
                                       borderRadius: '12px',
                                       height: '100%',
                                       transition: 'all 0.3s ease',
                                       '&:hover': {
                                          transform: 'translateY(-4px)',
                                          boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
                                          border: '1px solid rgba(0, 255, 255, 0.3)',
                                       }
                                    }}
                                 >
                                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                       <ComputerIcon sx={{ color: '#00d4ff', fontSize: 24 }} />
                                       <Typography 
                                          fontWeight="600"
                                          sx={{ 
                                             color: '#fff',
                                             fontSize: '1.1rem'
                                          }}
                                       >
                                          {desktop.desktop_name}
                                       </Typography>
                                    </Box>
                                    <Stack spacing={1.5}>
                                       {Array.isArray(desktop.specifications) ? (
                                          desktop.specifications?.map((spec: any, index: number) => (
                                             <Typography 
                                                key={index} 
                                                sx={{ 
                                                   color: 'rgba(255,255,255,0.7)',
                                                   display: 'flex',
                                                   alignItems: 'center',
                                                   gap: 1,
                                                   fontSize: '0.9rem',
                                                   '&:before': {
                                                      content: '"•"',
                                                      color: '#00d4ff',
                                                      fontSize: '1.2rem'
                                                   }
                                                }}
                                             >
                                                {typeof spec === 'object' && spec !== null
                                                   ? `${spec.label}: ${spec.value}`
                                                   : spec
                                                }
                                             </Typography>
                                          ))
                                       ) : null}
                                    </Stack>
                                 </Box>
                              </Grid>
                           ))}
                        </Grid>
                     </Grid>
                  </Grid>
               )}
            </DialogContent>
         </Dialog>
      </>
   );
};

export default RoomItem;
