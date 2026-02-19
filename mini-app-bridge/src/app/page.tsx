'use client';

import { useEffect, useState } from 'react';
import { isAddress } from 'ethers';
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

// Network logos
const ETH_LOGO_SVG = `<svg width="20" height="20" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
  <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
  <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
  <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
  <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z"/>
  <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/>
  <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z"/>
</svg>`;

const ASSETS = [
  {
    symbol: 'MOVE',
    name: 'Movement Token',
    decimals: 8,
    icon: '/logo.png',
    bridgeAddress: '0x7e4fd97ef92302eea9b10f74be1d96fb1f1511cf7ed28867b0144ca89c6ebc3c',
    address: '0x000000000000000000000000000000000000000000000000000000000000000a',
  },
  {
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    bridgeAddress: '0x4d2969d384e440db9f1a51391cfc261d1ec08ee1bdf7b9711a6c05d485a4110a',
    address: '0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39',
  },
  {
    symbol: 'USDT',
    name: 'USDT',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    bridgeAddress: '0x38cdb3f0afabee56a3393793940d28214cba1f5781e13d5db18fa7079f60ab55',
    address: '0x447721a30109c662dde9c73a0c2c9c9c9c459fb5e5a9c92f03c50fa69737f5d08d',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 8,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    bridgeAddress: '0x3dfe1ac4574c7dbbe6f1c5ba862de88fc3e7d3cf8eba95ef1abf32b582889e6d',
    address: '0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    bridgeAddress: '0xbdf86868a32dbae96f2cd50ab05b4be43b92e84e793a4fc01b5b460cc38fdc14',
    address: '0xb06f29f24dde9c6daeec1f930f14a441a8d6c0fbea590725e88b340af3e1939c',
  },
  {
    symbol: 'solvBTC',
    name: 'Solv BTC',
    decimals: 8,
    icon: '🪙',
    bridgeAddress: '0xc033e260c4da2e21567f77b83bac30b7db266509122b2ab52b641fd0aa2b26b0',
    address: '0x527c43638a6c389a9ad702e7085f31c48223624d5102a5207dfab861f482c46d',
  },
  {
    symbol: 'LBTC',
    name: 'Lombard Staked Bitcoin',
    decimals: 8,
    icon: '🔒',
    bridgeAddress: '0x8bd6d33c0637d969c52ac2edb86f6505f7974d6dccb8edb594fff56d81024157',
    address: '0x0658f4ef6f76c8eeffdc06a30946f3f06723a7f9532e2413312b2a612183759c',
  },
  {
    symbol: 'stBTC',
    name: 'Lorenzo Staked Bitcoin',
    decimals: 8,
    icon: '🔐',
    bridgeAddress: '0xbddcd395d46cff363110afe433ca0cc2b9ff573447503759a005624ede9c1805',
    address: '0x95c0fd13373299ada1b9f09ff62473ab8b3908e6a30011730210c141dffdc990',
  },
  {
    symbol: 'enzoBTC',
    name: 'Lorenzo Wrapped Bitcoin',
    decimals: 8,
    icon: '🎯',
    bridgeAddress: '0x1fc92c80ce800a1bf1f8e5ec847bbbe67cf798cbe37f1cdb66f29d6ede839eae',
    address: '0xff91f0df99b217436229b85ae900a2b67970eda92a88b06eb305949ec9828ed6',
  },
  {
    symbol: 'ezETH',
    name: 'Renzo Restaked ETH',
    decimals: 8,
    icon: '🔄',
    bridgeAddress: '0x90d5bbd1fcc9949f194d5404b5fe68d398e558e6f58c92e596dcb8f899db6b6d',
    address: '0x2f6af255328fe11b88d840d1e367e946ccd16bd7ebddd6ee7e2ef9f7ae0c53ef',
  },
  {
    symbol: 'rsETH',
    name: 'KelpDao Restaked ETH',
    decimals: 8,
    icon: '🌊',
    bridgeAddress: '0xe34b5a63d8aed5c167e0629e430ec444a47ae5822a61a512c1473817460dfe81',
    address: '0x51ffc9885233adf3dd411078cad57535ed1982013dc82d9d6c433a55f2e0035d',
  },
  {
    symbol: 'weETH',
    name: 'Wrapped eETH',
    decimals: 8,
    icon: '💎',
    bridgeAddress: '0x2e5c98f694cbeeb917ec336b64385a02a6aee0e248341a2c254f4622644c691e',
    address: '0xe956f5062c3b9cba00e82dc775d29acf739ffa1e612e619062423b58afdbf035',
  },
  {
    symbol: 'USDe',
    name: 'USDe',
    decimals: 6,
    icon: '📈',
    bridgeAddress: '0xfe0ce83d6242aa28744929645aa56a20e1e36d5239bbeafca9155e6f0acf8ba4',
    address: '0x9d146a4c9472a7e7b0dbc72da0eafb02b54173a956ef22a9fba29756f8661c6c',
  },
  {
    symbol: 'sUSDe',
    name: 'sUSDe',
    decimals: 6,
    icon: '🔷',
    bridgeAddress: '0x6078ca658a9fc5c411c2138e2002bcdc62d26c135da812ad636cb49b86288101',
    address: '0x74f0c7504507f7357f8a218cc70ce3fc0f4b4e9eb8474e53ca778cb1e0c6dcc5',
  },
  {
    symbol: 'USDa',
    name: 'USDa',
    decimals: 8,
    icon: '🪙',
    bridgeAddress: '0x60e7d2fa84c5231e0fb11021b53edd2da49bfd5f13d1da8bcb7351b6795bdde1',
    address: '0x48b904a97eafd065ced05168ec44638a63e1e3bcaec49699f6b8dabbd1424650',
  },
  {
    symbol: 'sUSDa',
    name: 'USDa saving token',
    decimals: 8,
    icon: '💰',
    bridgeAddress: '0x4c63e9bb76b9a7acf2284466233b19242b3e1f09d1f647a3f9ad03d07b3095ce',
    address: '0xe699e6c1733462632821b6e5b954c0ed3aa9ad1efb70b6ce92616952ade89258',
  },
];

const ETH_LZ_CHAIN_ID = 30101; // Ethereum Mainnet LayerZero ID

interface PendingTx {
  id: string;
  asset: string;
  amount: string;
  toAddress: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  txHash?: string;
}

export default function BridgePage() {
  const { sdk, isConnected, address } = useMovementSDK();

  const [assetBalance, setAssetBalance] = useState<string>('');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Bridge form state
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [amount, setAmount] = useState('');
  const [evmAddress, setEvmAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [isBridging, setIsBridging] = useState(false);

  // Pending transactions
  const [pendingTxs, setPendingTxs] = useState<PendingTx[]>([]);
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  // Fetch asset balance from indexer
  const fetchAssetBalance = async (assetAddress: string, userAddress: string) => {
    if (!userAddress) return;

    setIsLoadingBalance(true);
    try {
      const response = await fetch('https://indexer.movementlabs.xyz/v1/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetCoinBalance($owner: String!, $coinType: String!) {
              current_coin_balances(
                where: {
                  owner_address: {_eq: $owner},
                  coin_type: {_eq: $coinType}
                }
              ) {
                amount
                coin_info {
                  decimals
                }
              }
            }
          `,
          variables: {
            owner: userAddress,
            coinType: assetAddress
          }
        })
      });

      const result = await response.json();
      if (result.data?.current_coin_balances?.[0]) {
        const balance = result.data.current_coin_balances[0];
        const decimals = balance.coin_info?.decimals || 8;
        const amount = parseFloat(balance.amount) / Math.pow(10, decimals);
        setAssetBalance(amount.toString());
      } else {
        setAssetBalance('0');
      }
    } catch (error) {
      console.error('[Bridge] Error fetching asset balance:', error);
      setAssetBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch asset balance when address or selected asset changes
  useEffect(() => {
    if (address && selectedAsset) {
      fetchAssetBalance(selectedAsset.address, address);
    }
  }, [address, selectedAsset]);

  // Validate EVM address
  useEffect(() => {
    setIsAddressValid(evmAddress.length > 0 && isAddress(evmAddress));
  }, [evmAddress]);

  const handleScanQR = async () => {
    if (!sdk) return;
    try {
      console.log('[Bridge] Scanning QR code...');
      const scannedData = await sdk.scanQRCode?.();
      console.log('[Bridge] Scanned:', scannedData);

      if (scannedData && isAddress(scannedData)) {
        setEvmAddress(scannedData);
        await sdk.haptic?.({ type: 'impact', style: 'light' });
      } else if (scannedData) {
        await sdk.haptic?.({ type: 'notification', style: 'error' });
        alert('Invalid Ethereum address scanned');
      }
    } catch (error: any) {
      console.error('[Bridge] QR scan error:', error);
      if (error.message !== 'QR code scan cancelled') {
        alert('Failed to scan QR code');
      }
    }
  };

  const handleBridge = async () => {
    if (!sdk || !isConnected || !isAddressValid || !amount) return;

    setIsBridging(true);
    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert to asset decimals
      const amountInUnits = Math.floor(amountNum * Math.pow(10, selectedAsset.decimals));

      // Convert recipient to bytes32 format (padded hex)
      const recipientBytes32 = evmAddress.startsWith('0x')
        ? `0x${evmAddress.slice(2).padStart(64, '0')}`
        : `0x${evmAddress.padStart(64, '0')}`;

      // Convert hex string to byte array for Move
      const recipientBytes = Array.from(Buffer.from(recipientBytes32.slice(2), 'hex'));

      // LayerZero options (minimal)
      const extraOptions = [0, 3, 1, 0, 17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 26, 128];

      console.log('[Bridge] Getting quote...');

      // Get quote for bridge fee
      const quoteResult = await sdk.view({
        function: `${selectedAsset.bridgeAddress}::oft::quote_send`,
        type_arguments: [],
        function_arguments: [
          address,
          ETH_LZ_CHAIN_ID.toString(),
          JSON.stringify(recipientBytes),
          amountInUnits.toString(),
          amountInUnits.toString(),
          JSON.stringify(extraOptions),
          JSON.stringify([0]), // compose_message
          JSON.stringify([0]), // oft_cmd
          'false', // pay_in_zro
        ]
      });

      console.log('[Bridge] Quote result:', quoteResult);

      const nativeFee = quoteResult?.[0] || '100000'; // Default fee if quote fails

      // Create pending tx
      const newTx: PendingTx = {
        id: Date.now().toString(),
        asset: selectedAsset.symbol,
        amount,
        toAddress: evmAddress,
        status: 'pending',
        timestamp: Date.now(),
      };

      setPendingTxs(prev => [newTx, ...prev]);

      console.log('[Bridge] Initiating bridge transaction...');

      // Call Movement bridge contract via LayerZero
      const result = await sdk.sendTransaction({
        function: `${selectedAsset.bridgeAddress}::oft::send_withdraw`,
        type_arguments: [],
        arguments: [
          ETH_LZ_CHAIN_ID.toString(),
          JSON.stringify(recipientBytes),
          amountInUnits.toString(),
          amountInUnits.toString(),
          JSON.stringify(extraOptions),
          JSON.stringify([0]), // compose_message
          JSON.stringify([0]), // oft_cmd
          nativeFee.toString(),
          '0', // lz_token_fee
        ]
      });

      console.log('[Bridge] Transaction result:', result);

      // Update tx status
      setPendingTxs(prev => prev.map(tx =>
        tx.id === newTx.id ? { ...tx, status: 'success', txHash: result?.hash } : tx
      ));

      // Clear form
      setAmount('');
      setEvmAddress('');

      await sdk.haptic?.({ type: 'notification', style: 'success' } as any);
      await sdk.notify?.({
        title: 'Bridge Initiated!',
        body: `Bridging ${amount} ${selectedAsset.symbol} to Ethereum`
      });
    } catch (error: any) {
      console.error('[Bridge] Error:', error);
      setPendingTxs(prev => prev.map(tx =>
        tx.id === String(Date.now()) ? { ...tx, status: 'failed' } : tx
      ));
      await sdk.haptic?.({ type: 'notification', style: 'error' } as any);
      alert(error.message || 'Bridge transaction failed');
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E]" style={{ padding: '16px' }}>
      <div className="max-w-md w-full mx-auto" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        {/* Main Bridge Card */}
        <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden shadow-2xl" style={{ marginBottom: '24px' }}>
          <div className="bg-gradient-to-r from-[#06B6D4]/20 to-[#6366F1]/20 border-b border-gray-700" style={{ padding: '20px' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Bridge Asset</h1>
                <p className="text-sm text-gray-400" style={{ marginTop: '4px' }}>Transfer to Ethereum</p>
              </div>
              {address && (
                <div className="text-right">
                  <div className="text-xs text-gray-400">Address</div>
                  <div className="text-xs text-white font-mono" style={{ marginTop: '2px' }}>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Token Selection */}
            <div style={{ marginBottom: '24px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                <label className="text-sm font-semibold text-gray-400">Select Asset</label>
                {address && (
                  <div className="text-xs text-gray-400">
                    Balance: {isLoadingBalance ? (
                      <span className="text-gray-500">...</span>
                    ) : (
                      <span className="text-white font-semibold">
                        {(Math.floor(parseFloat(assetBalance || '0') * 10000) / 10000).toFixed(4)} {selectedAsset.symbol}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAssetSelector(true)}
                className="w-full flex items-center bg-[#0A0F1E] border border-gray-700 rounded-xl cursor-pointer text-white hover:border-[#06B6D4] transition-colors"
                style={{ padding: '20px', gap: '16px' }}
              >
                <img src={selectedAsset.icon} alt={selectedAsset.symbol} style={{ width: '48px', height: '48px' }} />
                <div className="flex-1 text-left">
                  <p className="text-lg font-bold">{selectedAsset.symbol}</p>
                  <p className="text-sm text-gray-400" style={{ marginTop: '4px' }}>{selectedAsset.name}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: '24px' }}>
              <label className="text-sm font-semibold text-gray-400 block" style={{ marginBottom: '12px' }}>Amount</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  className="w-full bg-[#0A0F1E] border border-gray-700 rounded-xl text-white text-3xl font-bold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
                  style={{ padding: '20px', paddingRight: '112px' }}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-base">
                  {selectedAsset.symbol}
                </div>
              </div>
            </div>

            {/* Network Flow */}
            {/* <div style={{ marginBottom: '24px' }}>
              <label className="text-sm font-semibold text-gray-400 block" style={{ marginBottom: '12px' }}>Route</label>
              <div className="flex items-center bg-[#0A0F1E] border border-gray-700 rounded-xl" style={{ padding: '20px', gap: '16px' }}>
                <div className="flex items-center flex-1" style={{ gap: '8px' }}>
                  <img src="/logo.png" alt="Movement" style={{ width: '28px', height: '28px' }} />
                  <span className="text-base font-semibold text-white">Movement</span>
                </div>
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                  <path d="M14 10H6M6 10L10 6M6 10L10 14" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="flex items-center flex-1 justify-end" style={{ gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px' }} dangerouslySetInnerHTML={{ __html: ETH_LOGO_SVG }} />
                  <span className="text-base font-semibold text-white">Ethereum</span>
                </div>
              </div>
            </div> */}

            {/* Recipient Address */}
            <div style={{ marginBottom: '24px' }}>
              <label className="text-sm font-semibold text-gray-400 block" style={{ marginBottom: '12px' }}>Recipient Address</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0x..."
                  value={evmAddress}
                  onChange={(e) => setEvmAddress(e.target.value)}
                  className={`w-full bg-[#0A0F1E] border ${evmAddress && !isAddressValid ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent text-base font-mono`}
                  style={{ padding: '16px 56px 16px 20px' }}
                />
                <button
                  onClick={handleScanQR}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#06B6D4] hover:text-[#0891B2]"
                  style={{ padding: '4px' }}
                  title="Scan QR Code"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>
              {evmAddress && !isAddressValid && (
                <p className="text-red-400 text-xs" style={{ marginTop: '8px' }}>Invalid Ethereum address</p>
              )}
            </div>

            {/* Bridge Info */}
            {amount && parseFloat(amount) > 0 && isAddressValid && (
              <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="flex justify-between items-center border-b border-gray-800" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                  <span className="text-sm text-gray-400">Est. time</span>
                  <span className="text-sm font-semibold text-white">~10-15 min</span>
                </div>
                <div className="flex justify-between items-center" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                  <span className="text-sm text-gray-400">Bridge via</span>
                  <span className="text-sm font-semibold text-white">LayerZero</span>
                </div>
              </div>
            )}

            {/* Bridge Button */}
            <button
              onClick={handleBridge}
              disabled={!isConnected || !isAddressValid || !amount || isBridging}
              className={`w-full font-semibold rounded-xl transition-all shadow-lg ${
                !isConnected || !isAddressValid || !amount || isBridging
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-[#06B6D4] hover:bg-[#0891B2] text-black cursor-pointer active:scale-95'
              }`}
              style={{ padding: '16px 24px' }}
            >
              {isBridging ? 'Bridging...' : isConnected ? 'Bridge to Ethereum' : 'Connect Wallet First'}
            </button>
          </div>
        </div>

        {/* Recent Bridges */}
        {pendingTxs.length > 0 && (
          <div className="bg-[#1A1F2E] rounded-2xl border border-gray-800" style={{ padding: '20px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <p className="text-base font-semibold text-white">Recent Bridges</p>
              <span className="text-xs text-gray-400">{pendingTxs.length} transactions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingTxs.map((tx) => (
                <div key={tx.id} className="bg-[#0A0F1E] rounded-xl border border-gray-700" style={{ padding: '16px' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                    <span className="font-semibold text-white text-sm">{tx.amount} {tx.asset}</span>
                    <span className={`rounded-lg text-xs font-bold ${
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      tx.status === 'success' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`} style={{ padding: '6px 12px' }}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    To: {tx.toAddress.slice(0, 6)}...{tx.toAddress.slice(-4)}
                  </p>
                  {tx.txHash && (
                    <p className="text-xs text-[#06B6D4] font-mono" style={{ marginTop: '8px' }}>
                      {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Asset Selector Modal */}
        {showAssetSelector && (
          <div
            onClick={() => setShowAssetSelector(false)}
            className="fixed inset-0 bg-black/60 flex items-end z-50"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1F2E] w-full rounded-t-3xl max-w-md mx-auto"
              style={{ padding: '24px' }}
            >
              <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto" style={{ marginBottom: '20px' }} />
              <h3 className="text-xl font-bold text-white" style={{ marginBottom: '20px' }}>Select Asset</h3>
              <div className="flex flex-col max-h-96 overflow-y-auto" style={{ gap: '12px' }}>
                {ASSETS.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setShowAssetSelector(false);
                    }}
                    className={`w-full flex items-center rounded-xl cursor-pointer text-white transition-all ${
                      selectedAsset.symbol === asset.symbol
                        ? 'bg-[#06B6D4]/10 border border-[#06B6D4]'
                        : 'bg-[#0A0F1E] border border-gray-700 hover:border-gray-600'
                    }`}
                    style={{ padding: '16px', gap: '12px' }}
                  >
                    <img src={asset.icon} alt={asset.symbol} style={{ width: '40px', height: '40px' }} />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-base">{asset.symbol}</p>
                      <p className="text-xs text-gray-400" style={{ marginTop: '2px' }}>{asset.name}</p>
                    </div>
                    {selectedAsset.symbol === asset.symbol && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="#06B6D4">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
