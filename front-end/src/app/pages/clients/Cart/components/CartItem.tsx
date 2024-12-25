import { Box, IconButton, Typography, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { deleteCart } from '../service';

const CartItem = ({
   cartProduct,
   handleProductQuantityChange,
}: {
   cartProduct: CartProduct;
   handleDeleteProduct: (id: number) => void;
   handleProductQuantityChange: (id: number, newQuantity: number) => void;
}) => {
   const { mutate: deleteCartItem } = deleteCart();
   return (
      <Box display="flex" alignItems="center" mb={2}>
         <img src={cartProduct.image_url} alt={cartProduct.product_name} width={80} height={80} />
         <Box flexGrow={1} ml={2}>
            <Typography variant="h6">{cartProduct.product_name}</Typography>
            <Typography variant="body1" color="textSecondary">
               Price: {Number(cartProduct.price).toLocaleString()}đ
            </Typography>
         </Box>

         <TextField
            type="number"
            value={cartProduct.quantity}
            onChange={(e) => handleProductQuantityChange(cartProduct.id, Number(e.target.value))}
            inputProps={{ min: 1, style: { width: 60, textAlign: 'center' } }}
         />

         <IconButton onClick={() => deleteCartItem(cartProduct.cart_id as unknown as string)} color="error">
            <DeleteIcon />
         </IconButton>
      </Box>
   );
};

export default CartItem;
