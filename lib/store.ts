/**
 * Data store — Supabase Postgres (production) with JSON file fallback (local dev).
 *
 * Set SUPABASE_URL + SUPABASE_SERVICE_KEY in .env.local to use Supabase.
 * Without those vars it falls back to the local data/deposits.json file.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export interface Deposit {
  walletAddress: string;
  amountSol: number;
  txSignature: string;
  refCode: string | null;
  refCodeGenerated: string;
  timestamp: string;
}

// ── Supabase client (server-side only — uses service key) ─────────────────────
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ── Local JSON fallback ───────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data');
const DEPOSITS_FILE = path.join(DATA_DIR, 'deposits.json');

function localRead(): Deposit[] {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DEPOSITS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DEPOSITS_FILE, 'utf8')); } catch { return []; }
}

function localWrite(deposits: Deposit[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits, null, 2), 'utf8');
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function readDeposits(): Promise<Deposit[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('deposits')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) { console.error('supabase read error:', error); return []; }
    return (data ?? []).map((row: any) => ({
      walletAddress: row.wallet_address,
      amountSol: row.amount_sol,
      txSignature: row.tx_signature,
      refCode: row.ref_code,
      refCodeGenerated: row.ref_code_generated,
      timestamp: row.timestamp,
    }));
  }
  return localRead();
}

export async function writeDeposit(deposit: Deposit): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('deposits').insert({
      wallet_address: deposit.walletAddress,
      amount_sol: deposit.amountSol,
      tx_signature: deposit.txSignature,
      ref_code: deposit.refCode,
      ref_code_generated: deposit.refCodeGenerated,
      timestamp: deposit.timestamp,
    });
    if (error) throw new Error(`supabase write error: ${error.message}`);
    return;
  }
  // fallback: read all, append, write
  const all = localRead();
  all.push(deposit);
  localWrite(all);
}

export async function depositExists(txSignature: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from('deposits')
      .select('tx_signature')
      .eq('tx_signature', txSignature)
      .maybeSingle();
    return !!data;
  }
  return localRead().some((d) => d.txSignature === txSignature);
}
