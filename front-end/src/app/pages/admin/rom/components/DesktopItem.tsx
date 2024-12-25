/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Drawer, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { images } from '@assets/images';
import { LazyLoadingImage } from '@components';

const DesktopItem = ({ index }: { index: number }) => {
   const [open, setOpen] = useState(false);

   const toggleDrawer = (newOpen: boolean) => () => {
      setOpen(newOpen);
   };

   return (
      <>
         <Stack
            justifyContent="center"
            alignContent="center"
            flexWrap="wrap"
            position="relative"
            onClick={toggleDrawer(true)}
         >
            <Box sx={{ width: '70%', mx: 'auto' }}>
               <LazyLoadingImage width="100%" height="100%" src={images.monitor} alt="" />
            </Box>
            <Box width="100%">
               <Typography fontWeight={600} textAlign="center">
                  Máy {index + 1}
               </Typography>
            </Box>
         </Stack>
         <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
            <Box width={400}>hello</Box>
         </Drawer>
      </>
   );
};

export default DesktopItem;
