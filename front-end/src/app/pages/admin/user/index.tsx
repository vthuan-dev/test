/* eslint-disable @typescript-eslint/naming-convention */
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Box, Chip, IconButton, Pagination } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import React from 'react';
import { Link } from 'react-router-dom';

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

const User = () => {
   const { setParams } = useSearchParamsHook();

   const { data: dataUsers } = useQuery<ResponseGetList<UserData>>({
      queryFn: () => getRequest('/auth/get-all-user'),
   });

   return (
      <BaseBreadcrumbs arialabel="Danh sách người dùng" breadcrumbs={breadcrumbs}>
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
                           <TableCell width={50}>STT</TableCell>
                           <TableCell width={200}>Tên khách hàng</TableCell>
                           <TableCell width={400}>Email</TableCell>
                           <TableCell>Vip</TableCell>
                           <TableCell>Ngày tạo</TableCell>
                           <TableCell width={120}></TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {dataUsers?.data &&
                           dataUsers?.data.length > 0 &&
                           dataUsers?.data.map((row, index) => (
                              <React.Fragment key={index}>
                                 <TableRow
                                    key={index}
                                    sx={{
                                       '&:last-child td, &:last-child th': { border: 0 },
                                       '& .MuiTableCell-root': {
                                          padding: '8px 16px !important',
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
                                       {row.username}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>{row.email}</TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                       {row.is_vip === 2 && (
                                          <Chip label={row.is_vip === 2 && 'Vip'} color="success" variant="outlined" />
                                       )}
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                       {dayjs(row.created_at).format('YYYY-MM-DD')}
                                    </TableCell>

                                    <TableCell sx={{ borderBottom: '1px solid #d1cccc' }}>
                                       <Link to={ROUTE_PATH.ADMIN_USER + '/' + row.id}>
                                          <IconButton>
                                             <RemoveRedEyeIcon />
                                          </IconButton>
                                       </Link>
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
                  Trang {dataUsers?.pagination.currentPage} trên {dataUsers?.pagination.totalPage ?? 1}
               </Box>
               <Pagination
                  variant="outlined"
                  onChange={(_, page) => setParams('page', String(page))}
                  count={dataUsers?.pagination.totalPage ?? 1}
                  page={dataUsers?.pagination.currentPage}
                  siblingCount={1}
               />
            </Box>
         </Box>
      </BaseBreadcrumbs>
   );
};

export default User;
