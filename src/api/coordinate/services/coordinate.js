'use strict';

/**
 * coordinate service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::coordinate.coordinate');
