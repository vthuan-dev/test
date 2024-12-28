import { Grid2 } from '@mui/material';

import StatisticProduct from './components/StatisticProduct';
import StatisticRoom from './components/StatisticRoom';
import StatisticRevanue from './components/StatisticRevanue';
import StatisticRoomDetail from './components/StatisticRoomDetail';

export const Dashboard = () => {
   return <div>
      <Grid2 container spacing={6} mt={6}>
         <Grid2 size={12}><StatisticRevanue/></Grid2>
         <Grid2 size={6}><StatisticProduct/></Grid2>
         <Grid2 size={6}><StatisticRoom/></Grid2>
         <Grid2 size={12}><StatisticRoomDetail/></Grid2>
      </Grid2>
   </div>;
};
