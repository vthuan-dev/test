import { useQuery } from '@tanstack/react-query';
import { Box, TextField, Typography } from '@mui/material';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import type { IStatisticProduct } from '../type';

import { API_ROUTE } from '@constants';
import { getRequest, postRequest } from '~/app/configs';
import { priceFormat } from '@helpers';


function StatisticRevanue() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setendDate] = useState('');

    const handleRoomChange = (value: any) => {
        console.log(value)
       const start= dayjs(value).format("YYYY-MM-DD")
        setStartDate(start)
    }
    const handleRoomChangeEnd = (value: any) => {
        console.log(value)
        const end= dayjs(value).format("YYYY-MM-DD")
        setendDate(end)
    }

    const { data } = useQuery({
        queryKey: [API_ROUTE.STATISTIC_PRODUCT,startDate,endDate],
        queryFn: () => postRequest(API_ROUTE.STATISTIC_TOTAL_REVENUE,{startDate,endDate}),
    });

    return (
        <Box height={100}>
            <Typography>Thống kê tổng doanh thu:</Typography>
          <Box sx={{display:"flex",gap:3,margin:"24px 0"}}>
                <TextField
                    label="Từ ngày"
                    type="date"
                    sx={{width:"250px"}}
                    onChange={(e) => handleRoomChange(new Date(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Đến ngày"
                    type="date"
                     sx={{width:"250px"}}
                    onChange={(e) => handleRoomChangeEnd(new Date(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                />
            <Typography sx={{border:"1px solid #b5b5b5",borderRadius:"5px", padding:"4px 12px"}} color='primary.main' variant='h5'>{priceFormat(data?.total_revenue)}</Typography>
          </Box>
        </Box>
    )
}

export default StatisticRevanue