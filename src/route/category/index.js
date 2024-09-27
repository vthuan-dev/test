import categoryRoute from "./category.route";

const categoryRoutes = {
  prefix: "/",
  routes: [
    {
      path: "category",
      route: categoryRoute,
    },
  ],
};

export default categoryRoutes;
