import productRoutes from "./product";
import usersRoutes from "./user";
import categoryRoutes from "./category";
import cartRoutes from "./cart";
import roomRoutes from "./room";
import orderRoutes from "./order";
import desktopRoutes from "./desktop";
import chatRoutes from "./chat/index.js";
import orderRoomDetailRoutes from "./order/order-room-detail";

export const routes = [
  { ...productRoutes },
  { ...usersRoutes },
  { ...categoryRoutes },
  { ...cartRoutes },
  { ...roomRoutes },
  { ...orderRoutes },
  { ...desktopRoutes },
  { ...chatRoutes },
  { 
    prefix: "/order-room-detail",
    routes: [
      {
        path: "",
        route: orderRoomDetailRoutes
      }
    ]
  }
];
