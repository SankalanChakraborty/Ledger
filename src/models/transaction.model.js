import pool from "../db/db";

export const createTransaction = async ({ user_id, description = "" }) => {
  const { rows } = await pool.query(
    "INSERT INTO TABLE transactions (user_id, description) VALUES ($1.$2)",
    [user_id, description],
  );
  return rows[0];
};

export const getAllTransactions = async () => {
  const { rows } = await pool.query("SELECT * FROM transactions");
  return rows || null;
};

export const getTransactionsByUserId = async (user_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM transactions WHERE user_id = ($1)",
    [user_id],
  );
  return rows[0] || null;
};
