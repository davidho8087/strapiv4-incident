'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('socket-io')
      .service('myService')
      .getWelcomeMessage();
  },
};
