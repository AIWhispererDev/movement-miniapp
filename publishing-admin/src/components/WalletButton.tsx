'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { isAdmin } from '@/lib/config';

export function WalletButton() {
  const { account, connected, disconnect, wallet } = useWallet();
  const [walletName, setWalletName] = useState<string>('');
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (wallet?.name) {
      setWalletName(wallet.name);
    }
  }, [wallet]);

  const shortAddress = account?.address
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : '';

  const userIsAdmin = isAdmin(account?.address);

  if (!connected) {
    return (
      <div>
        <button
          onClick={() => setShowWalletModal(true)}
          className="bg-guild-green-500 hover:bg-guild-green-600 dark:bg-guild-green-600 dark:hover:bg-guild-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Connect Wallet
        </button>

        {showWalletModal && (
          <WalletModal onClose={() => setShowWalletModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {!userIsAdmin && (
        <span className="text-red-600 dark:text-red-400 text-sm font-medium">
          ⚠️ Not Admin
        </span>
      )}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
        <div className="text-xs text-gray-500 dark:text-gray-400">{walletName}</div>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {shortAddress}
        </div>
      </div>
      <button
        onClick={disconnect}
        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
      >
        Disconnect
      </button>
    </div>
  );
}

function WalletModal({ onClose }: { onClose: () => void }) {
  const { wallets, connect } = useWallet();

  const unsupportedWallets = [
    'Dev T wallet',
    'Pontem Wallet',
    'Pontem',
    'TrustWallet',
    'TokenPocket',
    'Martian',
    'Rise',
    'Petra',
    'Aptos Connect',
    'Continue with Google',
    'Continue with Apple'
  ];

  const supportedWallets = wallets?.filter(
    (wallet) => !unsupportedWallets.includes(wallet.name)
  );

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName as any);
      onClose();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {supportedWallets && supportedWallets.length > 0 ? (
            supportedWallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {wallet.icon && (
                  <img src={wallet.icon} alt={wallet.name} className="w-8 h-8" />
                )}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {wallet.name}
                </span>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No supported wallets found. Please install a compatible wallet.
            </p>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Only admin wallets can manage app submissions
        </p>
      </div>
    </div>
  );
}
