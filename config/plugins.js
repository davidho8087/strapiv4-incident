module.exports = {
  graphql: {
    endpoint: "/graphql",
    shadowCRUD: true,
    playgroundAlways: false,
    depthLimit: 7,
    amountLimit: 100,
    apolloServer: {
      tracing: true,
    },
  },

  "active-mq": {
    enabled: true,
    resolve: "./src/plugins/active-mq",
  },

  "socket-io": {
    enabled: true,
    resolve: "./src/plugins/socket-io",
  },
};
