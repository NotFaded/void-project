import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useRouter } from 'next/router';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
);

// ── Config ────────────────────────────────────────────────────────────────────
const DEPOSIT_WALLET = process.env.NEXT_PUBLIC_DEPOSIT_WALLET || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://void.xyz';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Stats {
  totalSol: number;
  participants: number;
}

// ── TBA Reveal display ────────────────────────────────────────────────────────
function TBAReveal() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="glitch text-6xl md:text-8xl font-mono font-bold text-white glow-text-white"
        data-text="T B A"
        style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.4em' }}
      >
        T B A
      </div>
      <span
        className="text-xs tracking-[0.4em] text-void-dim uppercase"
        style={{ fontFamily: "'JetBrains Mono', monospace", animation: 'flicker 3s infinite' }}
      >
        when it happens, you&apos;ll know
      </span>
    </div>
  );
}

// ── Live stats counter ────────────────────────────────────────────────────────
function LiveStats({ stats }: { stats: Stats | null }) {
  const [displayed, setDisplayed] = useState<Stats>({ totalSol: 0, participants: 0 });

  useEffect(() => {
    if (!stats) return;
    // Animate number up
    let frame = 0;
    const frames = 30;
    const start = displayed;
    const id = setInterval(() => {
      frame++;
      const t = frame / frames;
      setDisplayed({
        totalSol: parseFloat((start.totalSol + (stats.totalSol - start.totalSol) * t).toFixed(4)),
        participants: Math.round(start.participants + (stats.participants - start.participants) * t),
      });
      if (frame >= frames) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  return (
    <div className="flex gap-12 md:gap-24 justify-center">
      <div className="text-center">
        <div
          className="counter-digit text-3xl md:text-4xl font-mono font-bold text-white glow-text"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {displayed.totalSol.toFixed(2)}
          <span className="text-void-accent text-xl ml-1">◎</span>
        </div>
        <div className="text-xs tracking-[0.2em] text-void-dim mt-1 uppercase">
          total deposited
        </div>
      </div>
      <div className="w-px bg-void-border" />
      <div className="text-center">
        <div
          className="counter-digit text-3xl md:text-4xl font-mono font-bold text-white"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {displayed.participants}
        </div>
        <div className="text-xs tracking-[0.2em] text-void-dim mt-1 uppercase">
          participants
        </div>
      </div>
    </div>
  );
}

// ── FAQ item ──────────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-void-border cursor-pointer group"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center py-4">
        <span
          className="text-sm text-void-text group-hover:text-white transition-colors tracking-wide"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {q}
        </span>
        <span className="text-void-dim text-xs ml-4 shrink-0">{open ? '−' : '+'}</span>
      </div>
      {open && (
        <p
          className="text-void-dim text-sm pb-4 leading-relaxed"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

// ── Referral share panel ──────────────────────────────────────────────────────
function ReferralPanel({ refCode }: { refCode: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${SITE_URL}/?ref=${refCode}`;
  const tweet = encodeURIComponent(
    `i entered the void.\n\nsomething is coming.\n\n${link}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweet}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 border border-void-accent border-opacity-30 bg-void-surface p-6 rounded-sm glow-purple">
      <p
        className="text-xs tracking-[0.2em] text-void-accent uppercase mb-4"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        ▸ you are in. share the signal.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 bg-black border border-void-border text-void-dim text-xs px-3 py-2 rounded-sm font-mono outline-none truncate"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
        <button
          onClick={copy}
          className="border border-void-border text-void-dim text-xs px-4 py-2 hover:border-void-accent hover:text-white transition-all"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <div className="flex gap-3 mt-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs border border-void-border text-void-dim px-4 py-2 hover:border-void-accent hover:text-white transition-all"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          post on X
        </a>
        <a
          href={`https://warpcast.com/~/compose?text=${tweet}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs border border-void-border text-void-dim px-4 py-2 hover:border-void-accent hover:text-white transition-all"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          cast on Farcaster
        </a>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [incomingRef, setIncomingRef] = useState('');
  const [depositAmount, setDepositAmount] = useState('0.1');

  useEffect(() => { setMounted(true); }, []);

  // ── Read ?ref= from URL on mount ─────────────────────────────────────────
  useEffect(() => {
    const ref = router.query.ref as string;
    if (ref) {
      setIncomingRef(ref);
      localStorage.setItem('void_ref', ref);
    } else {
      const stored = localStorage.getItem('void_ref');
      if (stored) setIncomingRef(stored);
    }
  }, [router.query]);

  // ── Generate ref code from wallet ────────────────────────────────────────
  useEffect(() => {
    if (publicKey) {
      // Use first 8 chars of base58 pubkey as ref code
      setRefCode(publicKey.toBase58().slice(0, 8));
    }
  }, [publicKey]);

  // ── Poll stats every 15s ─────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 15_000);
    return () => clearInterval(id);
  }, [fetchStats]);

  // ── Deposit ──────────────────────────────────────────────────────────────
  const handleDeposit = async () => {
    if (!publicKey || !signTransaction || !DEPOSIT_WALLET) return;
    const parsedAmount = parseFloat(depositAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setDepositError('enter a valid SOL amount.');
      return;
    }
    setDepositing(true);
    setDepositError('');

    try {
      const recipient = new PublicKey(DEPOSIT_WALLET);
      const lamports = Math.round(parsedAmount * LAMPORTS_PER_SOL);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports,
        })
      );
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign with wallet, then send raw — avoids StandardWalletAdapter bugs
      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      // Wait for confirmation
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      // Record deposit server-side
      await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          amountSol: parsedAmount,
          txSignature: signature,
          refCode: incomingRef || null,
        }),
      });

      setDepositSuccess(true);
      fetchStats();
    } catch (err: unknown) {
      console.error('deposit error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('cancelled')) {
        setDepositError('transaction cancelled.');
      } else if (msg.toLowerCase().includes('insufficient')) {
        setDepositError('insufficient SOL balance. get devnet SOL at faucet.solana.com');
      } else {
        setDepositError(msg || 'transaction failed. check console for details.');
      }
    } finally {
      setDepositing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>VØID</title>
        <meta name="description" content="something is coming. you won't see it until it's too late." />
        <meta property="og:title" content="VØID" />
        <meta property="og:description" content="something is coming. you won't see it until it's too late." />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>◉</text></svg>" />
      </Head>

      <div className="scanline-overlay noise min-h-screen bg-black relative">

        {/* ── Background radial glow ──────────────────────────────── */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.06) 0%, transparent 60%)',
          }}
        />

        {/* ── Nav ────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-void-border bg-black bg-opacity-80 backdrop-blur-sm">
          <span
            className="text-white font-mono text-sm tracking-[0.3em] font-bold"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            VØID
          </span>
          {mounted && <WalletMultiButton />}
        </nav>

        {/* ── SECTION 1: Hero ─────────────────────────────────────── */}
        <section className="flex flex-col items-center justify-center min-h-screen pt-20 px-6 text-center">
          <p
            className="text-xs tracking-[0.5em] text-void-dim uppercase mb-8"
            style={{ fontFamily: "'JetBrains Mono', monospace", animation: 'flicker 5s infinite' }}
          >
            ◈ signal detected ◈
          </p>

          <h1
            className="glitch text-7xl md:text-[10rem] font-bold tracking-tight leading-none mb-4"
            data-text="VØID"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: '#fff',
            }}
          >
            VØID
          </h1>

          <p
            className="text-void-dim text-sm md:text-base tracking-widest mt-6 max-w-md leading-loose"
            style={{ fontFamily: "'JetBrains Mono', monospace', monospace" }}
          >
            something is coming.<br />
            you won&apos;t see it until it&apos;s too late.
          </p>

          <hr className="void-divider w-48 my-12" />

          {/* TBA Reveal */}
          <p
            className="text-xs tracking-[0.4em] text-void-dim uppercase mb-8"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            R E V E A L
          </p>
          <TBAReveal />

          <button
            onClick={() => document.getElementById('participate')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-16 text-xs tracking-[0.3em] text-void-dim hover:text-white border border-void-border hover:border-void-accent px-8 py-3 transition-all uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            enter the void
          </button>
        </section>

        {/* ── SECTION 2: Live stats ───────────────────────────────── */}
        <section className="py-16 border-t border-b border-void-border bg-void-surface">
          <LiveStats stats={stats} />
        </section>

        {/* ── SECTION 3: Participate ──────────────────────────────── */}
        <section id="participate" className="max-w-lg mx-auto px-6 py-24">
          <p
            className="text-xs tracking-[0.4em] text-void-accent uppercase mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ▸ participate
          </p>
          <h2
            className="text-2xl text-white font-mono mb-6"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            enter the signal
          </h2>
          <p
            className="text-void-dim text-sm leading-relaxed mb-8"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            deposit any amount of SOL to register your presence.
            <br />
            the address is fixed. the reveal is not.
          </p>

          {!mounted ? null : !connected ? (
            <div className="text-center py-8">
              <WalletMultiButton />
              <p
                className="text-void-dim text-xs mt-4"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                phantom wallet required
              </p>
            </div>
          ) : depositSuccess ? (
            <div>
              <div
                className="border border-void-accent border-opacity-40 p-4 text-sm text-void-accent"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ▸ you are in the void. wait for the signal.
              </div>
              <ReferralPanel refCode={refCode} />
            </div>
          ) : (
            <div>
              <div
                className="border border-void-border bg-void-surface p-4 mb-6 text-xs text-void-dim"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <span>amount (SOL)</span>
                  <input
                    type="number"
                    min="0.001"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="bg-black border border-void-border text-white text-right px-3 py-1 w-32 outline-none focus:border-void-accent transition-colors"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    placeholder="0.1"
                  />
                </div>
                <div className="flex justify-between mb-2">
                  <span>recipient</span>
                  <span className="text-white truncate ml-4 max-w-[180px]">
                    {DEPOSIT_WALLET
                      ? `${DEPOSIT_WALLET.slice(0, 6)}…${DEPOSIT_WALLET.slice(-4)}`
                      : 'not configured'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>wallet</span>
                  <span className="text-void-accent">
                    {publicKey
                      ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-4)}`
                      : '—'}
                  </span>
                </div>
              </div>

              {depositError && (
                <p
                  className="text-red-500 text-xs mb-4"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ✕ {depositError}
                </p>
              )}

              <button
                onClick={handleDeposit}
                disabled={depositing || !DEPOSIT_WALLET || !signTransaction}
                className="w-full border border-void-accent text-white py-4 text-sm tracking-[0.2em] uppercase hover:bg-void-accent hover:bg-opacity-10 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-purple"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {depositing ? 'confirming…' : `deposit ${depositAmount || '?'} SOL`}
              </button>
            </div>
          )}
        </section>

        {/* ── SECTION 4: Lore ─────────────────────────────────────── */}
        <section className="border-t border-void-border bg-void-surface py-20 px-6">
          <div className="max-w-xl mx-auto">
            <p
              className="text-xs tracking-[0.4em] text-void-dim uppercase mb-6"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ◈ transmission log
            </p>
            <p
              className="text-void-text text-sm leading-loose"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              there is a signal in the static.
              <br /><br />
              a coordinate hidden in the noise.
              those who arrive first will understand what others cannot yet see.
              <br /><br />
              the void does not explain itself.
              it does not promise. it does not warn.
              <br /><br />
              the reveal is not for everyone.
            </p>
          </div>
        </section>

        {/* ── SECTION 5: FAQ ──────────────────────────────────────── */}
        <section className="max-w-xl mx-auto px-6 py-20">
          <p
            className="text-xs tracking-[0.4em] text-void-dim uppercase mb-8"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ◈ frequently asked
          </p>
          <FAQ q="what is this?" a="a signal." />
          <FAQ q="what do i get?" a="you'll know when it happens." />
          <FAQ q="when is the reveal?" a="when the timer reaches zero." />
          <FAQ q="who made this?" a="someone who found the signal." />
          <FAQ q="is this safe?" a="that depends on what you're afraid of." />
          <FAQ q="can i get a refund?" a="the void doesn't give back." />
        </section>

        {/* ── SECTION 6: The surprise ──────────────────────────────── */}
        <section className="border-t border-void-border bg-void-surface py-20 px-6 text-center">
          <div className="max-w-md mx-auto">
            <p
              className="text-xs tracking-[0.4em] text-void-dim uppercase mb-6"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ◈ the surprise
            </p>
            <p
              className="text-white text-lg font-mono leading-loose"
              style={{ fontFamily: "'JetBrains Mono', monospace", animation: 'flicker 7s infinite' }}
            >
              if we told you,
              <br />
              it wouldn&apos;t be.
            </p>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="border-t border-void-border py-8 px-6 text-center">
          <p
            className="text-void-dim text-xs tracking-[0.3em]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            VØID — {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </>
  );
}
