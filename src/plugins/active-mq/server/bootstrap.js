"use strict";
// const { onMessageReceived, initActiveMq } = require("./functions/activeMqFunc");

const stompit = require("stompit");

module.exports = ({ strapi }) => {
  // bootstrap phase

  const topic = strapi.plugin("active-mq").config("topic");
  const queue = strapi.plugin("active-mq").config("queue");

  const initActiveMq = (channel, callback) => {
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
          callback(body);

          strapi.log.info(`Successfully subscribed to ${channel}`);
        });
      });
    });
  };

  const onMessageReceived = async (message) => {
    try {
      console.log("FROM ACTIVEMQ");
      const parsedMessage = JSON.parse(message);

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
  };

  initActiveMq(queue, onMessageReceived);
  initActiveMq(topic, onMessageReceived);
};
