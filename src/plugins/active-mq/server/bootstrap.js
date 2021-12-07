"use strict";
// const { onMessageReceived, initActiveMq } = require("./functions/activeMqFunc");

const stompit = require("stompit");

module.exports = ({ strapi }) => {
  // bootstrap phase

  const topic = strapi.plugin("active-mq").config("topic");
  const queue = strapi.plugin("active-mq").config("queue");

  const initActiveMq = (channel, callback) => {
    const connectionOptions = strapi.plugin("active-mq").config("config");
    console.log("initialise");
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
      // logger.info(
      //   `Connecting to ${connector.serverProperties.remoteAddress.transportPath} - ${channel}`
      // );
    });

    // log if connected
    manager.on("connect", function (connector) {
      strapi.log.info(
        `Connected to ${connector.serverProperties.remoteAddress.transportPath} - ${channel}`
      );
      // logger.info(
      //   `Connected to ${(connector.serverProperties.remoteAddress.transportPath)} - ${channel}`
      // );
    });

    // log if on error
    manager.on("error", function (error) {
      const connectArgs = error.connectArgs;
      const address = connectArgs.host + ":" + connectArgs.port;

      // logger.warn(
      //   `Connection error to ${address} : ${error.message} - ${channel}`
      // );
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

        // logger.error(error.message, {
        //   err: new Error(`Failed to connect: ${error.message}`),
        //   detail: errorPayload,
        // });

        return;
      }

      client.on("error", function (error) {
        //  logger.warn("Connection lost. Reconnecting...");
        reconnect();
      });

      client.subscribe(subscribeHeaders, function (error, message) {
        if (error) {
          //  logger.error(error.message, { err: new Error("Subscription error") });

          return;
        }

        // Attempt to read for any incoming messages
        message.readString("utf-8", function (error, body) {
          if (error) {
            // logger.error(error.message, {
            //   err: new Error("Read message error"),
            // });

            return;
          }
          //Called to inform Client that the Message is received...
          client.ack(message);

          //Send the Message to Callback
          callback(body);

          // logger.info(`Successfully subscribed to ${channel}`);
        });
      });
    });
  };

  const onMessageReceived = async (message) => {
    //To handle unexpected message
    let vatesMessage;

    try {
      // Json parse
      vatesMessage = JSON.parse(message);

      // Log to kibana
      strapi.winLog.info("vaEvents", vatesMessage);
    } catch (error) {
      // logger.error(message, {
      //   err: new Error("Parse Json message failed"),
      // });

      return;
    }

    const vatesEvents = vatesMessage?.vaEvents;

    if (!Array.isArray(vatesEvents)) {
      const errorPayload = {
        module: "ActiveMq",
        type: "error",
        port: connectionOptions.port,
        host: connectionOptions.host,
        connectArgs: connectionOptions,
        body: message,
      };

      // logger.error("Invalid message format", {
      //   err: new Error("Invalid message format"),
      //   detail: errorPayload,
      // });

      return;
    }

    const messageTypes = vatesEvents
      .map((e) => e.messageType)
      .filter((value, index, self) => self.indexOf(value) === index);

    if (messageTypes.length > 1) {
      // Throws Expection OR ignore message, and return
      // Current logic doesnt support multiple messageType

      const errorPayload = {
        module: "ActiveMq",
        type: "error",
        port: connectionOptions.port,
        host: connectionOptions.host,
        connectArgs: connectionOptions,
        body: messageTypes,
      };

      // logger.error("Unable to support multiple message type!", {
      //   err: new Error("Unable to support multiple message type!"),
      //   detail: errorPayload,
      // });

      return;
    }

    if (messageTypes[0] === "interval") {
      await processIntervalMessage(vatesEvents);
      return;
    }

    try {
      // await createIncident(JSON.parse(message));
    } catch (error) {
      // logger.error("Failed to create Incident from ActiveMq", { error });
      return;
    }
  };

  const processIntervalMessage = async (vatesEvents) => {
    const vatesCameraEvents = vatesEvents.reduce(
      (accumulator, currentValue) => {
        if (!accumulator[currentValue.camera])
          accumulator[currentValue.camera] = [];
        accumulator[currentValue.camera].push(currentValue);
        return accumulator;
      },
      {}
    );

    let formmattedEventList = [];

    for (const [key, value] of Object.entries(vatesCameraEvents)) {
      const vatesDescriptionEvents = value.reduce(
        (accumulator, currentValue) => {
          if (!accumulator[currentValue.vaDescription])
            accumulator[currentValue.vaDescription] = [];
          accumulator[currentValue.vaDescription].push(currentValue);
          return accumulator;
        },
        {}
      );

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

    const newVatesMessage = { vaEvents: formmattedEventList };

    try {
      console.log(newVatesMessage);
      // await createIncident(newVatesMessage);
    } catch (error) {
      // logger.error(error.message, {
      //   err: new Error("Failed to create incident"),
      // });

      return;
    }
  };

  initActiveMq(queue, onMessageReceived);
  initActiveMq(topic, onMessageReceived);
};