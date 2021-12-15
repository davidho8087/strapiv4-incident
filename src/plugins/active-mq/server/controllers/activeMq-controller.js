"use strict";

const { getService } = require("../utils");
const _ = require("lodash");

module.exports = {
  async getSettings(ctx) {
    // const data = await strapi
    //   .plugin("active-mq")
    //   .service("active-mq")
    //   .getSettings();

    const ActiveMqConfig = await getService("active-mq").getSettings();

    // const ActiveMqConfig = await strapi
    //   .store({ type: "plugin", name: "active-mq", key: "settings" })
    //   .get();

    console.log("controller", ActiveMqConfig);
    ctx.send(ActiveMqConfig);
  },

  async updateSettings(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      throw new ValidationError("Request body cannot be empty");
    }

    console.log("Input", ctx.request.body);

    await strapi
      .store({ type: "plugin", name: "active-mq", key: "settings" })
      .set({
        key: "settings",
        value: ctx.request.body,
      });

    const ActiveMqConfig = await strapi
      .store({ type: "plugin", name: "active-mq", key: "settings" })
      .get();

    // const result = await getService("active-mq").updateSettings(
    //   ctx.request.body
    // );
    // const result = "hello";
    console.log("topic", ActiveMqConfig.channel.topic);

    const queue = strapi.plugin("active-mq").config("queue");
    await getService("active-mq").connectChannel(ActiveMqConfig.channel.topic);
    // await connectChannel(ActiveMqConfig.channel.topic);
    // await connectChannel(queue);

    ctx.send(ActiveMqConfig);
  },
};
