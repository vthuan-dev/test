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
         <Box sx={{ 
            background: 'linear-gradient(135deg, #1a1f3c 0%, #141728 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            overflow: 'hidden'
         }}>
            <TableContainer>
               <ScrollbarBase
                  sx={{
                     width: '100%',
                     height: '500px',
                     '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                     },
                     '&::-webkit-scrollbar-track': {
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '3px',
                     },
                     '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        '&:hover': {
                           background: 'rgba(255,255,255,0.15)',
                        }
                     }
                  }}
               >
                  <Table sx={{ width: '100%' }}>
                     <TableHead>
                        <TableRow sx={{
                           background: 'rgba(255,255,255,0.02)',
                           borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}>
                           <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '16px',
                              borderBottom: 'none'
                           }} width={50}>STT</TableCell>
                           <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '16px',
                              borderBottom: 'none'
                           }}>Mã hóa đơn</TableCell>
                           <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '16px',
                              borderBottom: 'none'
                           }}>Khách hàng</TableCell>
                           <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '16px',
                              borderBottom: 'none'
                           }}>Tổng Tiền</TableCell>
                           <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '16px',
                              borderBottom: 'none'
                           }}>Trạng thái</TableCell>
                           <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '16px',
                              borderBottom: 'none'
                           }}>Ngày tạo</TableCell>
                           <TableCell sx={{ 
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              color: '#fff',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '16px',
                              borderBottom: 'none'
                           }} width={120}></TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {sortedOrders.map((row, index) => {
                           const currentStatus = row.status as OrderStatusKey | undefined;
                           const nextStatus = currentStatus ? getNextStatus(currentStatus) : undefined;

                           return (
                              <TableRow
                                 key={index}
                                 sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                       background: 'rgba(255,255,255,0.02)',
                                    },
                                    '& td': {
                                       borderBottom: '1px solid rgba(255,255,255,0.05)',
                                       padding: '12px 16px',
                                       color: 'rgba(255,255,255,0.7)',
                                    }
                                 }}
                              >
                                 <TableCell align="center">{index + 1}</TableCell>
                                 <TableCell>{row.id}</TableCell>
                                 <TableCell>{row.user_id}</TableCell>
                                 <TableCell>
                                    <Typography 
                                       sx={{ 
                                          color: '#00ff88',
                                          fontWeight: 600,
                                          fontSize: '0.95rem'
                                       }}
                                    >
                                       {Number(row.total_money)?.toLocaleString()}đ
                                    </Typography>
                                 </TableCell>
                                 <TableCell>
                                    <Chip
                                       label={ORDER_STATUS_LABELS[nextStatus as never]}
                                       color={statusButtonColors[nextStatus as never] || 'primary'}
                                       sx={{
                                          borderRadius: '6px',
                                          fontWeight: 500,
                                          fontSize: '0.85rem'
                                       }}
                                    />
                                 </TableCell>
                                 <TableCell>
                                    {dayjs(row.created_at).format('DD-MM-YYYY')}
                                 </TableCell>
                                 <TableCell>
                                    <Link to={ROUTE_PATH.ADMIN_ORDER + '/' + row.id}>
                                       <IconButton
                                          sx={{
                                             color: 'rgba(255,255,255,0.7)',
                                             transition: 'all 0.3s ease',
                                             '&:hover': {
                                                color: '#00ff88',
                                                background: 'rgba(0,255,136,0.1)',
                                             }
                                          }}
                                       >
                                          <RemoveRedEyeIcon />
                                       </IconButton>
                                    </Link>
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               </ScrollbarBase>
            </TableContainer>
         </Box>

         {/* Pagination */}
         <Box 
            sx={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'flex-end',
               gap: 2,
               mt: 3
            }}
         >
            <Typography 
               sx={{
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.7)'
               }}
            >
               Trang {currentPage} trên {totalPage}
            </Typography>
            <Pagination
               count={totalPage}
               page={Number(currentPage)}
               onChange={(_, page) => setParams('page', String(page))}
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
      </BaseBreadcrumbs>
   );
};

export default Order;
