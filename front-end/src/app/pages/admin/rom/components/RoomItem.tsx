/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Button, Chip, Drawer, Stack, Typography } from '@mui/material';
import { useState, type Dispatch, type SetStateAction } from 'react';
import CreateIcon from '@mui/icons-material/Create';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

import RoomDetail from './RoomDetail';

import { LazyLoadingImage } from '@components';
import noImage from '@assets/images/no-image.png';

const RoomItem = ({
   room,
   setRoomId,
   setOpen,
}: {
   room: RoomItem;
   setRoomId: Dispatch<SetStateAction<number | undefined>>;
   setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
   const [openDrawer, setOpenDrawer] = useState(false);

   const toggleDrawer = (newOpen: boolean) => () => {
      setOpenDrawer(newOpen);
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
               position: 'relative',

               '&:hover': {
                  ' .update-room-item': {
                     display: 'flex',
                  },
               },
            }}
         >
            <Box sx={{ width: '100%', height: '150.250px' }}>
               <Box
                  component={LazyLoadingImage}
                  width="100%"
                  height="100%"
                  className="lazyload loaded"
                  src={room.image_url ?? noImage}
                  data-src={room.image_url}
                  alt={room.room_name}
                  data-was-processed="true"
                  sx={{
                     '& :hover': {
                        transform: 'scale(1.1)',
                     },
                  }}
                  style={{
                     borderRadius: '10px 10px 0px 0px',
                     width: '100%',
                     height: '150.250px',
                  }}
               />
            </Box>
            <Box
               className="update-room-item"
               sx={{ display: 'none', gap: 2, position: 'absolute', top: '8px', right: '8px' }}
            >
               <Button
                  color="warning"
                  onClick={() => {
                     setRoomId(room.id);
                     setOpen(true);
                  }}
               >
                  <CreateIcon />
               </Button>
               <Button onClick={() => setOpenDrawer(true)}>
                  <RemoveRedEyeIcon />
               </Button>
            </Box>
            <Box mt={1} px={2}>
               <Typography variant="h6">{room.room_name}</Typography>

               <Stack flexDirection="row" alignItems="center" justifyContent="space-between" gap={3}>
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between" gap={3}>
                     <Typography variant="h6" fontSize="16px">
                        Giá:
                     </Typography>
                     <Typography variant="body1" fontWeight={600} color="error" fontSize="16px">
                        {room.price?.toLocaleString()}đ/1h
                     </Typography>
                  </Stack>
                  <Typography variant="h6" fontSize="16px">
                     <Chip label={room.status} color={room.status === 'INACTIVE' ? 'success' : 'error'} />
                  </Typography>
               </Stack>
            </Box>
         </Box>
         <Drawer anchor="right" open={openDrawer} onClose={toggleDrawer(false)}>
            <RoomDetail roomId={room.id} />
         </Drawer>
      </>
   );
};

export default RoomItem;
