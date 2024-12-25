/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';

import { apiGetRoomDetail } from '../../service';

import { LazyLoadingImage } from '@components';
import noImage from '@assets/images/no-image.png';

interface RoomDetailProps {
   roomId: number;
}

const RoomDetail = (props: RoomDetailProps) => {
   const { roomId } = props;

   const { data: roomDetail } = apiGetRoomDetail({ roomId });

   return (
      <Box sx={{ width: 700, py: 3 }}>
         <Typography variant="h5" textTransform="uppercase" pb={2} px={2}>
            Chi tiết phòng {roomDetail?.data.room_name}
         </Typography>
         <Box sx={{ width: '100%', height: '300px' }}>
            <LazyLoadingImage
               width="100%"
               height="100%"
               src={roomDetail?.data.image_url ?? noImage}
               alt={roomDetail?.data.room_name}
               style={{
                  width: '100%',
                  height: '300px',
               }}
            />
         </Box>

         <TableContainer sx={{ px: 3, pt: 2 }}>
            <Table>
               <TableBody>
                  {/* Room Name */}
                  <TableRow>
                     <TableCell sx={{ width: 150, fontWeight: 700 }}>Tên phòng:</TableCell>
                     <TableCell>{roomDetail?.data.room_name}</TableCell>
                  </TableRow>

                  {/* Number of Desktops */}
                  <TableRow>
                     <TableCell sx={{ width: 150, fontWeight: 700 }}>Số lượng máy:</TableCell>
                     <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                        {roomDetail?.data.desktops.length} Máy /{' '}
                        <Box component="span" color="blue">
                           {roomDetail?.data.capacity} Máy
                        </Box>
                     </TableCell>
                  </TableRow>

                  {/* Room Price */}
                  <TableRow>
                     <TableCell sx={{ width: 150, fontWeight: 700 }}>Giá:</TableCell>
                     <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                        {roomDetail?.data.room_price?.toLocaleString()}đ
                     </TableCell>
                  </TableRow>

                  {/* Room Position */}
                  <TableRow>
                     <TableCell sx={{ width: 150, fontWeight: 700 }}>Vị trí:</TableCell>
                     <TableCell>{roomDetail?.data.position}</TableCell>
                  </TableRow>

                  {/* Room Status */}
                  <TableRow>
                     <TableCell sx={{ width: 150, fontWeight: 700 }}>Trạng thái:</TableCell>
                     <TableCell>
                        <Chip
                           label={roomDetail?.data.room_status}
                           color={roomDetail?.data.room_status === 'INACTIVE' ? 'success' : 'error'}
                        />
                     </TableCell>
                  </TableRow>

                  {/* Room Description */}
                  <TableRow>
                     <TableCell sx={{ fontWeight: 700, verticalAlign: 'top', width: 150 }}>Mô tả phòng:</TableCell>
                     <TableCell>
                        {roomDetail?.data.room_description &&
                           (() => {
                              try {
                                 const roomDescriptionArray = JSON.parse(roomDetail?.data?.room_description) as any[];
                                 if (Array.isArray(roomDescriptionArray) && roomDescriptionArray.length > 0) {
                                    return (
                                       <Box component="ul" sx={{ pl: 3, m: 0, listStyleType: 'none' }}>
                                          {roomDescriptionArray.map((item, index) => (
                                             <Box
                                                component="li"
                                                key={index}
                                                sx={{
                                                   display: 'flex',
                                                   alignItems: 'center',
                                                   mt: 1,
                                                   bgcolor: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                                                   p: 1,
                                                   borderRadius: 1,
                                                   boxShadow: 1,
                                                }}
                                             >
                                                <Typography flex={1} sx={{ fontWeight: 600, color: '#333' }}>
                                                   {item['label']}:
                                                </Typography>
                                                <Typography flex={2} sx={{ color: '#555', lineHeight: 1.5 }}>
                                                   {item['value']}
                                                </Typography>
                                             </Box>
                                          ))}
                                       </Box>
                                    );
                                 }
                              } catch (error) {
                                 return <Typography color="error">Có lỗi khi tải mô tả phòng!</Typography>;
                              }
                              return null;
                           })()}
                     </TableCell>
                  </TableRow>
               </TableBody>
            </Table>
         </TableContainer>
      </Box>
   );
};

export default RoomDetail;
