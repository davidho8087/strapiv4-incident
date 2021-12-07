module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'e408afb53462ad34c87ecd5f709b0619'),
  },
});
