/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/naming-convention */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Box, Chip, IconButton, Pagination, Typography } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { getNextStatus, ORDER_STATUS_LABELS, statusButtonColors, type OrderStatusKey } from './OrderDetail';

import { getRequest } from '~/app/configs';
import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { ROUTE_PATH } from '@constants';
import { ScrollbarBase } from '@components/design-systems/ScrollbarBase';
import { useSearchParamsHook } from '@hooks';

// Breadcrumb data
const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
];

const Order = () => {
   const { setParams, searchParams } = useSearchParamsHook();

   // Construct query parameters
   const queryParam = new URLSearchParams({
      page: String(searchParams.page ?? 1),
      limit: String(10),
      isPagination: String(true),
   });

   // Fetch order data with pagination
   const { data: orders } = useQuery<ResponseGetList<OrderItem>>({
      queryKey: ['admnin-order', searchParams],
      queryFn: () => getRequest('/order' + `?${queryParam}`),
   });
   console.log('orders:', orders)

   const sortedOrders = orders?.data ? orders.data.sort((a, b) => {
      // So sánh ngày giữa 2 object
      return dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1;
    }) : []

   // Default values for pagination
   const currentPage = searchParams.page ?? 1;
   const totalPage = orders?.pagination?.totalPage ?? 1;

   return (
      <BaseBreadcrumbs arialabel="Hóa đơn" breadcrumbs={breadcrumbs}>
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
                           {/* Table Headers */}
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }} width={50}>
                              STT
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Mã hóa đơn</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Khách hàng</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Tổng Tiền</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Trạng thái</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }}>Ngày tạo</TableCell>
                           <TableCell sx={{ fontWeight: 600, fontSize: '18px' }} width={120}></TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {/* Table Data Rows */}
                        {sortedOrders.map((row, index) => {
                              const currentStatus = row.status as OrderStatusKey | undefined;
                              const nextStatus = currentStatus ? getNextStatus(currentStatus) : undefined;

                              return (
                                 <React.Fragment key={index}>
                                    <TableRow
                                       sx={{
                                          '&:last-child td, &:last-child th': { border: 0 },
                                          '& .MuiTableCell-root': { padding: '12px !important' },
                                          borderBottom: '1px solid #d1cccc',
                                       }}
                                    >
                                       <TableCell align="center" sx={{ borderBottom: '1px solid #d1cccc' }}>
                                          {index + 1}
                                       </TableCell>
                                       <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>{row.id}</TableCell>
                                       <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>{row.user_id}</TableCell>
                                       <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                          <Typography color="error" fontWeight="600">
                                             {Number(row.total_money)?.toLocaleString()}đ
                                          </Typography>
                                       </TableCell>
                                       <TableCell>
                                          <Chip
                                             label={ORDER_STATUS_LABELS[nextStatus as never]}
                                             color={statusButtonColors[nextStatus as never] || 'primary'}
                                          />
                                       </TableCell>
                                       <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                          {dayjs(row.created_at).format('DD-MM-YYYY')}
                                       </TableCell>
                                       <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                          <Link to={ROUTE_PATH.ADMIN_ORDER + '/' + row.id}>
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
         {/* Pagination Controls */}
         <Box display="flex" alignItems="center" justifyContent="end" gap={4} mt={2}>
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
         </Box>
      </BaseBreadcrumbs>
   );
};

export default Order;
