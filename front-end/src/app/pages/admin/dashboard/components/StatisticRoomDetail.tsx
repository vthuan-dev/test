import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid
} from '@mui/material';
import { getRequest } from '~/app/configs';
import { priceFormat } from '@helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface RoomStatistic {
  room_id: number;
  room_name: string;
  room_status: string;
  total_bookings: number;
  total_hours: number;
  total_revenue: number;
  revenue_percentage: string;
  booking_percentage: string;
  current_booking: string | null;
  current_status: string;
}

function StatisticRoomDetail() {
  const { data, isLoading } = useQuery({
    queryKey: ['/order/statistic-room-detail'],
    queryFn: () => getRequest('/order/statistic-room-detail'),
  });

  const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40',
    '#9966FF', '#FF99CC', '#99FF99', '#99CCFF', '#FFB366'
  ];

  // Biểu đồ cột cho số lượt đặt
  const bookingsChartData = {
    labels: data?.data?.statistics?.map(item => item.room_name) || [],
    datasets: [
      {
        label: 'Số lượt đặt',
        data: data?.data?.statistics?.map(item => item.total_bookings) || [],
        backgroundColor: chartColors,
      },
    ],
  };

  // Biểu đồ cột cho doanh thu
  const revenueChartData = {
    labels: data?.data?.statistics?.map(item => item.room_name) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: data?.data?.statistics?.map(item => item.total_revenue) || [],
        backgroundColor: chartColors,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (isLoading) return <Typography>Đang tải...</Typography>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chi tiết thống kê phòng
      </Typography>

      {/* Biểu đồ */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Thống kê số lượt đặt phòng
            </Typography>
            <Bar options={chartOptions} data={bookingsChartData} height={100} />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Thống kê doanh thu theo phòng
            </Typography>
            <Bar options={chartOptions} data={revenueChartData} height={100} />
          </Paper>
        </Grid>
      </Grid>

      {/* Tổng kết */}
      {data?.data?.summary && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            Tổng kết:
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Typography>
              Tổng doanh thu: {priceFormat(data.data.summary.total_revenue)}đ
            </Typography>
            <Typography>
              Tổng lượt đặt: {data.data.summary.total_bookings}
            </Typography>
            <Typography>
              Tổng số phòng: {data.data.summary.total_rooms}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default StatisticRoomDetail; 