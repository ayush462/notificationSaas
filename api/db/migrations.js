require("dotenv").config(); // ✅ MUST BE FIRST

const fs = require("fs");
const path = require("path");
const pool = require("./pool");

console.log("Using DB:", process.env.DATABASE_URL);

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Migrations completed");
  process.exit(0);
})().catch((e) => {
  console.error("Migration failed", e);
  process.exit(1);
});