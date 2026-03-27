const { Pool } = require("pg");

const pool = new Pool({
  user: "ayush",
  host: "localhost",
  database: "notifications",
  password: "",
  port: 5432,
});

module.exports = pool;