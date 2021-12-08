"use strict";

/**
 *  incident controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const processIntervalMessage = async (vatesEvents) => {
  const vatesCameraEvents = vatesEvents.reduce((accumulator, currentValue) => {
    if (!accumulator[currentValue.camera])
      accumulator[currentValue.camera] = [];
    accumulator[currentValue.camera].push(currentValue);
    return accumulator;
  }, {});

  let formmattedEventList = [];

  for (const [key, value] of Object.entries(vatesCameraEvents)) {
    const vatesDescriptionEvents = value.reduce((accumulator, currentValue) => {
      if (!accumulator[currentValue.vaDescription])
        accumulator[currentValue.vaDescription] = [];
      accumulator[currentValue.vaDescription].push(currentValue);
      return accumulator;
    }, {});

    for (const [key, value] of Object.entries(vatesDescriptionEvents)) {
      let newMedia = [];
      value
        .map((e) => e.media)
        .forEach((mediaList) =>
          mediaList.forEach((media) => newMedia.push(media))
        );
      let formattedEvent = { ...value[0], media: newMedia, trackingId: null };
      formmattedEventList.push(formattedEvent);
    }
  }

  return formmattedEventList;
};

module.exports = createCoreController(
  "api::incident.incident",
  ({ strapi }) => ({
    async createIncident(ctx) {
      let vatesEvents = ctx.request ? ctx.request.body.vaEvents : ctx.vaEvents;

      if (!Array.isArray(vatesEvents)) {
        throw new Error("Invalid message format");
      }

      const messageTypes = vatesEvents
        .map((e) => e.messageType)
        .filter((value, index, self) => self.indexOf(value) === index);

      if (messageTypes.length > 1) {
        throw new Error("Unable to support multiple message type!");
      }

      if (messageTypes[0] === "interval") {
        console.log("Interval processing");
        vatesEvents = await processIntervalMessage(vatesEvents);
      }

      try {
        const entities = await strapi
          .service("api::incident.incident")
          .onTranformPayload(vatesEvents);

        const sanitizedEntity = await this.sanitizeOutput(entities, ctx);
        return this.transformResponse(sanitizedEntity);
      } catch (error) {
        // throw new Error("Failed to create Incident from ActiveMq", error);
        strapi.log.error(error);
      }
    },
  })
);
