module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgres://postgres@localhost/xword",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL || "postgres://postgres@localhost/xword-test",
  JWT_SECRET: process.env.JWT_SECRET || "you-will-never-guess",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "2h",
};
