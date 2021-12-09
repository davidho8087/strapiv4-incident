"use strict";

const initSocketIo = require("./services/socket-io");

module.exports = ({ strapi }) => {
  // bootstrap phase
  console.log("hello initSocket");
  initSocketIo({ strapi });
};
