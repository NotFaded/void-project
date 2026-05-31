/**
 * GET /api/referral?code=XXXXXXXX
 * Returns number of confirmed deposits attributed to this referral code.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { readDeposits } from '@/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code is required' });
  }

  const deposits = await readDeposits();
  const count = deposits.filter((d) => d.refCode === code).length;

  return res.status(200).json({ code, referrals: count });
}
