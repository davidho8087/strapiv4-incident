module.exports = ({ env }) => [
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::favicon",
  "strapi::public",

  // {
  //   name: "strapi::cors",
  //   config: {
  //     credentials: true,
  //     origin: [
  //       "http://localhost:3000",
  //       "http://localhost:1337",
  //       "http://192.168.8.229:1337",
  //       "http://localhost:8080",
  //     ],
  //   },
  // },

  {
    name: "strapi::security",
    config: {
      crossOriginOpenerPolicy: true,
    },
  },
];
