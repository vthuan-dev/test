import { useQuery } from '@tanstack/react-query';
import {
    Chart as ChartJS,
    type ChartOptions,
    // type ChartData,
    registerables,
    type ChartData,
  } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

import type { IStatisticRoom } from '../type';

import { API_ROUTE } from '@constants';
import { getRequest } from '~/app/configs';


// eslint-disable-next-line @typescript-eslint/no-unsafe-call
ChartJS.register(...registerables);

function StatisticRoom() {
  const [data, setData] = useState<ChartData<"pie">>({labels:[],datasets:[]})

  const pieChartColors = [
    '#FF6384', // Đỏ nhạt
    '#36A2EB', // Xanh dương
    '#FFCE56', // Vàng nhạt
    '#4BC0C0', // Xanh ngọc
    '#FF9F40'  // Cam
  ];
  
  useQuery({
        queryKey: [API_ROUTE.STATISTIC_ROOM],
        queryFn: () => getRequest(API_ROUTE.STATISTIC_ROOM),
        onSuccess: (res:ResponseGet<IStatisticRoom[]>) => {
        const data: number[] = []
        const labels: string[] = []
        const backgroundColor:string[] =[]

        res.data.forEach((item,index)=>{
            labels.push(item.room_name)
            data.push(item.total_price )
            backgroundColor.push(pieChartColors[index])
          })

          setData({
            labels,
            datasets: [
                {   
                    label: "Statistic Room",
                    data,
                    backgroundColor,
                }
            ],
          })
      },
     });

 const options: ChartOptions<"pie">  = {
  responsive: true,
};
  return (
    <Box height={400}> 
    <Pie  height={400} width={500} options={options} data={data} />
    <Typography>Thống kê phòng đặt nhiều nhất</Typography>
    </Box>
  )
}

export default StatisticRoom