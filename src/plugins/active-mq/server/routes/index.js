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
    path: "/:id",
    handler: "activeMqController.updateActiveMq",
    config: {
      policies: [],
    },
  },

  {
    method: "GET",
    path: "/:id",
    handler: "activeMqController.getSetting",
    config: {
      policies: [],
    },
  },

  {
    method: "POST",
    path: "/",
    handler: "activeMqController.createActiveMq",
    config: {
      policies: [],
    },
  },
  {
    method: "DELETE",
    path: "/:id",
    handler: "activeMqController.deleteActiveMq",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/batch-delete",
    handler: "activeMqController.deleteActiveMqs",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/contentType/findAll",
    handler: "activeMqController.getContentType",
    config: {
      policies: [],
    },
  },
];
