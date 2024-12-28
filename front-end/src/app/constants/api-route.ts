const API_ROUTE = {
   LOGIN: '/auth/login',
   VERIFY_TOKEN: '/auth/verifyToken',

   CATEGORY: '/category',
   CATEGORY_ADD: '/category/add',

   DESTKTOP: '/desktop',
   DESTKTOP_ADD: '/desktop/add',
   DESTKTOP_SEARCH_BY_ID: '/desktop/searchById',

   ROOM: '/room',
   ROOM_SEARCH_BY_ID: '/room/searchById',
   ROOM_ALL_TIMELINE: '/room/get-all-timeline',

   PRODUCT: '/product',
   PRODUCT_UPDATE: '/product/update',
   PRODUCT_SEARCH_BY_ID: '/product/searchById',
   PRODUCT_REMOVE: '/remove',
   PRODUCT_ADD: '/product/add',

   CART: '/cart',
   ORDER_CART: '/cart/add',

   ORDER_ROOM: 'order/room',
   ORDER_ROOM_ADD: 'order/room/add',
   ORDER_ROOM_UPDATE: 'order/room/update',
   ORDER_ROOM_REMOVE: 'order/room/remove',
   ORDER_ROOM_SEARCH_BY_ID: 'order/room/searchById',

   // statistic
   STATISTIC_PRODUCT:"order/statistic-product",
   STATISTIC_ROOM:"order/statistic-room",
   STATISTIC_TOTAL_REVENUE:"order/statistic-revenue",

   // payment
   SAVE_PAYMENT :"order/save-payment",
   STATISTIC_ROOM_DETAIL:"order/statistic-room-detail"
};

export { API_ROUTE };
