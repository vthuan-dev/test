/* eslint-disable @typescript-eslint/naming-convention */

import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, CardMedia } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface RoomCartProps {
   rooms: CartRoom[];
   onQuantityChange: (id: number, newQuantity: number) => void;
   onDeleteRoom: (id: number) => void;
}

const RoomCart: React.FC<RoomCartProps> = ({ rooms, onDeleteRoom }) => {
   return (
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" marginBottom={4}>
         <Typography
            variant="h5"
            gutterBottom
            align="left"
            sx={{ fontWeight: 'bold', color: '#1976d2', width: '100%' }}
         >
            Phòng
         </Typography>
         {rooms.map((room) => (
            <Card
               key={room.id}
               sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  margin: 1,
                  width: 'calc(33% - 16px)', // Tính toán width cho 3 cột
                  boxShadow: 4,
                  borderRadius: 2,
                  '&:hover': {
                     transform: 'scale(1.05)',
                     boxShadow: 6,
                  },
                  transition: 'all 0.3s ease',
                  '& .css-1gfgm3n-MuiCardContent-root:last-child': {
                     py: '0px !important',
                  },
               }}
            >
               <CardMedia
                  component="img"
                  height="100"
                  image={room.image_url}
                  alt={room.room_name}
                  sx={{ objectFit: 'cover', p: 1, width: 120, borderRadius: '4px 0 0 4px' }} // Chỉnh kích thước và border radius
               />
               <CardContent
                  sx={{
                     flex: 1,
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'space-between',
                     py: '0px !important',
                  }}
               >
                  <Typography variant="h6" gutterBottom sx={{ color: '#424242' }}>
                     {room.room_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                     {room.price.toLocaleString()} VND / 1 giờ
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff5722' }}>
                        {room.price.toLocaleString()} VND
                     </Typography>
                     <IconButton onClick={() => onDeleteRoom(room.id)} color="error">
                        <DeleteIcon />
                     </IconButton>
                  </Box>
               </CardContent>
            </Card>
         ))}
      </Box>
   );
};

export default RoomCart;
