module.exports = ({ strapi }) => ({
  async onSubmitHandler(bodyMessage) {
    //console.log("strapi", strapi);
    console.log(bodyMessage);

    try {
      console.log("FROM ACTIVEMQ");
      const parsedMessage = JSON.parse(bodyMessage);

      return await strapi
        .controller("api::incident.incident")
        .createIncident(parsedMessage);
      // await createIncident(JSON.parse(message));
    } catch (error) {
      // const errorPayload = {
      //   module: "ActiveMq",
      //   type: "error",
      //   port: connectionOptions.port,
      //   host: connectionOptions.host,
      //   connectArgs: connectionOptions,
      //   body: message,
      // };
      strapi.log.error(error);
      // strapi.log.error("Failed Message", {
      //   err: new Error("Failed Message"),
      //   detail: errorPayload,
      // });

      return;
    }
  },
});
