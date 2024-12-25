/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import {
   Box,
   Button,
   Grid,
   IconButton,
   InputAdornment,
   MenuItem,
   OutlinedInput,
   Pagination,
   Select,
   styled,
   Typography,
   type SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

import ProductItem from './components/ProductItem';
import FormAddProduct from './components/FormAddProduct';
import { apiGetCategories, apiGetListProduct } from './service';
import FormAddCategory from './components/FormAddCategory';

import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { ROUTE_PATH } from '@constants';
import { useSearchParamsHook } from '@hooks';

const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
];

export const AdminProduct = () => {
   const { searchParams, setParams, deleteParams } = useSearchParamsHook();

   const [openModalProduct, setOpenModalProduct] = useState<boolean>(false);
   const [openModalCategory, setOpenModalCategory] = useState<boolean>(false);
   const [productId, setProductId] = useState<number | undefined>(undefined);
   const [searchValue, setSearchValue] = useState<string>('');

   const categoryId = searchParams['category_id'] ?? '';
   const page = searchParams['page'] ?? 1;

   const { data: products, refetch: refetchListProduct } = apiGetListProduct(searchParams);

   const { data: categories, refetch: refetchCatrgory } = apiGetCategories();

   const handleChangePage = (_event: any, page: number) => {
      setParams('page', page);
   };

   const handChangeCategory = (event: SelectChangeEvent) => {
      if (event.target.value !== '') {
         setParams('category_id', event.target.value);
      } else {
         deleteParams('category_id');
      }
   };

   const handleOpen = (productId?: number) => {
      if (productId) {
         setProductId(productId);
      }

      setOpenModalProduct(true);
   };

   return (
      <BaseBreadcrumbs arialabel="Danh sách sản phẩm" breadcrumbs={breadcrumbs}>
         <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={8}>
               <Box display="flex" gap={2}>
                  <Box sx={{ width: '300px' }}>
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
                  <Select
                     displayEmpty
                     value={categoryId}
                     sx={{ minWidth: 150, borderRadius: '10px' }}
                     onChange={handChangeCategory}
                     renderValue={(selected) => {
                        if (selected.length === 0) {
                           return (
                              <Box component="span" sx={{ color: '#BCBCBC' }}>
                                 Danh mục sản phẩm
                              </Box>
                           );
                        }

                        if (categories && categories.data) {
                           return categories.data.find((item) => String(item.id) === selected)?.category_name;
                        }

                        return '';
                     }}
                     input={<OutlinedInput />}
                  >
                     <MenuItem value={''}>Tất cả</MenuItem>
                     {categories?.data &&
                        categories.data.map((item) => {
                           return (
                              <MenuItem key={item.id} value={item.id}>
                                 {item.category_name}
                              </MenuItem>
                           );
                        })}
                  </Select>
               </Box>
            </Grid>
            <Grid item xs={4}>
               <Box sx={{ display: 'flex', justifyContent: 'end', gap: 2 }}>
                  <Button onClick={() => handleOpen()} startIcon={<AddIcon />}>
                     Thêm sản phẩm
                  </Button>
                  <Button startIcon={<AddIcon />} color="warning" onClick={() => setOpenModalCategory(true)}>
                     Thêm danh mục
                  </Button>
               </Box>
            </Grid>
         </Grid>
         <Grid container spacing={2} mb={2}>
            {products && products.data.length > 0 ? (
               <>
                  {products.data.map((item) => {
                     return (
                        
                        <Grid item xs={2} key={item.id}>
                           <ProductItem product={item} handleOpen={handleOpen} />
                        </Grid>
                     );
                  })}
                  <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" mt={1}>
                     <Pagination
                        count={products?.pagination.totalPage ?? 1}
                        page={Number(page)}
                        onChange={handleChangePage}
                        size="medium"
                     />
                  </Grid>
               </>
            ) : (
               <Grid item xs={12}>
                  <Typography variant="h5" textAlign="center">
                     Không có sản phẩm nào
                  </Typography>
               </Grid>
            )}
         </Grid>
         {openModalProduct && (
            <FormAddProduct
               open={openModalProduct}
               setOpen={setOpenModalProduct}
               productId={productId}
               setProductId={setProductId}
               refetchListProduct={refetchListProduct}
               categories={categories?.data}
            />
         )}
         {openModalCategory && (
            <FormAddCategory
               open={openModalCategory}
               setOpen={setOpenModalCategory}
               refetchCatrgory={refetchCatrgory}
            />
         )}
      </BaseBreadcrumbs>
   );
};

export const OutlinedInputExtend = styled(OutlinedInput)({
   borderRadius: 10,
   backgroundColor: '#FFFFFF',

   '&.css-1d3z3hw-MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
      backgroundColor: '#FFFFFF',
   },
});

OutlinedInputExtend.defaultProps = {
   fullWidth: true,
   size: 'small',
   endAdornment: (
      <InputAdornment position="end">
         <IconButton
            aria-label="toggle password visibility"
            onClick={() => {}}
            onMouseDown={() => {}}
            onMouseUp={() => {}}
            edge="end"
         >
            <SearchIcon />
         </IconButton>
      </InputAdornment>
   ),
};
