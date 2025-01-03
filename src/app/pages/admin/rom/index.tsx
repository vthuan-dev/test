import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getAllTimeLine } from '../services/api';

const Rom = () => {
  const { data: rooms } = useQuery({
    queryKey: ['rooms-timeline'],
    queryFn: getAllTimeLine
  });

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên phòng</TableCell>
              <TableCell>Sức chứa</TableCell>
              <TableCell>Số máy</TableCell>
              <TableCell>Khung giờ đã đặt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms?.data.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.id}</TableCell>
                <TableCell>{room.room_name}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>{room.desktop_count}</TableCell>
                <TableCell>
                  {Array.isArray(room.booking_times) && room.booking_times.length > 0 ? (
                    <List>
                      {room.booking_times.map((time, index) => (
                        <ListItem key={index}>
                          <Typography>{time}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>Chưa có lịch đặt</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Rom;
