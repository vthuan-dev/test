/* eslint-disable @typescript-eslint/naming-convention */
import './product-item.css';
import { Box, Button, Stack, Typography } from '@mui/material';
import React from 'react';
import EditIcon from '@mui/icons-material/Edit';

import { LazyLoadingImage } from '@components';

const ProductItem = ({ product, handleOpen }: { product: Product; handleOpen: (productId: number) => void }) => {
   // const [open, setOpen] = useState(false);

   // const [openDialog, setOpenDialog] = React.useState(false);

   // const { mutate: mutateProduct } = apiProductDetail(product.id);

   // const handleClickOpenDialog = () => {
   //    setOpenDialog(true);
   // };

   // const handleCloseDialog = () => {
   //    setOpenDialog(false);
   // };

   // const toggleDrawer = () => {
   //    setOpen((prev) => !prev);
   //    // mutateProduct();
   // };

   return (
      <React.Fragment>
         <Box
            className="item-cate"
            sx={{
               // overflow: 'hidden',
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
            <Stack gap={2} p={2} pt={1}>
               <Typography component="h3">{product.product_name}</Typography>
               <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography component="p" sx={{ fontSize: '16px' }}>
                     Giá:
                  </Typography>
                  <Typography component="p" sx={{ fontSize: '16px', fontWeight: 600 }} color="error">
                     {Number(product.price)?.toLocaleString()}đ
                  </Typography>
               </Box>
            </Stack>

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
               {/* <Button
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
                  onClick={toggleDrawer}
               >
                  <VisibilityOutlinedIcon sx={{ width: 24, height: 24 }} />
               </Button> */}
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
                  onClick={() => handleOpen(product.id)}
               >
                  <EditIcon sx={{ width: 24, height: 24 }} />
               </Button>
            </Box>
         </Box>

         {/* <Drawer anchor="right" open={open}>
            <Box
               sx={{
                  padding: 3,
                  width: 600,
                  height: '100vh',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: 'column',
               }}
            >
               <Box>
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                     <Typography component="h3" variant="h6">
                        Chi tiết sản phẩm
                     </Typography>

                     <Button variant="text" sx={{ minWidth: 'auto', color: 'text.primary' }} onClick={toggleDrawer}>
                        <CloseIcon />
                     </Button>
                  </Stack>
                  <Box mt={2}>
                     <Grid container spacing={2}>
                        {PRODUCT_ITEM.map((item) => {
                           return (
                              <React.Fragment key={item.key}>
                                 <Grid item xs={4}>
                                    <Typography fontWeight={700}>{item.title}</Typography>
                                 </Grid>
                                 <Grid item xs={8}>
                                    <Typography component="p">Sản phẩm 1</Typography>
                                 </Grid>
                              </React.Fragment>
                           );
                        })}
                     </Grid>
                  </Box>
               </Box>
               <Stack flexDirection="row" justifyContent="end">
                  <Box width="auto">
                     <Button variant="outlined" color="error" onClick={handleClickOpenDialog}>
                        <DeleteIcon />
                     </Button>
                     <Dialog
                        open={openDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                     >
                        <DialogTitle id="alert-dialog-title">Dừng bán sản phẩm</DialogTitle>
                        <DialogContent>
                           <DialogContentText id="alert-dialog-description">
                              <span>Bạn có chắc muốn dừng việc cung cấp sản phẩm này?</span> <br />
                              <span>Việc dừng cung cấp sản phẩm sẽ ảnh hưởng đến doanh thu của bạn.</span> <br />
                              <span>
                                 Sản phẩm sẽ không được cung cấp cho người dùng cho đến khi bạn hủy bỏ việc dừng bán.
                              </span>
                           </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                           <Button onClick={handleCloseDialog} variant="outlined" color="error" autoFocus>
                              Hủy
                           </Button>
                           <Button onClick={handleCloseDialog} variant="outlined">
                              Xác nhận
                           </Button>
                        </DialogActions>
                     </Dialog>
                  </Box>
               </Stack>
            </Box>
         </Drawer> */}
      </React.Fragment>
   );
};

export default ProductItem;
