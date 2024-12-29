export const ORDER_STATUS = Object.freeze({
  PENDING: "PENDING",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED"
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED"
});

export const PAYMENT_METHOD = Object.freeze({
  PAYMENT_ON_CHECKIN: "PAYMENT_ON_CHECKIN", // thanh toán khi checkin
  PAYMENT_IN_ADVANCE: "PAYMENT_IN_ADVANCE", // thanh toán khi online
});
export const ORDER_TYPE = Object.freeze({
  ROOM_ORDER: "ROOM_ORDER", // thanh toán khi checkin
  PRODUCT_ORDER: "PRODUCT_ORDER", // thanh toán khi online
});
