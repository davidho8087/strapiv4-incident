module.exports = [
  {
    method: "GET",
    path: "/",
    handler: "activeMqController.getSettings",
    config: {
      policies: [
        // "admin::isAuthenticatedAdmin",
        // {
        //   name: "admin::hasPermissions",
        //   config: { actions: ["plugin::active-mq.active-mq.read"] },
        // },
      ],
    },
  },
  {
    method: "PUT",
    path: "/updateSettings",
    handler: "activeMqController.updateSettings",
    config: {
      policies: [],
    },
  },
];
