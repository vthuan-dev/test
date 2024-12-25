/* eslint-disable @typescript-eslint/naming-convention */
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Box, Chip, IconButton, Pagination, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import React from 'react';

import { getRequest } from '~/app/configs';
import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { ROUTE_PATH } from '@constants';
import { ScrollbarBase } from '@components/design-systems/ScrollbarBase';
import { useSearchParamsHook } from '@hooks';

const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
];

const OrderRoom = () => {
   const { setParams } = useSearchParamsHook();

   const { data: orders } = useQuery<ResponseGetList<OrderItem>>({
      queryFn: () => getRequest('/order/room'),
   });

   return (
      <BaseBreadcrumbs arialabel="Lịch sử đặt phòng" breadcrumbs={breadcrumbs}>
         <Box sx={{ border: '1px solid #d1cccc', borderRadius: 3 }}>
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
                  <Table aria-label="simple table" sx={{ width: '100%', maxHeight: 440, overflow: 'hidden' }}>
                     <TableHead>
                        <TableRow>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }} width={50}>
                              STT
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Mã hóa đơn</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Khách hàng</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Tổng Tiền</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Trạng thái</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>description</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Ngày tạo</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }} width={120}></TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {orders?.data &&
                           orders?.data.length > 0 &&
                           orders?.data.map((row, index) => (
                              <React.Fragment key={index}>
                                 <TableRow
                                    key={index}
                                    sx={{
                                       '&:last-child td, &:last-child th': { border: 0 },
                                       '& .MuiTableCell-root': {
                                          padding: '12px !important',
                                       },
                                       width: 100,
                                       borderBottom: '1px solid #d1cccc',
                                    }}
                                 >
                                    <TableCell
                                       component="th"
                                       scope="row"
                                       align="center"
                                       sx={{ borderBottom: '1px solid #d1cccc' }}
                                    >
                                       {index + 1}
                                    </TableCell>
                                    <TableCell width={150} sx={{ borderBottom: '1px solid #d1cccc' }}>
                                       {row.id}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>{row.user_id}</TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                       <Typography color="error" fontWeight="600">
                                          {Number(row.total_money)?.toLocaleString()}đ
                                       </Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                       <Chip label={row.status} color="success" variant="outlined" />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>{row.description}</TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                       {dayjs(row.created_at).format('YYYY-MM-DD')}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                       <IconButton>
                                          <EditIcon />
                                       </IconButton>
                                       <IconButton>
                                          <RemoveRedEyeIcon />
                                       </IconButton>
                                    </TableCell>
                                 </TableRow>
                              </React.Fragment>
                           ))}
                     </TableBody>
                  </Table>
               </ScrollbarBase>
            </TableContainer>
         </Box>
         <Box display="flex" alignItems="center" justifyContent="end" gap={4} mt={2}>
            <Box display="flex" gap="12px" alignItems="center">
               <Box component="span" fontSize="14px">
                  Bản ghi trên mỗi trang
               </Box>
            </Box>
            <Box display="flex" gap="12px" alignItems="center">
               <Box component="span" fontSize="14px">
                  Trang {orders?.pagination.currentPage} trên {orders?.pagination.totalPage ?? 1}
               </Box>
               <Pagination
                  variant="outlined"
                  onChange={(_, page) => setParams('page', String(page))}
                  count={orders?.pagination.totalPage ?? 1}
                  page={orders?.pagination.currentPage}
                  siblingCount={1}
               />
            </Box>
         </Box>
      </BaseBreadcrumbs>
   );
};

export default OrderRoom;
