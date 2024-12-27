export const ROOM_PRICES = {
  // Giá theo giờ
  HOURLY: {
    NORMAL: 50000,    // Phòng thường
    COUPLE: 80000,    // Phòng couple
    VIP: 120000,      // Phòng VIP
    STREAM: 150000    // Phòng stream
  },
  
  // Tỷ lệ giảm giá theo số ngày
  DISCOUNT_RATES: {
    MONTHLY: 0.7,     // >= 30 ngày: giảm 30%
    WEEKLY: 0.75,     // >= 7 ngày: giảm 25%
    FIVE_DAYS: 0.78,  // 5-6 ngày: giảm 22%
    DAILY: 0.8,       // 1-4 ngày: giảm 20%
  },

  // Giảm giá đặc biệt
  SPECIAL_DISCOUNT: {
    VIP_MEMBER: 0.9,  // Thành viên VIP: giảm 10%
    LONG_HOURS: 0.95  // Đặt >= 5 giờ: giảm 5%
  }
}; 