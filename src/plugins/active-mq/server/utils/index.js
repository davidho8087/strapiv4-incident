"use strict";
// added
const getService = (name) => {
  return strapi.plugin("active-mq").service(name);
};

module.exports = {
  getService,
};
