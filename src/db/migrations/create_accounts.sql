CREATE TYPE account_type AS ENUM('SAVINGS', 'CURRENT', 'EQUITY');
CREATE TYPE currency_type AS ENUM('INR', 'USD', 'AUD');
CREATE TYPE account_status AS ENUM('ACTIVE', 'FROZEN');

CREATE TABLE accounts(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type account_type NOT NULL,
    status account_status NOT NULL DEFAULT 'ACTIVE',
    currency currency_type NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);