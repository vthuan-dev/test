/* eslint-disable @typescript-eslint/naming-convention */
import './product-item.css';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { toast } from 'react-toastify';

import { LazyLoadingImage } from '@components';
import useAuth from '~/app/redux/slices/auth.slice';
import { apiAddOrderRoom } from '@pages/clients/home-client/service';

const ProductItem = ({ product }: { product: Product }) => {
   const { user, isAuhthentication } = useAuth();

   const { mutate } = apiAddOrderRoom();

   const addRoomToCard = () => {
      if (!isAuhthentication) return toast.error('Vui lòng đăn nhập');
      mutate({
         user_id: user?.id,
         product_id: product.id,
         type: 0,
         quantity: 1,
      });
   };

   return (
      <React.Fragment>
         <Box
            className="item-cate"
            sx={{
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
            <Box className="icon_cate">
               <LazyLoadingImage
                  width="100"
                  height="100"
                  className="lazyload loaded"
                  src={product.image_url}
                  data-src={product.image_url}
                  alt={product.product_name}
                  data-was-processed="true"
               />
            </Box>
            <Typography component="h3" px={1} mt={1}>
               {product.product_name}
            </Typography>

            <Typography component="p" sx={{ fontSize: '16px', fontWeight: 600, mt: 1 }} color="error">
               {Number(product.price).toLocaleString()}đ
            </Typography>

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
                  onClick={addRoomToCard}
               >
                  <ShoppingCartIcon sx={{ width: 24, height: 24 }} />
               </Button>
            </Box>
         </Box>
      </React.Fragment>
   );
};

export default ProductItem;
