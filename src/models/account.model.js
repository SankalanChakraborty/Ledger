import pool from "../db/db";

export const createAccount = async ({ user_id, type, currency }) => {
  const { rows } = await pool.query(
    "INSERT INTO accounts (user_id, type, currency) values ($1,$2,$3)",
    [user_id, type, currency],
  );

  return rows[0];
};

export const findAccountByUserId = async (user_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM accounts WHERE user_id = ($1)",
    [user_id],
  );
  return rows[0] || null;
};

export const findAccountById = async ({ id, user_id }) => {
  const { rows } = await pool.query(
    "SELECT * FROM accounts WHERE id = ($1) and user_id = ($2)",
    [id, user_id],
  );
  return rows[0] || null;
};

export const getAccountBalance = async (id) => {
  const totalCreditResult = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) FROM ledger_entries WHERE account_id = $1 AND direction = 'CREDIT'",
    [id],
  );
  const totalDebitResult = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) FROM ledger_entries WHERE account_id = $1 AND direction = 'DEBIT'",
    [id],
  );

  const totalCredit = Number(totalCreditResult.rows[0].sum);
  const totalDebit = Number(totalDebitResult.rows[0].sum);

  const accountBalance = totalCredit - totalDebit;

  return accountBalance;
};
