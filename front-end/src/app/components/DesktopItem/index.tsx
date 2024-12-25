/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Modal, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { images } from '@assets/images';
import { LazyLoadingImage } from '@components/design-systems';

const style = {
   position: 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   width: 400,
   bgcolor: 'background.paper',
   boxShadow: 24,
   borderRadius: 3,
   p: 4,
};

const DesktopItem = ({ rooms, desktop }: { rooms: Array<RoomItem>; desktop: Desktop }) => {
   const [open, setOpen] = useState(false);
   const handleOpen = () => setOpen(true);
   const handleClose = () => setOpen(false);

   return (
      <>
         <Stack
            justifyContent="center"
            alignContent="center"
            flexWrap="wrap"
            position="relative"
            sx={{
               backgroundColor: '#f4f6fa',
               border: '1px solid #f4f6fa',
               borderRadius: '12px',
               cursor: 'pointer',
               ':hover': {
                  '& .add_card_action': {
                     display: 'flex',
                  },
               },
            }}
            onClick={handleOpen}
         >
            <Box sx={{ width: '75%', mx: 'auto' }}>
               <LazyLoadingImage width="100%" height="100%" src={images.monitor} alt="" />
            </Box>
            <Stack width="100%" px={2} pb={2}>
               <Typography fontWeight={600} textAlign="center">
                  {desktop.desktop_name}
               </Typography>
               <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography flex={1}>Phòng:</Typography>
                  <Typography flex={2} fontWeight={600}>
                     {rooms.find((room) => room.id === desktop.room_id)?.room_name}
                  </Typography>
               </Box>
               <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography flex={1}>Giá:</Typography>
                  <Typography flex={2} color="error" fontWeight={600}>
                     {desktop.price?.toLocaleString() ?? '10.000'}đ
                  </Typography>
               </Box>
            </Stack>
            {/* <Stack
               className="add_card_action"
               display="none"
               flexDirection="row"
               gap="12px"
               mt={1}
               justifyContent="center"
               position="absolute"
               left={0}
               right={0}
            >
               <Button variant="contained" size="small" color="secondary" onClick={() => {}}>
                  Thêm vào giỏ hàng
               </Button>
               <Button variant="contained" size="small">
                  Đặt ngay
               </Button>
            </Stack> */}
         </Stack>
         <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
         >
            <Box sx={style}>
               <Typography id="modal-modal-title" variant="h6" component="h2">
                  Text in a modal
               </Typography>
               <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                  Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
               </Typography>
            </Box>
         </Modal>
      </>
   );
};

export default DesktopItem;
