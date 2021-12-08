"use strict";

/**
 * incident router.
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::incident.incident");
