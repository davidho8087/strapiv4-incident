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

    ctx.send(ActiveMqConfig);
  },

  async getSetting(ctx) {
    console.log("getFindOne");

    const { id } = ctx.params;
    console.log("id", id);

    try {
      const data = await getService("active-mq").getSetting(id);

      ctx.send(data);
    } catch (error) {
      console.log(error);
    }
  },

  async deleteActiveMq(ctx) {
    console.log("deleteOneActiveMq");

    const { id } = ctx.params;
    console.log("id", id);

    try {
      const data = await getService("active-mq").deleteActiveMq(id);

      ctx.send(data);
    } catch (error) {
      console.log(error);
    }
  },

  // async updateSettings(ctx) {
  //   if (_.isEmpty(ctx.request.body)) {
  //     throw new ValidationError("Request body cannot be empty");
  //   }

  //   console.log("Input", ctx.request.body);

  //   await strapi
  //     .store({ type: "plugin", name: "active-mq", key: "settings" })
  //     .set({
  //       key: "settings",
  //       value: ctx.request.body,
  //     });

  //   const ActiveMqConfig = await strapi
  //     .store({ type: "plugin", name: "active-mq", key: "settings" })
  //     .get();

  //   // const result = await getService("active-mq").updateSettings(
  //   //   ctx.request.body
  //   // );
  //   // const result = "hello";
  //   console.log("topic", ActiveMqConfig.channel.topic);

  //   const queue = strapi.plugin("active-mq").config("queue");
  //   await getService("active-mq").connectChannel(ActiveMqConfig.channel.topic);
  //   // await connectChannel(ActiveMqConfig.channel.topic);
  //   // await connectChannel(queue);

  //   ctx.send(ActiveMqConfig);
  // },

  async createActiveMq(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      throw new ValidationError("Request body cannot be empty");
    }

    console.log("Input", ctx.request.body);
    let data = ctx.request.body;

    try {
      const entry = await strapi.entityService.create(
        "api::active-mq.active-mq",
        { data }
      );

      ctx.send(entry);
    } catch (error) {
      console.log(error);
    }

    // await strapi
    //   .store({ type: "plugin", name: "active-mq", key: "settings" })
    //   .set({
    //     key: "settings",
    //     value: ctx.request.body,
    //   });

    // const ActiveMqConfig = await strapi
    //   .store({ type: "plugin", name: "active-mq", key: "settings" })
    //   .get();

    // // const result = await getService("active-mq").updateSettings(
    // //   ctx.request.body
    // // );
    // // const result = "hello";
    // console.log("topic", ActiveMqConfig.channel.topic);

    // const queue = strapi.plugin("active-mq").config("queue");
    // await getService("active-mq").connectChannel(ActiveMqConfig.channel.topic);
    // await connectChannel(ActiveMqConfig.channel.topic);
    // await connectChannel(queue);

    //ctx.send(ActiveMqConfig);
  },

  async connectActiveMq(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      throw new ValidationError("Request body cannot be empty");
    }

    console.log("Input", ctx.request.body);

    // await strapi
    //   .store({ type: "plugin", name: "active-mq", key: "settings" })
    //   .set({
    //     key: "settings",
    //     value: ctx.request.body,
    //   });

    // const ActiveMqConfig = await strapi
    //   .store({ type: "plugin", name: "active-mq", key: "settings" })
    //   .get();

    // // const result = await getService("active-mq").updateSettings(
    // //   ctx.request.body
    // // );
    // // const result = "hello";
    // console.log("topic", ActiveMqConfig.channel.topic);

    // const queue = strapi.plugin("active-mq").config("queue");
    // await getService("active-mq").connectChannel(ActiveMqConfig.channel.topic);
    // await connectChannel(ActiveMqConfig.channel.topic);
    // await connectChannel(queue);

    //ctx.send(ActiveMqConfig);

    ctx.send("hello Controller Active Create");
  },

  async deleteActiveMqs(ctx) {
    console.log("DELETE ALL");
    if (_.isEmpty(ctx.request.body)) {
      throw new ValidationError("Request body cannot be empty");
    }

    const { ids } = ctx.request.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return ctx.badRequest("ids must be an array of id");
    }

    for (const id of ids) {
      const activeMq = await strapi.entityService.findOne(
        "api::active-mq.active-mq",
        id
      );

      if (!activeMq) continue;

      await getService("active-mq").deleteActiveMq(id);

      // strapi.webhookRunner.remove(webhook);
    }

    ctx.send({ data: ids });
  },

  async updateActiveMq(ctx) {
    console.log("are you Updateing");
    if (_.isEmpty(ctx.request.body)) {
      throw new ValidationError("Request body cannot be empty");
    }

    const { id } = ctx.params;
    const { body } = ctx.request;
    console.log("payload", body);
    const activeMq = await strapi.entityService.findOne(
      "api::active-mq.active-mq",
      id
    );

    if (!activeMq) {
      return ctx.notFound("activeMq.notFound");
    }

    const hello = {
      data: {
        ...activeMq,
        ...body,
      },
    };
    console.log("hello", hello);

    const updatedActiveMq = await strapi.entityService.update(
      "api::active-mq.active-mq",
      id,
      {
        data: {
          ...activeMq,
          ...body,
        },
      }
    );

    if (!updatedActiveMq) {
      return ctx.notFound("activeMq.notFound");
    }

    console.log("updatedActiveMq", updatedActiveMq);

    //strapi.webhookRunner.update(updatedWebhook);

    ctx.send({ data: updatedActiveMq });
  },
};
