"use strict";

/**
 * incident-media service.
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::incident-media.incident-media",
  ({ strapi }) => ({
    async onDelete(imgId) {
      return await strapi.db
        .query("api::incident-media.incident-media")
        .delete({ where: { id: imgId } });
    },
  })
);
