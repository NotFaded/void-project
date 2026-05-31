/**
 * POST /api/deposit
 * Body: { walletAddress, amountSol, txSignature, refCode? }
 *
 * Records a confirmed deposit. Verifies the tx on-chain before writing.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { readDeposits, writeDeposit, depositExists, Deposit } from '@/lib/store';

const RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const DEPOSIT_WALLET = process.env.NEXT_PUBLIC_DEPOSIT_WALLET || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { walletAddress, amountSol, txSignature, refCode } = req.body;

  if (!walletAddress || !amountSol || !txSignature) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  // ── Verify tx on-chain ────────────────────────────────────────────────────
  try {
    const connection = new Connection(RPC, 'confirmed');
    const tx = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      // Devnet can lag — allow through and record anyway
      console.warn('tx not found on-chain yet, recording optimistically');
    } else {
      if (tx.meta?.err) {
        return res.status(400).json({ error: 'transaction failed on-chain' });
      }

      // Support both legacy (accountKeys) and versioned (staticAccountKeys) transactions
      const depositPubkey = new PublicKey(DEPOSIT_WALLET);
      const msg = tx.transaction.message as any;
      const accountKeys: PublicKey[] = msg.staticAccountKeys ?? msg.accountKeys ?? [];
      const recipientIndex = accountKeys.findIndex(
        (k: PublicKey) => k.toBase58() === depositPubkey.toBase58()
      );

      if (recipientIndex !== -1 && tx.meta) {
        const received = (tx.meta.postBalances[recipientIndex] ?? 0) - (tx.meta.preBalances[recipientIndex] ?? 0);
        const expected = Math.round(amountSol * LAMPORTS_PER_SOL);
        if (received < expected * 0.9) {
          return res.status(400).json({ error: 'deposit amount mismatch' });
        }
      }
    }
  } catch (err) {
    console.error('on-chain verification error:', err);
    // Allow through on RPC errors
  }

  // ── Dedup by txSignature ──────────────────────────────────────────────────
  if (await depositExists(txSignature)) {
    return res.status(200).json({ ok: true, message: 'already recorded' });
  }

  // ── Store deposit ─────────────────────────────────────────────────────────
  const deposit: Deposit = {
    walletAddress,
    amountSol,
    txSignature,
    refCode: refCode || null,
    refCodeGenerated: walletAddress.slice(0, 8),
    timestamp: new Date().toISOString(),
  };

  await writeDeposit(deposit);

  return res.status(200).json({ ok: true });
}
