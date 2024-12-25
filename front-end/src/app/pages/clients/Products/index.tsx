/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Box, Grid, IconButton, InputAdornment, Pagination, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

import ProductItem from './components/ProductItem';

import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { apiGetCategories, apiGetListProduct } from '@pages/admin/products/service';
import { useSearchParamsHook } from '@hooks';
import { OutlinedInputExtend } from '@pages/admin';

const breadcrumbs = [
   {
      title: 'Trang chủ',
      link: '',
   },
];

const Products = () => {
   const { searchParams, setParams, deleteParams } = useSearchParamsHook();
   const { data: categories } = apiGetCategories();
   const [searchValue, setSearchValue] = useState<string>('');

   const { data: products } = apiGetListProduct(searchParams);

   const page = searchParams['page'] ?? 1;

   const handleChangePage = (_event: any, page: number) => {
      setParams('page', page);
   };

   useEffect(() => {
      setSearchValue(searchParams['product_name']);
   }, [searchParams['product_name']]);

   return (
      <BaseBreadcrumbs arialabel="Danh sách phòng" breadcrumbs={breadcrumbs}>
         <Grid container spacing={2}>
            <Grid item xs={3}>
               <Box sx={{ width: '100%' }}>
                  <OutlinedInputExtend
                     fullWidth
                     value={searchValue}
                     onChange={(e) => {
                        setSearchValue(e.target.value);
                     }}
                     endAdornment={
                        // Pass the JSX directly as ReactNode
                        <InputAdornment position="end">
                           <IconButton
                              aria-label="search"
                              onClick={() =>
                                 searchValue ? setParams('product_name', searchValue) : deleteParams('product_name')
                              }
                              edge="end"
                           >
                              <SearchIcon />
                           </IconButton>
                        </InputAdornment>
                     }
                     placeholder="Nhập tên sản phẩm"
                  />
               </Box>
               <Box mt={2} bgcolor="#f7f8f9">
                  <Typography
                     sx={{
                        fontSize: 18,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        bgcolor: '#008b4b',
                        px: 3,
                        py: 1,
                        color: 'white',
                        borderRadius: '8px 8px 0px 0px',
                     }}
                  >
                     Danh mục sản phẩm
                  </Typography>
                  <Stack py={0.5}>
                     <Box
                        component={Link}
                        to={`?${new URLSearchParams({ ...searchParams, category_id: '' }) as unknown as string}`}
                        sx={{
                           padding: '6px 12px',
                           fontSize: 16,
                           fontWeight: 500,
                           color: searchParams['category_id'] === '' ? '#008b4b' : '#282828',
                           textDecoration: searchParams['category_id'] === '' ? 'underline' : 'auto',
                        }}
                     >
                        Tất cả
                     </Box>
                     {categories?.data &&
                        categories.data.length > 0 &&
                        categories.data.map((category) => {
                           return (
                              <Box
                                 component={Link}
                                 to={`?${new URLSearchParams({ ...searchParams, category_id: String(category.id) }) as unknown as string}`}
                                 sx={{
                                    padding: '6px 12px',
                                    fontSize: 16,
                                    fontWeight: 500,
                                    color: searchParams['category_id'] === String(category.id) ? '#008b4b' : '#282828',
                                    textDecoration:
                                       searchParams['category_id'] === String(category.id) ? 'underline' : 'auto',
                                 }}
                                 key={category.id}
                              >
                                 {category.category_name}
                              </Box>
                           );
                        })}
                  </Stack>
               </Box>
            </Grid>
            <Grid item xs={9}>
               <Grid container spacing={2}>
                  {products?.data && products.data.length > 0 ? (
                     products.data.map((product) => {
                        return (
                           <Grid item xs={3} key={product.id}>
                              <ProductItem product={product} />
                           </Grid>
                        );
                     })
                  ) : (
                     <Grid item xs={12}>
                        <Typography variant="h3" textAlign="center" my={10}>
                           Không có sản phẩm nào
                        </Typography>
                     </Grid>
                  )}
               </Grid>
               <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" mt={4}>
                  <Pagination
                     count={products?.pagination.totalPage ?? 1}
                     page={Number(page)}
                     onChange={handleChangePage}
                     size="medium"
                  />
               </Grid>
            </Grid>
         </Grid>
      </BaseBreadcrumbs>
   );
};

export default Products;
