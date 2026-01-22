'use client';

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

export function WalletProvider({ children }: { children: React.ReactNode }) {

  return (
    <AptosWalletAdapterProvider
      plugins={[]}
      autoConnect={true}
      optInWallets={[]}
      onError={(error) => {
        console.error('Wallet error:', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
