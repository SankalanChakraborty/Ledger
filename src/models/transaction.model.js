import pool from "../db/db.js";

export const createTransaction = async ({
  user_id,
  description = "",
  occurredAt,
  entries,
  idempotencyKey,
}) => {
  // if idempotency key is provided then check if the transaction already exists
  if (idempotencyKey) {
    const { rows } = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 AND idempotency_key = $2",
      [user_id, idempotencyKey],
    );
    if (rows[0]) {
      return getExistingTransaction(rows[0].id, user_id);
    }
  }

  // A transaction must have total credit amount = total debit amount
  const totalDebits = entries
    .filter((e) => e.direction === "DEBIT")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalCredits = entries
    .filter((e) => e.direction === "CREDIT")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  if (totalDebits !== totalCredits) {
    throw new Error(
      `Unbalanced transaction: debits (${totalDebits}) !== credits (${totalCredits})`,
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: txRows } = await client.query(
      "INSERT INTO transactions (user_id, description, status, idempotency_key, occurred_at) VALUES ($1, $2, 'PENDING', $3, COALESCE($4, now())) ON CONFLICT (user_id, idempotency_key) DO NOTHING RETURNING *",
      [user_id, description, idempotencyKey, occurredAt],
    );

    //conflict - where same trnsaction is re-tried due to delay of the first transaction
    if (!txRows[0]) {
      await client.query("ROLLBACK");
      const { rows } = await pool.query(
        "SELECT * FROM transactions where user_id = $1 AND idempotency_key = $2",
        [user_id, idempotencyKey],
      );
      return getExistingTransaction(rows[0].id, user_id);
    }

    const transaction = txRows[0];
    const insertedEntries = [];

    for (const entry of entries) {
      const { rows } = await client.query(
        "INSERT INTO ledger_entries (transaction_id, account_id, direction, amount) VALUES ($1, $2, $3, $4) RETURNING *",
        [transaction.id, entry.accountId, entry.direction, entry.amount],
      );
      insertedEntries.push(rows[0]);
    }

    const { rows: updatedRows } = await client.query(
      `UPDATE transactions SET status = 'COMPLETED' WHERE id = $1 RETURNING *`,
      [transaction.id],
    );

    await client.query("COMMIT");
    return { ...updatedRows[0], entries: insertedEntries };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getAllTransactionsById = async (user_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM transactions WHERE user_id = $1",
    [user_id],
  );
  return rows || null;
};

export const getExistingTransaction = async (id, user_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
    [id, user_id],
  );
  if (!rows[0]) return null;
  const { rows: entryRows } = await pool.query(
    "SELECT * FROM ledger_entries WHERE transaction_id = $1",
    [id],
  );

  return { ...rows[0], entries: entryRows };
};
