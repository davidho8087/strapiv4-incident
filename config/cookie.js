module.exports = ({ env }) => ({
  config: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 Day Age
    overwrite: true,
  },
});
