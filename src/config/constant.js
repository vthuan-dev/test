export const ORDER_STATUS = Object.freeze({
  PENDING: "PENDING", // trống
  CONFIRMED: "CONFIRMED", // đã xác nhận đặt
  CHECKED_IN: "CHECKED_IN", // đẵ đến
  CHECKED_OUT: "CHECKED_OUT", // đã trả phòng
  CANCELLED: "CANCELLED", // hủy
});

export const PAYMENT_METHOD = Object.freeze({
  PAYMENT_ON_CHECKIN: "PAYMENT_ON_CHECKIN", // thanh toán khi checkin
  PAYMENT_IN_ADVANCE: "PAYMENT_IN_ADVANCE", // thanh toán khi online
});
export const ORDER_TYPE = Object.freeze({
  ROOM_ORDER: "ROOM_ORDER", // thanh toán khi checkin
  PRODUCT_ORDER: "PRODUCT_ORDER", // thanh toán khi online
});
