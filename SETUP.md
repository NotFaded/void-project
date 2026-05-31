# VØID — Setup Guide

## 1. Install dependencies

```bash
npm install
# Also install polyfills required for Solana in Next.js:
npm install crypto-browserify stream-browserify url browserify-zlib stream-http https-browserify assert os-browserify path-browserify
```

## 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_DEPOSIT_WALLET` | Your Solana wallet address that receives deposits |
| `NEXT_PUBLIC_DEPOSIT_AMOUNT_SOL` | Amount users must send (e.g. `0.1`) |
| `NEXT_PUBLIC_REVEAL_DATE` | ISO date of reveal (e.g. `2026-07-01T00:00:00Z`) |
| `NEXT_PUBLIC_SOLANA_RPC` | RPC endpoint (devnet for testing, mainnet for production) |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (for referral links) |

## 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Use **devnet** for testing — switch `NEXT_PUBLIC_SOLANA_RPC` to:
```
https://api.devnet.solana.com
```
And get free devnet SOL at: https://faucet.solana.com

## 4. Deploy

**Vercel (recommended):**
```bash
npx vercel
```
Set all `NEXT_PUBLIC_*` env vars in the Vercel dashboard.

**Note:** The file-based `data/deposits.json` store won't work on Vercel (ephemeral filesystem). For production, swap `lib/store.ts` to use Supabase, PlanetScale, or Upstash Redis. The interface is the same — just replace `readDeposits` / `writeDeposits`.

## 5. Referral system

- Every depositor automatically gets a referral code (first 8 chars of their wallet address)
- Their referral link: `https://yoursite.com/?ref=<code>`
- If someone visits via a referral link and deposits, it's attributed to the referrer
- Check referral counts: `GET /api/referral?code=<code>`

## File structure

```
void-project/
├── pages/
│   ├── _app.tsx          # Wallet provider setup
│   ├── index.tsx         # Full one-page site
│   └── api/
│       ├── stats.ts      # GET total SOL + participants
│       ├── deposit.ts    # POST record deposit (with on-chain verification)
│       └── referral.ts   # GET referral count by code
├── lib/
│   └── store.ts          # Data layer (swap for real DB in production)
├── styles/
│   └── globals.css       # Glitch, scanline, glow effects
├── data/
│   └── deposits.json     # Auto-created on first deposit (local only)
├── .env.example
└── SETUP.md
```
