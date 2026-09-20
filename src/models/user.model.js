import pool from "../db/db";

export const createUser = async ({ name, email, passwordhash }) => {
  const { rows } = await pool.query(
    "INSET INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
    [name, email, passwordhash],
  );
  return rows[0];
};

export const findUserById = async ({ id }) => {
  const { rows } = await pool.query("SELECT * FROM users where id = ($1)", [
    id,
  ]);
  return rows[0] || null;
};

export const findUserByEmail = async ({ email }) => {
  const { rows } = await pool.query("SELECT * FROM users where email = ($1)", [
    email,
  ]);
  return rows[0] || null;
};
