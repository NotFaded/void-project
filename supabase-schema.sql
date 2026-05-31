-- Run this in Supabase → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS deposits (
  id                 BIGSERIAL PRIMARY KEY,
  wallet_address     TEXT NOT NULL,
  amount_sol         DECIMAL(18, 9) NOT NULL,
  tx_signature       TEXT NOT NULL UNIQUE,
  ref_code           TEXT,
  ref_code_generated TEXT NOT NULL,
  timestamp          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast referral lookups
CREATE INDEX IF NOT EXISTS idx_deposits_ref_code ON deposits(ref_code);

-- Index for fast dedup checks
CREATE INDEX IF NOT EXISTS idx_deposits_tx_sig ON deposits(tx_signature);

-- Disable RLS (this table is only accessed server-side via service key)
ALTER TABLE deposits DISABLE ROW LEVEL SECURITY;
