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
         <Box
            sx={{
               background: 'linear-gradient(135deg, #1a1f3c 0%, #141728 100%)',
               borderRadius: '16px',
               border: '1px solid rgba(255,255,255,0.05)',
               boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
               padding: '20px',
               marginBottom: '24px'
            }}
         >
            <Grid container spacing={2} alignItems="center">
               <Grid item xs={8}>
                  <Box display="flex" gap={2} alignItems="center">
                     <Select
                        displayEmpty
                        value={status}
                        sx={{
                           minWidth: 180,
                           borderRadius: '12px',
                           background: 'rgba(255,255,255,0.03)',
                           '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.1)',
                           },
                           '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0,255,136,0.5)',
                           },
                           '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#00ff88',
                           },
                           '& .MuiSelect-select': {
                              color: '#fff',
                           }
                        }}
                        onChange={handChangeCategory}
                        renderValue={(selected) => {
                           if (selected.length === 0) {
                              return (
                                 <Box component="span" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                    Trạng thái
                                 </Box>
                              );
                           }
                           return desktop_status.find((item) => String(item.id) === selected)?.label;
                        }}
                     >
                        {desktop_status.map((item) => (
                           <MenuItem 
                              key={item.id} 
                              value={item.id}
                              sx={{
                                 color: '#fff',
                                 '&:hover': {
                                    background: 'rgba(0,255,136,0.1)',
                                 },
                                 '&.Mui-selected': {
                                    background: 'rgba(0,255,136,0.2)',
                                    '&:hover': {
                                       background: 'rgba(0,255,136,0.25)',
                                    }
                                 }
                              }}
                           >
                              {item.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </Box>
               </Grid>
               <Grid item xs={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                     <Button
                        onClick={() => handleOpen()}
                        startIcon={<AddIcon />}
                        sx={{
                           background: 'linear-gradient(135deg, #00ff88 0%, #00b8ff 100%)',
                           color: '#fff',
                           padding: '8px 24px',
                           borderRadius: '12px',
                           textTransform: 'none',
                           fontSize: '0.95rem',
                           fontWeight: 600,
                           '&:hover': {
                              background: 'linear-gradient(135deg, #00ff88 0%, #00b8ff 100%)',
                              opacity: 0.9,
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 24px rgba(0,255,136,0.3)',
                           }
                        }}
                     >
                        Thêm Máy
                     </Button>
                  </Box>
               </Grid>
            </Grid>
         </Box>

         <Grid container spacing={3}>
            {desktops && desktops.data.length > 0 ? (
               <>
                  {desktops.data.map((item) => (
                     <Grid item xs={3} key={item.id}>
                        <Box
                           sx={{
                              background: 'linear-gradient(135deg, rgba(26,31,60,0.8) 0%, rgba(20,23,40,0.8) 100%)',
                              borderRadius: '16px',
                              border: '1px solid rgba(255,255,255,0.05)',
                              backdropFilter: 'blur(10px)',
                              overflow: 'hidden',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                 transform: 'translateY(-5px)',
                                 boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                 borderColor: 'rgba(0,255,136,0.3)',
                              }
                           }}
                        >
                           <DesktopItem rooms={rooms?.data ?? []} desktop={item} />
                        </Box>
                     </Grid>
                  ))}
                  
                  <Grid item xs={12}>
                     <Box 
                        sx={{
                           display: 'flex',
                           justifyContent: 'center',
                           mt: 4,
                           gap: 2
                        }}
                     >
                        <Pagination
                           count={desktops?.pagination?.totalPage ?? 1}
                           page={Number(page)}
                           onChange={handleChangePage}
                           sx={{
                              '& .MuiPaginationItem-root': {
                                 color: 'rgba(255,255,255,0.7)',
                                 border: '1px solid rgba(255,255,255,0.05)',
                                 '&.Mui-selected': {
                                    background: 'rgba(0,255,136,0.1)',
                                    color: '#00ff88',
                                    borderColor: '#00ff88',
                                 },
                                 '&:hover': {
                                    background: 'rgba(255,255,255,0.05)',
                                 }
                              }
                           }}
                        />
                     </Box>
                  </Grid>
               </>
            ) : (
               <Grid item xs={12}>
                  <Box
                     sx={{
                        textAlign: 'center',
                        padding: '48px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                     }}
                  >
                     <Typography
                        variant="h5"
                        sx={{
                           color: 'rgba(255,255,255,0.7)',
                           fontWeight: 500
                        }}
                     >
                        Không có thiết bị nào
                     </Typography>
                  </Box>
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
