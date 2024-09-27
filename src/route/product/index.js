import productRoute from "./product.route";

const productRoutes = {
  prefix: "/",
  routes: [
    {
      path: "product",
      route: productRoute,
    },
  ],
};

export default productRoutes;
