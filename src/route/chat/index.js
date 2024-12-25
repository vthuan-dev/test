import chatRoute from "./chat.route.js";

const chatRoutes = {
  prefix: "/",
  routes: [
    {
      path: "chat",
      route: chatRoute,
    },
  ],
};

export default chatRoutes; 