'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('active-mq')
      .service('myService')
      .getWelcomeMessage();
  },
};
