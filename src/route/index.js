import productRoutes from "./product";
import usersRoutes from "./user";
import categoryRoutes from "./category";
import cartRoutes from "./cart";
import roomRoutes from "./room";
import orderRoutes from "./order";

export const routes = [
  { ...productRoutes },
  { ...usersRoutes },
  { ...categoryRoutes },
  { ...cartRoutes },
  { ...roomRoutes },
  { ...orderRoutes },
];
