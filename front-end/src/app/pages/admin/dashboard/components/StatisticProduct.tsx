import { useQuery } from '@tanstack/react-query';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions,
    type ChartData,
    type ChartDataset,
  } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

import type { IStatisticProduct } from '../type';

import { API_ROUTE } from '@constants';
import { getRequest } from '~/app/configs';


// eslint-disable-next-line @typescript-eslint/no-unsafe-call
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StatisticProduct() {
  const [datasets, setChartDatasets] = useState<ChartDataset<"bar">[]>([])

  const columnChartColors = [
    '#FF6384', // Đỏ nhạt
    '#36A2EB', // Xanh dương
    '#FFCE56', // Vàng nhạt
    '#4BC0C0', // Xanh ngọc
    '#9966FF'  // Tím
  ];

  useQuery({
        queryKey: [API_ROUTE.STATISTIC_PRODUCT],
        queryFn: () => getRequest(API_ROUTE.STATISTIC_PRODUCT),
        onSuccess: (res:ResponseGet<IStatisticProduct[]>) => {
          const datasets = res.data.map((product,index)=>{
            return {
              label: product.product_name,
              data: [product.total_price],
              backgroundColor: columnChartColors[index],
              yAxisID: 'y',
            } as unknown as ChartDataset<"bar">
          })
          setChartDatasets(datasets)
      },
     });

     const chartData:ChartData<"bar"> = {
      labels: ["Statistic Product"],
      datasets
    };

 const options: ChartOptions<"bar">  = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Product Statistics',
    },
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
    },
  },
};
  return (
    <Box height={400}> <Bar height={400} width={500} options={options} data={chartData} />
      <Typography>Thống kê sản phẩm bán chạy</Typography>
     </Box>
  )
}

export default StatisticProduct