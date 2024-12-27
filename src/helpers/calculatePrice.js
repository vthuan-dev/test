import dayjs from "dayjs";

export const calculateRoomPrice = ({
  startTime,
  endTime,
  roomPrice,
}) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  
  // Giới hạn thời gian thuê tối đa (ví dụ: 30 ngày)
  const maxRentHours = 30 * 24; // 30 ngày
  const totalHours = Math.ceil(end.diff(start, 'hour', true));
  
  if (totalHours > maxRentHours) {
    throw new Error(`Thời gian thuê tối đa là ${maxRentHours} giờ (${maxRentHours/24} ngày)`);
  }

  // Tính giá theo ngày nếu >= 24h
  let totalPrice = 0;
  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    
    // Giá theo ngày = giá/giờ * 20 (thay vì *24, giảm giá khi thuê dài)
    totalPrice = (days * roomPrice * 20) + (remainingHours * roomPrice);
  } else {
    totalPrice = totalHours * roomPrice;
  }

  // Làm tròn đến 1000
  totalPrice = Math.round(totalPrice / 1000) * 1000;

  return {
    totalHours,
    totalPrice,
    breakdown: {
      basePrice: roomPrice,
      days: Math.floor(totalHours / 24),
      hours: totalHours % 24
    }
  };
}; 