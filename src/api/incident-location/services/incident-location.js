"use strict";

/**
 * incident-location service.
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::incident-location.incident-location",
  ({ strapi }) => ({
    async findByLocationAndCamera(locationName, cameraName) {
      // Find Location

      let location = await strapi.db.query("api::location.location").findOne({
        where: { name: locationName },
      });

      // Find camera
      let camera = await strapi.db
        .query("api::camera.camera")
        .findOne({ where: { name: cameraName } });

      if (location === null) {
        // create Location
        location = await strapi.db
          .query("api::location.location")
          .create({ data: { name: locationName } });
      }

      if (camera === null) {
        // create Camera not exist
        camera = await strapi.db
          .query("api::camera.camera")
          .create({ data: { name: cameraName } });
      }

      if (location && camera) {
        // Find IncidentLocation
        let incidentLocation = await strapi.db
          .query("api::incident-location.incident-location")
          .findOne({ where: { location: location.id, camera: camera.id } });

        if (incidentLocation === null) {
          // Create Incident if not exist
          incidentLocation = await strapi.db
            .query("api::incident-location.incident-location")
            .create({ data: { location: location.id, camera: camera.id } });
        }

        return incidentLocation;
      }
    },

    async onDelete(locationIncidentId) {
      return await strapi.db
        .query("api::incident-location.incident-location")
        .delete({ where: { id: locationIncidentId } });
    },
  })
);
