import cartRoute from "./cart.route";

const cartRoutes = {
  prefix: "/",
  routes: [
    {
      path: "cart",
      route: cartRoute,
    },
  ],
};

export default cartRoutes;
