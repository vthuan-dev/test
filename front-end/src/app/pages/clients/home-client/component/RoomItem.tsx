/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';

import { apiAddOrderRoom } from '../service';

import { LazyLoadingImage } from '@components';
import noImage from '@assets/images/no-image.png';
import useAuth from '~/app/redux/slices/auth.slice';

const RoomItem = ({ room }: { room: RoomItem }) => {
   const { user, isAuhthentication } = useAuth();

   const { mutate } = apiAddOrderRoom();

   const addRoomToCard = () => {
      if (!isAuhthentication) return toast.error('Vui lòng đăn nhập');
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
               borderRadius: '5px',
               display: 'block',
               backgroundColor: '#f4f6fa',
               paddingBottom: 1,
               overflow: 'hidden',
            }}
         >
            <Box
               sx={{
                  width: '100%',
                  height: '150.250px',
                  mx: 'auto',
                  position: 'relative',
                  ':hover': {
                     '.add-to-card': {
                        display: 'flex',
                     },
                  },
               }}
            >
               <LazyLoadingImage
                  width="100%"
                  height="100%"
                  className="lazyload loaded"
                  src={room.image_url ?? noImage}
                  data-src={room.image_url}
                  alt={room.room_name}
                  data-was-processed="true"
                  style={{
                     borderRadius: '10px 10px 0px 0px',
                     width: '100%',
                     height: '150.250px',
                  }}
               />
               <Stack
                  className="add-to-card"
                  sx={{
                     display: 'none',
                     position: 'absolute',
                     top: '50%',
                     left: 0,
                     right: 0,
                     flexDirection: 'row',
                     alignItems: 'center',
                     justifyContent: 'center',
                     transform: 'translateY(-50%)',
                     px: 2,
                  }}
               >
                  {/* <Button>Đặt ngay</Button> */}
                  <Button color="warning" onClick={addRoomToCard}>
                     Đặt Phòng
                  </Button>
               </Stack>
            </Box>
            <Box mt={2} px={1} pb={1}>
               <Typography variant="h6">{room.room_name}</Typography>
               <Box display="flex" gap={4}>
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between" gap={3}>
                     <Typography variant="h6" fontSize="16px">
                        Giá:
                     </Typography>
                     <Typography variant="body1" fontWeight={600} color="error" fontSize="16px">
                        {room?.price?.toLocaleString() ?? '10.000'}đ/1h
                     </Typography>
                  </Stack>
                  <Stack flex={1} flexDirection="row" alignItems="center" justifyContent="space-between" my={1}>
                     <Typography variant="h5" fontSize="16px" fontWeight={700}>
                        Số máy:
                     </Typography>
                     <Typography variant="h6" fontSize="14px">
                        <Chip size="small" label={room.capacity} />
                     </Typography>
                  </Stack>
               </Box>
               {/* <Stack flex={2} flexDirection="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" fontSize="16px" fontWeight={700}>
                     Trạng thái:
                  </Typography>
                  <Typography variant="h6" fontSize="14px">
                     <Chip label={room.status} color={room.status === 'Trống' ? 'success' : 'error'} />
                  </Typography>
               </Stack> */}
            </Box>
         </Box>
      </>
   );
};

export default RoomItem;
