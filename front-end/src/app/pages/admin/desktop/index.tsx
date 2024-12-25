/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { useState } from 'react';
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

import FormAddDesktop from './components/FormAddDesktop';
import { breadcrumbs, desktop_status } from './contant';
import { apiGetListDesktop, getRom } from './service';

import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { useSearchParamsHook } from '@hooks';
import DesktopItem from '@components/DesktopItem';

const Desktop = () => {
   const { searchParams, setParams } = useSearchParamsHook();

   const [openModalDesktop, setOpenModalDesktop] = useState<boolean>(false);
   const [productId, setProductId] = useState<number | undefined>(undefined);

   const handChangeCategory = (event: SelectChangeEvent) => {
      setParams('status', event.target.value);
   };

   const page = searchParams['page'] ?? 1;

   const handleChangePage = (_event: any, page: number) => {
      setParams('page', page);
   };

   const status = searchParams['status'] ?? '';

   const { data: desktops } = apiGetListDesktop({
      page: Number(page),
      limit: 10,
      status: status,
   });
   const { data: rooms } = getRom();

   const handleOpen = (productId?: number) => {
      if (productId) {
         setProductId(productId);
      }

      setOpenModalDesktop(true);
   };

   return (
      <BaseBreadcrumbs arialabel="Danh sách thiết bị" breadcrumbs={breadcrumbs}>
         <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={8}>
               <Box display="flex" gap={2}>
                  {/* <Box sx={{ width: '300px' }}>
                     <OutlinedInputExtend
                        fullWidth
                        placeholder="Nhập tên sản phẩm"
                        value={searchParams['desktop_name']}
                        onChange={(e) => setParams('desktop_name', e.target.value.trim())}
                     />
                  </Box> */}
                  <Select
                     displayEmpty
                     value={status}
                     sx={{ minWidth: 150, borderRadius: '10px' }}
                     onChange={handChangeCategory}
                     renderValue={(selected) => {
                        if (selected.length === 0) {
                           return (
                              <Box component="span" sx={{ color: '#BCBCBC' }}>
                                 Trạng thái
                              </Box>
                           );
                        }

                        return desktop_status.find((item) => String(item.id) === selected)?.label;

                        return '';
                     }}
                     input={<OutlinedInput />}
                  >
                     {desktop_status.map((item) => {
                        return (
                           <MenuItem key={item.id} value={item.id}>
                              {item.label}
                           </MenuItem>
                        );
                     })}
                  </Select>
               </Box>
            </Grid>
            <Grid item xs={4}>
               <Box sx={{ display: 'flex', justifyContent: 'end', gap: 2 }}>
                  <Button onClick={() => handleOpen()} startIcon={<AddIcon />}>
                     Thêm Máy
                  </Button>
                  {/* <Button startIcon={<AddIcon />} color="warning" onClick={() => setOpenModalCategory(true)}>
                     Thêm danh mục
                  </Button> */}
               </Box>
            </Grid>
         </Grid>

         <Grid container spacing={2} mb={2}>
            {desktops && desktops.data.length > 0 ? (
               <>
                  {desktops.data.map((item) => {
                     return (
                        <Grid item xs={3} key={item.id}>
                           <DesktopItem rooms={rooms?.data ?? []} desktop={item} />
                        </Grid>
                     );
                  })}
                  <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" mt={1}>
                     <Pagination
                        count={desktops?.pagination?.totalPage ?? 1}
                        page={Number(page)}
                        onChange={handleChangePage}
                        size="medium"
                     />
                  </Grid>
               </>
            ) : (
               <Grid item xs={12}>
                  <Typography variant="h5" textAlign="center">
                     Không sẵn máy nào
                  </Typography>
               </Grid>
            )}
         </Grid>

         {openModalDesktop && (
            <FormAddDesktop
               totalDesktop={desktops?.pagination.totalRecord ?? 0}
               open={openModalDesktop}
               setOpen={setOpenModalDesktop}
               productId={productId}
               setProductId={setProductId}
            />
         )}
      </BaseBreadcrumbs>
   );
};

const OutlinedInputExtend = styled(OutlinedInput)({
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

export { Desktop };
