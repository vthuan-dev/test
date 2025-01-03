/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import {
   Box,
   Button,
   Chip,
   Grid,
   IconButton,
   InputAdornment,
   OutlinedInput,
   Pagination,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Typography,
} from '@mui/material';
import styled from 'styled-components';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CreateIcon from '@mui/icons-material/Create';

import { getAllTimeline, getRom } from './service';
import FormAddRoom from './components/FormAddRoom';

import { ROUTE_PATH } from '@constants';
import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { useSearchParamsHook } from '@hooks';
import { ScrollbarBase } from '@components/design-systems/ScrollbarBase';
import { LazyLoadingImage } from '@components';

const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
];

const Rom = () => {
   const { searchParams, setParams } = useSearchParamsHook();
   const [open, setOpen] = useState<boolean>(false);

   const [roomId, setRoomId] = useState<number | undefined>(undefined);

   const { data: dataRooms } = getRom(searchParams);
   const { data: timeLine } = getAllTimeline();
   console.log('timeLine:', timeLine)

   const dataRender = useMemo(()=>{
      if(!dataRooms?.data) return [];
      const a = dataRooms.data.map(item=>{
         const bookTime = timeLine?.data.find(time=>time.id ===item.id)
         let time:string[] = []
         if(bookTime && Array.isArray(bookTime.booking_times)){
            time = bookTime.booking_times
         }
         return {
            ...item,
            time
         }
      })
      return a
   },[dataRooms,timeLine])
   console.log(dataRender)
   // Default values for pagination
   const currentPage = searchParams.page ?? 1;
   const totalPage = dataRooms?.pagination?.totalPage ?? 1;

   return (
      <BaseBreadcrumbs arialabel="Danh sách phòng" breadcrumbs={breadcrumbs}>
         <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={8}>
               <Box display="flex" gap={2}>
                  <Box sx={{ width: '300px' }}>
                     <OutlinedInputExtend fullWidth placeholder="Nhập tên phòng" />
                  </Box>
               </Box>
            </Grid>
            <Grid item xs={4}>
               <Box sx={{ display: 'flex', justifyContent: 'end', gap: 2 }}>
                  <Button startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                     Thêm phòng
                  </Button>
               </Box>
            </Grid>
         </Grid>
         <Grid container spacing={2} mt={3}>
            <Box sx={{ border: '1px solid #d1cccc', borderRadius: 3, width: '100%' }}>
               <TableContainer>
                  <ScrollbarBase
                     sx={{
                        'body::-webkit-scrollbar-track': {
                           webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.3)',
                           borderRadius: 10,
                           backgroundColor: '#F5F5F5',
                        },
                        width: '100%',
                        flex: 1,
                        height: '500px',
                     }}
                  >
                     <Table sx={{ maxHeight: 440, overflow: 'hidden' }}>
                        <TableHead>
                           <TableRow>
                              {/* Table Headers */}
                              <TableCell width={50}>STT</TableCell>
                              <TableCell>Hình ảnh</TableCell>
                              <TableCell>Tên phòng</TableCell>
                              <TableCell align="center">Số lượng máy</TableCell>
                              <TableCell>Giá thuê</TableCell>
                              <TableCell>Các khung giờ đã đặt</TableCell>
                              <TableCell>Trạng thái</TableCell>
                              <TableCell width={120}></TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {/* Table Data Rows */}
                           {
                              dataRender.map((room, index) => {
                                 // const currentStatus = row.status as OrderStatusKey | undefined;
                                 // const nextStatus = currentStatus ? getNextStatus(currentStatus) : undefined;

                                 return (
                                    <React.Fragment key={index}>
                                       <TableRow
                                          sx={{
                                             '&:last-child td, &:last-child th': { border: 0 },
                                             '& .MuiTableCell-root': { padding: '12px 16px !important' },
                                             borderBottom: '1px solid #d1cccc',
                                          }}
                                       >
                                          <TableCell align="center" sx={{ borderBottom: '1px solid #d1cccc' }}>
                                             {index + 1}
                                          </TableCell>
                                          <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                             <LazyLoadingImage width="60px" height="60px" src={room.image_url} />
                                          </TableCell>
                                          <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                             {room.room_name}
                                          </TableCell>
                                          <TableCell sx={{ borderBottom: '1px solid #d1cccc' }} align="center">
                                             <Chip label={room.capacity} />
                                          </TableCell>
                                          <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                             {Number(room.price).toLocaleString()}đ / 1h
                                          </TableCell>
                                          <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                                {room?.time && Array.isArray(room.time) && room.time.map((time: string, index: number) => (
                                                   <Typography key={index} variant='subtitle2'>{time}</Typography>
                                                ))}
                                          </TableCell>
                                          <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                             <Chip
                                                variant="outlined"
                                                label={room.status === 'INACTIVE' ? 'Trống' : 'Đang sử dụng'}
                                                color={room.status === 'INACTIVE' ? 'success' : 'error'}
                                             />
                                          </TableCell>

                                          <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                             <IconButton
                                                onClick={() => {
                                                   setRoomId(room.id);
                                                   setOpen(true);
                                                }}
                                             >
                                                <CreateIcon />
                                             </IconButton>
                                             <Link to={ROUTE_PATH.ADMIN_ROM + '/' + room.id}>
                                                <IconButton>
                                                   <RemoveRedEyeIcon />
                                                </IconButton>
                                             </Link>
                                          </TableCell>
                                       </TableRow>
                                    </React.Fragment>
                                 );
                              })}
                        </TableBody>
                     </Table>
                  </ScrollbarBase>
               </TableContainer>
            </Box>

            <Grid item xs={12} display="flex" justifyContent="end" alignItems="center" mt={1}>
               <Box display="flex" gap="12px" alignItems="center">
                  <Box component="span" fontSize="14px">
                     Trang {currentPage} trên {totalPage}
                  </Box>
                  <Pagination
                     variant="outlined"
                     onChange={(_, page) => setParams('page', String(page))}
                     count={totalPage}
                     page={Number(currentPage)}
                     siblingCount={1}
                  />
               </Box>
            </Grid>
         </Grid>
         <FormAddRoom open={open} setOpen={setOpen} roomId={roomId} setRoomId={setRoomId} />
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

export { Rom };
