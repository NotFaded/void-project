/**
 * GET /api/stats
 * Returns total SOL deposited and number of unique participants.
 *
 * Data is stored in data/deposits.json — swap this for a real DB
 * (Supabase, PlanetScale, Redis, etc.) for production.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { readDeposits } from '@/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const deposits = await readDeposits();
  const totalSol = deposits.reduce((sum, d) => sum + d.amountSol, 0);
  const participants = new Set(deposits.map((d) => d.walletAddress)).size;

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ totalSol, participants });
}
