// path: ./src/api/restaurant/routes/custom-restaurant.js

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/incident/createIncident",
      handler: "incident.createIncident",
      config: {
        policies: [
          // point to a registered policy
        ],
      },
    },
  ],
};
