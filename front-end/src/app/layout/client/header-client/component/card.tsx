/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Popover, Typography } from '@mui/material';
import React, { useRef } from 'react';

import { ButtonExtend, Image } from '..';

function Card() {
   const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

   const ref = useRef(null);

   const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
   };

   const open = Boolean(anchorEl);

   const handleClose = () => {
      setAnchorEl(null);
   };

   return (
      <>
         <ButtonExtend
            aria-owns={open ? 'mouse-over-popover' : undefined}
            type="button"
            onClick={handlePopoverOpen}
            startIcon={
               <Image
                  sx={{ height: 24 }}
                  src="https://bizweb.dktcdn.net/100/514/629/themes/951567/assets/icon_poly_hea_4.png?1726824761175"
               />
            }
         >
            Giỏ Hàng
         </ButtonExtend>
         <Popover
            ref={ref}
            open={open}
            anchorEl={anchorEl}
            sx={{ zIndex: 1200 }}
            onClose={handleClose}
            anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'center',
            }}
            transformOrigin={{
               vertical: 'top',
               horizontal: 'center',
            }}
         >
            <Box sx={{ width: 400 }}>
               <Typography sx={{ p: 1 }}>I use Popover.</Typography>
            </Box>
         </Popover>
      </>
   );
}

export default Card;
