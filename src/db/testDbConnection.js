import pool from "./db.js";

async function main() {
  const result = await pool.query("SELECT NOW()");
  console.log("Connected:", result.rows[0]);
  await pool.end();
}

main().catch(console.error);
