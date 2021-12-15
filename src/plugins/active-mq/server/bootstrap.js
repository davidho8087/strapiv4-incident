"use strict";
// const { onMessageReceived, initActiveMq } = require("./functions/activeMqFunc");

const stompit = require("stompit");

module.exports = async ({ strapi }) => {
  // bootstrap phase
  console.log("RERUN");

  let queue = null;
  let topic = null;

  const activeMqConfig = await strapi
    .store({ type: "plugin", name: "active-mq", key: "settings" })
    .get();

  // console.log("hello ");
  console.log("activeMqConfig", activeMqConfig);

  if (!activeMqConfig) {
    // console.log("run create activeMq config");
    const pluginStore = strapi.store({
      type: "plugin",
      name: "active-mq",
    });

    await pluginStore.set({
      key: "settings",
      value: {
        channel: {
          topic: process.env.ACTIVEMQ_TOPIC,
          queue: process.env.ACTIVEMQ_QUEUE,
        },
        config: {
          host: process.env.ACTIVEMQ_HOST,
          port: process.env.ACTIVEMQ_PORT,
          connectOptions: {
            host: "/",
            login: process.env.ACTIVEMQ_LOGIN,
            passcode: process.env.ACTIVEMQ_PASSCODE,
            "heart-beat": "5000,5000",
          },
          reconnectOptions: {
            maxReconnects: 10,
            initialReconnectDelay: 2000,
            maxReconnectDelay: 60000,
          },
        },
      },
    });
  } else {
    topic = activeMqConfig.channel.topic;
    queue = strapi.plugin("active-mq").config("queue");

    console.log("topic hello", topic);
    console.log("queue hello", queue);
  }

  // console.log("topic", activeMqConfig.channel.topic);
  // console.log("queue", activeMqConfig.channel.queue);

  const initActiveMq = (channel) => {
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
  };

  console.log("dont run");
  initActiveMq(process.env.ACTIVEMQ_TOPIC);
  initActiveMq(process.env.ACTIVEMQ_QUEUE);
};
