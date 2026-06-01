/**
 * GET /api/stats
 * Returns total SOL deposited and number of unique participants.
 *
 * The displayed numbers = REAL deposits + a slow time-based "momentum" baseline.
 * The baseline drifts upward gradually from a fixed launch anchor so the page
 * never looks dead between real deposits. Tune the constants below.
 *
 * Data is stored via lib/store (Supabase in prod, JSON file in local dev).
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { readDeposits } from '@/lib/store';

// ── Baseline tuning ─────────────────────────────────────────────────────────
// Anchor: when the baseline starts counting from zero. Set to your launch date.
const LAUNCH_ISO = process.env.NEXT_PUBLIC_LAUNCH_DATE || '2026-06-01T00:00:00Z';

// Starting "seed" so the site doesn't open at 0/0.
const SEED_PARTICIPANTS = 38;
const SEED_SOL = 9.4;

// Growth rates (slow). One new "participant" roughly every N minutes.
const MINUTES_PER_PARTICIPANT = 42; // ~34 per day
// Average SOL each synthetic participant contributes to the baseline total.
const SOL_PER_PARTICIPANT = 0.21;

// ── Deterministic jitter ──────────────────────────────────────────────────────
// Same input -> same output, so the number never jumps backwards on refresh.
function seededNoise(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

function baseline(now: number): { sol: number; participants: number } {
  const launch = new Date(LAUNCH_ISO).getTime();
  const elapsedMin = Math.max(0, (now - launch) / 60000);

  // Participants grow linearly with a tiny smooth wobble so it's not perfectly steady.
  const rawParticipants = SEED_PARTICIPANTS + elapsedMin / MINUTES_PER_PARTICIPANT;
  const participants = Math.floor(rawParticipants);

  // SOL grows with participants, plus small per-participant jitter so the
  // average deposit looks organic rather than a flat multiple.
  const jitter = (seededNoise(participants) - 0.5) * SOL_PER_PARTICIPANT * 0.6;
  const sol = SEED_SOL + (participants - SEED_PARTICIPANTS) * SOL_PER_PARTICIPANT + jitter;

  return { sol: Math.max(SEED_SOL, sol), participants };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const deposits = await readDeposits();
  const realSol = deposits.reduce((sum, d) => sum + d.amountSol, 0);
  const realParticipants = new Set(deposits.map((d) => d.walletAddress)).size;

  const base = baseline(Date.now());

  const totalSol = parseFloat((realSol + base.sol).toFixed(4));
  const participants = realParticipants + base.participants;

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ totalSol, participants });
}
