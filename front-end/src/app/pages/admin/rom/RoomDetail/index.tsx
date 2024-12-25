/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Box, Grid, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import DesktopItem from '../components/DesktopItem';

import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { ROUTE_PATH } from '@constants';
import { getRequest } from '~/app/configs';

const breadcrumbs = [
   {
      title: 'Trang Chủ',
      link: ROUTE_PATH.ADMIN_HOME,
   },
   {
      title: 'Danh sách phòng',
      link: ROUTE_PATH.ADMIN_ROM,
   },
];

const RoomDetail = () => {
   const { id } = useParams();

   const { data: roomDetail } = useQuery<ResponseGet<RoomItem>>({
      queryFn: () => getRequest(`/room/searchById/${id}`),
   });

   const description = roomDetail ? (roomDetail?.data.description ? JSON.parse(roomDetail?.data.description) : []) : [];

   return (
      <BaseBreadcrumbs arialabel={`Chi tiết phòng ${roomDetail?.data.room_name}`} breadcrumbs={breadcrumbs}>
         <Grid container>
            <Grid item xs={6}>
               <Box
                  component="img"
                  src={roomDetail?.data.image_url}
                  sx={{
                     height: 250,
                     width: '100%',
                     objectFit: 'cover',
                     borderRadius: '20px',
                  }}
               />
            </Grid>
            <Grid item xs={6}>
               <Box pl={2}>
                  <Box>
                     {description.map((item: any) => {
                        return (
                           <Box display="flex" alignItems="flex-start" gap={2}>
                              <Typography flex={1} textTransform="capitalize" fontWeight={700}>
                                 {item.label}:
                              </Typography>
                              <Typography flex={3}>{item.value}</Typography>
                           </Box>
                        );
                     })}
                  </Box>
               </Box>
            </Grid>
         </Grid>
         <Box mt={2}>
            <Typography variant="h5" color="success">
               <Box component="span" sx={{ borderBottom: '4px solid #008b4b' }}>
                  Danh sách máy
               </Box>
            </Typography>
            <Box mt={2}>
               <Grid container spacing={2}>
                  {Array.from({ length: roomDetail?.data.capacity ?? 0 }, (_, i) => i).map((item) => {
                     return (
                        <Grid item xs={3} key={item}>
                           <DesktopItem index={0} />
                        </Grid>
                     );
                  })}
               </Grid>
            </Box>
         </Box>
      </BaseBreadcrumbs>
   );
};

export default RoomDetail;
