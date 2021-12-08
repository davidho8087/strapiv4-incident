"use strict";

/**
 * incident service.
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::incident.incident", ({ strapi }) => ({
  async onTranformPayload(incidents) {
    let entities = [];
    for (const i in incidents) {
      const cameraName = incidents[i].camera;
      const locationName = incidents[i].location;

      let incidentLocation;

      if (cameraName && locationName) {
        try {
          incidentLocation = await strapi
            .service("api::incident-location.incident-location")
            .findByLocationAndCamera(locationName, cameraName);
        } catch (error) {
          throw new Error(error);
        }
      }

      const meidasList = [];
      const mediasParam = incidents[i].media;

      if (mediasParam && mediasParam.length) {
        try {
          await Promise.all(
            mediasParam.map(async (media) => {
              const result = await strapi.entityService.create(
                "api::incident-media.incident-media",
                { data: media }
              );

              meidasList.push(result.id);
            })
          );
        } catch (error) {
          throw new Error(error);
        }
      }

      const event = incidents[i];

      event.incident_location = incidentLocation ? incidentLocation.id : null;
      event.imgs = meidasList;
      event.detected = event?.vaAttributes?.className;
      event.incidentName = event?.vaName;
      event.incidentDescription = event?.vaDescription;
      event.incidentType = event?.vaType;
      event.incidentAttributes = event?.vaAttributes;

      try {
        const entity = await strapi.entityService.create(
          "api::incident.incident",
          { data: event }
        );

        entities.push(entity);
      } catch {
        await strapi.service("api::incident.incident").rollback({
          rollback: "incident",
          payload: event,
        });
      }
    }
    return entities;
  },

  async rollback(ArgEvent) {
    if ((ArgEvent.rollback = "incident")) {
      const { imgs } = ArgEvent.payload;

      if (imgs && imgs.length > 0) {
        strapi.log.warn("Rollback Incident");
        try {
          await Promise.all(
            imgs.map(async (imgId) => {
              await strapi
                .services("api::incident-media.incident-media")
                .onDelete(imgId);
            })
          );
        } catch (error) {
          throw new Error(error);
        }
      }
      return;
    }

    return true;
  },
}));
