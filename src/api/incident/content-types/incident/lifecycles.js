module.exports = {
  async afterCreate(event) {
    const { result, params } = event;
    // console.log("what is result", result);

    // do something to the result;
    if (result) {
      // if (strapi.io) {
      //   strapi.io.sockets.emit("newIncident", result);
      // }
      //const hello =  strapi.service("plugin::socket-io.my-service");
      const hello2 = strapi.plugin("socket-io").service("socketIO");

      console.log("hello", hello2);
      // try {
      //   const hello = await strapi.plugin("socket-io").bootstrap("socketIO");
      //   console.log("hello", hello);
      // } catch (error) {}

      await strapi.entityService.create("api::notification.notification", {
        data: {
          title: result.incidentName,
          content: result.incidentDescription,
          type: result.incidentType,
          link: "",
        },
      });
    }
  },
};
