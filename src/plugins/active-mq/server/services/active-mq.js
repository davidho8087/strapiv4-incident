const stompit = require("stompit");

module.exports = ({ strapi }) => ({
  async onSubmitHandler(bodyMessage, dataTable) {
    return await strapi
      .controller(`api::${dataTable}.${dataTable}`)
      .createIncident(bodyMessage);
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

  async connectActiveMq({ name, type, dataTable, isEnabled }) {
    // initialise destination
    const destination = `/${type}/${name}`;

    const connectionOptions = strapi.plugin("active-mq").config("config");

    const subscribeHeaders = {
      destination,
      ack: "client-individual",
    };

    if (isEnabled) {
      stompit.connect(connectionOptions, function (error, client) {
        if (error) {
          strapi.log.error("connect error " + error.message);
          return;
        }

        amqSubscription = client.subscribe(
          subscribeHeaders,
          function (error, message, subscription) {
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

              try {
                const parsedMessage = JSON.parse(body);

                if (!parsedMessage?.example) {
                  strapi
                    .service("plugin::active-mq.active-mq")
                    .onSubmitHandler(parsedMessage, dataTable);

                  strapi.log.info(`Subscribed to ${destination}`);
                } else {
                  subscription.unsubscribe();
                  strapi.log.info(`Unsubcribe to ${destination}`);
                }
              } catch (error) {
                strapi.log.error(error);
              }
            });
          }
        );
      });
    } else {
      stompit.connect(connectionOptions, function (error, client) {
        if (error) {
          strapi.log.error("Unable to connect: " + error.message);
          return;
        }

        const sendParams = {
          destination,
          "content-type": "application/json",
        };

        const frame = client.send(sendParams);

        frame.end(
          JSON.stringify({
            anything: "anything",
            example: true,
          })
        );

        client.disconnect(function (error) {
          if (error) {
            strapi.log.warn("Error while disconnecting: " + error.message);
            return;
          }
          strapi.log.info("Sent message");
        });
      });
    }

    return;
  },
});
