const stompit = require("stompit");

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

  async updateSettings(config) {
    console.log("config", config);

    await pluginStore.set({
      key: "settings",
      value: config,
    });

    const ActiveMqConfig = await strapi
      .store({ type: "plugin", name: "active-mq", key: "settings" })
      .get();

    return ActiveMqConfig;

    // const entry = await strapi.entityService.update(
    //   "api::active-mq.active-mq",
    //   1,
    //   {
    //     data: {
    //       topic: bodyMessage.topic,
    //     },
    //   }
    // );
    // return entry;

    //   const activeMqConfig = await strapi
    //   .store({ type: "plugin", name: "active-mq", key: "settings" })
    //   .get();

    // return activeMqConfig;
  },

  async getSettings() {
    // console.log(strapi.config.get("plugin.active-mq"));
    // return strapi.config.get("plugin.active-mq");

    const entry = await strapi.entityService.findOne(
      "api::active-mq.active-mq",
      1
    );

    return entry;
  },

  async connectChannel(channel) {
    console.log("channel", channel);
    const connectionOptions = strapi.plugin("active-mq").config("config");

    const reconnectOptions = strapi
      .plugin("active-mq")
      .config("reconnectOptions");

    const subscribeHeaders = {
      destination: channel,
      ack: "client-individual",
    };

    const servers = [connectionOptions];

    // Initialize ConnectFailedOver
    const manager = new stompit.ConnectFailover(servers, reconnectOptions);

    // log connection status
    manager.on("connecting", function (connector) {
      strapi.log.info(
        `Connecting to ${connector.serverProperties.remoteAddress.transportPath} - ${channel}`
      );
    });

    // log if connected
    manager.on("connect", function (connector) {
      strapi.log.info(
        `Connected to ${connector.serverProperties.remoteAddress.transportPath} - ${channel}`
      );
    });

    // log if on error
    manager.on("error", function (error) {
      const connectArgs = error.connectArgs;
      const address = connectArgs.host + ":" + connectArgs.port;

      strapi.log.warn(
        `Connection error to ${address} : ${error.message} - ${channel}`
      );
    });

    //Connect to MQ Service
    manager.connect(function (error, client, reconnect) {
      if (error) {
        const errorPayload = {
          module: "ActiveMq",
          type: "error",
          message: error.message,
          port: connectionOptions.port,
          host: connectionOptions.host,
          connectArgs: connectionOptions,
          channel: channel,
        };

        strapi.log.error(error.message, {
          err: new Error(`Failed to connect: ${error.message}`),
          detail: errorPayload,
        });

        return;
      }

      client.on("error", function (error) {
        strapi.log.warn("Connection lost. Reconnecting...");
        reconnect();
      });

      client.subscribe(subscribeHeaders, function (error, message) {
        if (error) {
          strapi.log.error(error.message, {
            err: new Error("Subscription error"),
          });

          return;
        }

        console.log("coming to readString");
        // Attempt to read for any incoming messages
        message.readString("utf-8", function (error, body) {
          if (error) {
            strapi.log.error(error.message, {
              err: new Error("Read message error"),
            });

            return;
          }
          //Called to inform Client that the Message is received...
          client.ack(message);

          //Send the Message to Callback
          console.log("coming to Service");
          // callback(body);
          strapi.service("plugin::active-mq.active-mq").onSubmitHandler(body);

          strapi.log.info(`Successfully subscribed to ${channel}`);
        });
      });
    });
  },
});
