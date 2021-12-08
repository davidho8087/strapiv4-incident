"use strict";

const socketIO = (strapi) => {
  const PermissionService = () => {
    return strapi.service("plugin::users-permissions");
  };
  console.log("are you running SocketIo", strapi.server.httpServer);

  const ioServer = require("socket.io")(strapi.server.httpServer, {
    path: "/pipe",
    serveClient: false,
    pingInterval: 60000,
    // cors: {
    //   origin: middleware.settings.cors.origin,
    //   methods: ["GET", "POST"],
    // },
  });

  ioServer.on("connection", (socket) => {
    strapi.log.info(
      `Socket Connected by ${socket.username}, socketId: ${socket.id}`
    );

    socket.once("disconnect", () => {
      strapi.log.info("User disconnected", socket.id, socket.username);
      socket.disconnect(true);
    });
  });

  /* Handle Logic */
  ioServer.use(async (socket, next) => {
    console.log("Useing");
    const cookieHeader =
      socket.handshake.headers.cookie || socket.request.headers.cookie;

    const token = parseCookieFunc(cookieHeader);

    if (token) {
      try {
        const user = await PermissionService()
          .jwt.verify(token)
          .then((user) => {
            return user;
          });

        if (user) {
          await PermissionService()
            .user.fetchAuthenticatedUser(user.id)
            .then((authUser) => {
              socket.username = authUser.username;
              socket.userId = authUser.id;
            });

          return next();
        }
      } catch (error) {
        strapi.log.error(error.message, { error: error });

        return next(error);
      }
    }

    return next();
  });

  // store the server.io instance to global to use elsewhere
  return ioServer;
};

module.exports = ({ strapi }) => socketIO(strapi);
