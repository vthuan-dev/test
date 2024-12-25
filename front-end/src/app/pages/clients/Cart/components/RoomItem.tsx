import { Box, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { deleteCart } from '../service';

const RoomItem = ({
   room,
   handleRoomQuantityChange,
}: {
   room: CartRoom;
   onDeleteRoom: (id: number) => void;
   handleRoomQuantityChange: (cart_id: number, newQuantity: number) => void;
}) => {
   const { mutate: deleteCartItem } = deleteCart();

   return (
      <Box display="flex" alignItems="center" mb={2}>
         <img src={room.image_url} alt={room.room_name} width={150} height={150} />
         <Box flexGrow={1} ml={2}>
            <Typography variant="h6">{room.room_name}</Typography>
            <Box display="flex" alignItems="center" gap={2}>
               <Typography variant="body1" color="textSecondary">
                  Giá: {Number(room.price).toLocaleString()}đ / 1h
               </Typography>
            </Box>
            <Typography variant="h6" color="textSecondary">
               {room.quantity}h * {Number(room.price)?.toLocaleString()}/1h ={' '}
               <Box component="span" sx={{ fontWeight: 'bold', color: '#ff5722' }}>
                  {(Number(room.quantity) * Number(room.price)).toLocaleString()}đ
               </Box>
               <Typography>Thời gian đã đặt: </Typography>
               {room?.time && room?.time.map((time:any) =><Typography variant='subtitle2'>{time}</Typography>)}
            </Typography>
         </Box>

         <TextField
            type="number"
            value={room.quantity}
            onChange={(e) => handleRoomQuantityChange(room.cart_id, Number(e.target.value))}
            inputProps={{ min: 1, style: { width: 60, textAlign: 'center' } }}
         />

         <IconButton onClick={() => deleteCartItem(room.cart_id as unknown as string)} color="error">
            <DeleteIcon />
         </IconButton>
      </Box>
   );
};

export default RoomItem;
