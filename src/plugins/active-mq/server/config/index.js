"use strict";

module.exports = {
  default: {
    topic: process.env.ACTIVEMQ_TOPIC,
    queue: process.env.ACTIVEMQ_QUEUE,
    config: {
      host: process.env.ACTIVEMQ_HOST,
      port: process.env.ACTIVEMQ_PORT,
      connectOptions: {
        host: "/",
        login: process.env.ACTIVEMQ_LOGIN,
        passcode: process.env.ACTIVEMQ_PASSCODE,
        "heart-beat": "5000,5000",
      },
    },
    reconnectOptions: {
      maxReconnects: 10,
      initialReconnectDelay: 2000,
      maxReconnectDelay: 60000,
    },
  },
};
