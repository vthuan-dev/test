import orderRoute from "./order.route";

const orderRoutes = {
  prefix: "/",
  routes: [
    {
      path: "order",
      route: orderRoute,
    },
  ],
};

export default orderRoutes;
