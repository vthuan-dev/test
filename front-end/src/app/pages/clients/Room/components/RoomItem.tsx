/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { LazyLoadingImage } from '@components';
import noImage from '@assets/images/no-image.png';

const RoomItem = ({ room }: { room: RoomItem }) => {
   return (
      <>
         <Box
            sx={{
               // overflow: 'hidden',
               position: 'absolute',
               '&:hover': {
                  '&>.product-item_action': {
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'end',
                     overflow: 'hidden',
                     right: 0,
                  },
               },
            }}
         >
            <Box sx={{ width: '263.250px', height: '263.250px' }}>
               <LazyLoadingImage
                  width="100%"
                  height="100%"
                  className="lazyload loaded"
                  src={room.image_url ?? noImage}
                  data-src={room.image_url}
                  alt={room.room_name}
                  data-was-processed="true"
                  style={{
                     borderRadius: '10px',
                     width: '263.250px',
                     height: '263.250px',
                  }}
               />
            </Box>
            <Box mt={2}>
               <Typography variant="h6">{room.room_name}</Typography>
               <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontSize="16px">
                     Trạng thái:
                  </Typography>
                  <Typography variant="h6" fontSize="16px">
                     <Chip label={room.status ? 'Còn phòng' : 'Hết phòng'} color={room.status ? 'success' : 'error'} />
                  </Typography>
               </Stack>
            </Box>

            <Box
               className="product-item_action"
               sx={{
                  position: 'absolute',
                  top: 0,
                  right: '-100%',
                  left: 0,
                  display: 'none',
                  padding: 0.5,
                  gap: 1,
               }}
            >
               <Button
                  variant="outlined"
                  sx={{
                     minWidth: 0,
                     padding: '4px',
                     backgroundColor: '#FFFFFF',
                     borderColor: '#FFFFFF',
                     color: 'text.primary',
                     '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                     },
                  }}
               >
                  <ShoppingCartIcon sx={{ width: 24, height: 24 }} />
               </Button>
            </Box>
         </Box>
      </>
   );
};

export default RoomItem;
