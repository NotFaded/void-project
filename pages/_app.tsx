import type { AppProps } from 'next/app';
import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(WalletAdapterNetwork.Mainnet);

  // Empty array — Phantom (and other wallets) are auto-detected via Wallet Standard
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
