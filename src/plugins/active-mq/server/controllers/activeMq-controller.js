"use strict";

const { getService } = require("../utils");
const _ = require("lodash");

module.exports = {
  async getSettings(ctx) {
    console.log("getSettings");
    // const data = await strapi
    //   .plugin("active-mq")
    //   .service("active-mq")
    //   .getSettings();

    const ActiveMqConfig = await getService("active-mq").getSettings();

    // const contentType = await strapi
    //   .service(`plugin::content-manager.content-types`)
    //   .findDisplayedContentTypes()
    //   .map((item) => item.info.displayName);

    // console.log("contentType", contentType);

    // const ActiveMqConfig = await strapi
    //   .store({ type: "plugin", name: "active-mq", key: "settings" })
    //   .get();

    ctx.send(ActiveMqConfig);
  },

  async getSetting(ctx) {
    console.log("getFindOne");

    const { id } = ctx.params;
    console.log("Get Settings Id is ", ctx.params);

    try {
      const data = await getService("active-mq").getSetting(id);

      ctx.send(data);
    } catch (error) {
      console.log("got error meh", error);
    }
  },

  async getContentType(ctx) {
    console.log("getContentType===========>");
    const contentType = await strapi
      .service(`plugin::content-manager.content-types`)
      .findDisplayedContentTypes()
      .map((item) => item.info.displayName);

    ctx.send({ data: contentType });
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

  async deleteActiveMq(ctx) {
    console.log("DELETE");

    const { id } = ctx.params;

    try {
      const data = await getService("active-mq").deleteActiveMq(id);

      ctx.send(data);
    } catch (error) {
      console.log(error);
    }
  },

  // # delete all list
  async updateActiveMq(ctx) {
    console.log("UPDATE");

    if (_.isEmpty(ctx.request.body)) {
      throw new ValidationError("Request body cannot be empty");
    }

    const { id } = ctx.params;
    const { body } = ctx.request;

    const activeMq = await strapi.entityService.findOne(
      "api::active-mq.active-mq",
      id
    );

    if (!activeMq) {
      return ctx.notFound("activeMq.notFound");
    }

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

    strapi
      .service("plugin::active-mq.active-mq")
      .connectActiveMq(updatedActiveMq);

    ctx.send({ data: updatedActiveMq });
  },
};
