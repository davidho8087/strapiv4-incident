'use strict';

/**
 * active-mq router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::active-mq.active-mq');
