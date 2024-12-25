/* eslint-disable @typescript-eslint/naming-convention */

import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, TextField, CardMedia } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProductCartProps {
   products: CartProduct[];
   onQuantityChange: (id: number, newQuantity: number) => void;
   onDeleteProduct: (id: number) => void;
}

const ProductCart: React.FC<ProductCartProps> = ({ products, onQuantityChange, onDeleteProduct }) => {
   return (
      <Box display="flex" flexDirection="column" marginBottom={4}>
         <Typography
            variant="h5"
            gutterBottom
            align="left"
            sx={{ fontWeight: 'bold', color: '#1976d2', marginBottom: 2 }}
         >
            Sản Phẩm
         </Typography>
         <Box display="flex" flexWrap="wrap">
            {products.map((product) => (
               <Card
                  key={product.id}
                  sx={{
                     display: 'flex',
                     flexDirection: 'row',
                     alignItems: 'center',
                     margin: 1,
                     width: 'calc(33% - 16px)', // Tính toán width cho 3 cột
                     boxShadow: 4,
                     borderRadius: 2,
                     transition: 'all 0.3s ease',
                     '&:hover': {
                        boxShadow: 8,
                        transform: 'translateY(-5px)',
                        backgroundColor: '#f5f5f5', // Đổi màu nền khi hover
                     },
                     '& .css-1gfgm3n-MuiCardContent-root:last-child': {
                        py: '0px !important',
                     },
                  }}
               >
                  <CardMedia
                     component="img"
                     height="100"
                     image={product.image_url}
                     alt={product.product_name}
                     sx={{ objectFit: 'cover', width: 120, borderRadius: '4px 0 0 4px' }} // Chỉnh kích thước và border radius
                  />
                  <CardContent sx={{ flex: 1, py: '8px !important' }}>
                     <Typography variant="h6" gutterBottom sx={{ color: '#424242', fontWeight: 'bold' }}>
                        {product.product_name}
                     </Typography>
                     <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff5722' }}>
                        {(Number(product.price) * product.quantity).toLocaleString()} VND
                     </Typography>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
                        <TextField
                           label="Số lượng"
                           type="number"
                           value={product.quantity ?? 1}
                           onChange={(e) => onQuantityChange(product.id, Number(e.target.value))}
                           inputProps={{ min: 1 }}
                           defaultValue={1}
                           size="small"
                           sx={{ width: '80px', marginRight: 2 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ff5722' }}>
                           {(Number(product.price) * product.quantity).toLocaleString()} VND
                        </Typography>
                        <IconButton onClick={() => onDeleteProduct(product.id)} color="error">
                           <DeleteIcon />
                        </IconButton>
                     </Box>
                  </CardContent>
               </Card>
            ))}
         </Box>
      </Box>
   );
};

export default ProductCart;
