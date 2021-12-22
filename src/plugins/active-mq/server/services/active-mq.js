const stompit = require("stompit");

module.exports = ({ strapi }) => ({
  async onSubmitHandler(bodyMessage, dataTable) {
    //console.log("strapi", strapi);
    console.log("bodyMessage", bodyMessage);
    console.log("dataTable", dataTable);

    try {
      console.log("FROM ACTIVEMQ");
      // const parsedMessage = JSON.parse(bodyMessage);

      // return await strapi
      //   .controller(`api::${dataTable}.${dataTable}`)
      //   .createIncident(parsedMessage);
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
  },

  async getSettings() {
    const entries = await strapi.entityService.findMany(
      "api::active-mq.active-mq"
    );

    return entries;
  },

  async getSetting(id) {
    console.log("findOne Services");
    const entry = await strapi.entityService.findOne(
      "api::active-mq.active-mq",
      id
    );

    return entry;
  },

  async deleteActiveMq(id) {
    const entry = await strapi.entityService.delete(
      "api::active-mq.active-mq",
      id
    );

    return entry;
  },

  async connectChannel(channel) {},

  async connectActiveMq({ name, type, dataTable, isEnabled, id }) {
    const channel = `/${type}/${name}`;

    const connectionOptions = strapi.plugin("active-mq").config("config");

    const subscribeHeaders = {
      destination: channel,
      ack: "client-individual",
    };

    if (isEnabled) {
      stompit.connect(connectionOptions, function (error, client) {
        if (error) {
          console.log("connect error " + error.message);
          return;
        }

        // if (isEnabled) {
        console.log("isEnabled", isEnabled);
        amqSubscription = client.subscribe(
          subscribeHeaders,
          function (error, message, subscription) {
            if (error) {
              strapi.log.error(error.message, {
                err: new Error("Subscription error"),
              });

              return;
            }

            console.log("coming to readString");
            // Attempt to read for any incoming messages
            message.readString("utf-8", function (error, body) {
              console.log("body", body);
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

              strapi
                .service("plugin::active-mq.active-mq")
                .onSubmitHandler(body, dataTable);

              strapi.log.info(`Successfully subscribed to ${channel}`);
              // client.disconnect();
              subscription.unsubscribe();
            });
          }
        );
      });
    } else {
      stompit.connect(connectionOptions, function (error, client) {
        if (error) {
          console.log("Unable to connect: " + error.message);
          return;
        }

        var sendParams = {
          destination: channel,
          "content-type": "application/json",
        };

        var frame = client.send(sendParams);

        frame.end(
          JSON.stringify({
            anything: "anything",
            example: true,
          })
        );

        client.disconnect(function (error) {
          if (error) {
            console.log("Error while disconnecting: " + error.message);
            return;
          }
          console.log("Sent message");
        });
      });
    }

    return;
  },
});
