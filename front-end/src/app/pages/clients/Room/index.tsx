/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid, Pagination } from '@mui/material';

import RoomItem from '../home-client/component/RoomItem';

import BaseBreadcrumbs from '@components/design-systems/BaseBreadcrumbs/BaseBreadcrumbs';
import { getRom } from '@pages/admin/rom/service';
import { useSearchParamsHook } from '@hooks';

const Room = () => {
   const { searchParams, setParams } = useSearchParamsHook();

   const page = searchParams['page'] ?? 1;

   const { data: dataRooms } = getRom(searchParams);

   const handleChangePage = (_event: any, page: number) => {
      setParams('page', page);
   };

   return (
      <BaseBreadcrumbs arialabel="Danh sách phòng">
         <Grid container spacing={2}>
            {dataRooms?.data &&
               dataRooms.data.length > 0 &&
               dataRooms.data.map((item) => {
                  return (
                     <Grid item xs={3} key={item.id}>
                        <RoomItem room={item} />
                     </Grid>
                  );
               })}
            <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" mt={1}>
               <Pagination
                  count={dataRooms?.pagination.totalPage ?? 1}
                  page={Number(page)}
                  onChange={handleChangePage}
                  size="medium"
               />
            </Grid>
         </Grid>
      </BaseBreadcrumbs>
   );
};

export default Room;
