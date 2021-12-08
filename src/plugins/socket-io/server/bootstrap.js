"use strict";

const initSocketIo = require("./services/my-service");

module.exports = ({ strapi }) => {
  // bootstrap phase
  console.log("hello initSocket");
  initSocketIo({ strapi });
};
