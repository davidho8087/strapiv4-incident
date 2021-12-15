'use strict';

/**
 * active-mq service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::active-mq.active-mq');
