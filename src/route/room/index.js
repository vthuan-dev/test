import roomRoute from "./room.route";

const roomRoutes = {
  prefix: "/",
  routes: [
    {
      path: "room",
      route: roomRoute,
    },
  ],
};

export default roomRoutes;
