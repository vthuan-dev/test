import productRoutes from "./product";
import usersRoutes from "./user";
import categoryRoutes from "./category";
import cartRoutes from "./cart";
import roomRoutes from "./room";

export const routes = [
  { ...productRoutes },
  { ...usersRoutes },
  { ...categoryRoutes },
  { ...cartRoutes },
  { ...roomRoutes },
];
