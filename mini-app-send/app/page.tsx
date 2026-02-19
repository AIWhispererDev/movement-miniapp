'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSDK } from '../hooks/useSDK';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingOverlay } from '../components/OnboardingOverlay';

// Network-specific RPC URLs for view calls
const RPC_URLS: Record<string, string> = {
  mainnet: 'https://mainnet.movementnetwork.xyz/v1',
  testnet: 'https://testnet.movementnetwork.xyz/v1',
};

// Common token types on Movement
const TOKENS = [
  {
    symbol: 'MOVE',
    name: 'Movement Token',
    decimals: 8,
    icon: '/logo.png',
    coinType: '0x1::aptos_coin::AptosCoin',
    faAddress: '0x000000000000000000000000000000000000000000000000000000000000000a',
    transferFunction: '0x1::aptos_account::transfer',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    coinType: '0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39::coin::USDC',
    transferFunction: '0x1::coin::transfer',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    coinType: '0x447721a30109c662dde9c73a0c9c9c9c459fb5e5a9c92f03c50fa69737f5d08d::coin::USDT',
    transferFunction: '0x1::coin::transfer',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 8,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    coinType: '0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376::coin::WETH',
    transferFunction: '0x1::coin::transfer',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    coinType: '0xb06f29f24dde9c6daeec1f930f14a441a8d6c0fbea590725e88b340af3e1939c::coin::WBTC',
    transferFunction: '0x1::coin::transfer',
  },
];

export default function SendTokensPage() {
  // Use the SDK hook
  const { sdk, isConnected, address, isLoading: sdkLoading, error: sdkError, sendTransaction } = useSDK();
  const { isOnboardingOpen, openOnboarding, closeOnboarding } = useOnboarding();

  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [assetBalance, setAssetBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isResolvingName, setIsResolvingName] = useState(false);
  const [nameResolutionError, setNameResolutionError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [network, setNetwork] = useState<string | null>(null);  // Start as null until SDK provides it
  const [isCopied, setIsCopied] = useState(false);

  // Theme colors
  const theme = {
    bg: {
      primary: isDarkMode ? '#0A0F1E' : '#F9FAFB',
      secondary: isDarkMode ? '#1A1F2E' : '#FFFFFF',
      tertiary: isDarkMode ? '#0A0F1E' : '#F3F4F6',
    },
    text: {
      primary: isDarkMode ? '#FFFFFF' : '#111827',
      secondary: isDarkMode ? '#9CA3AF' : '#6B7280',
      tertiary: isDarkMode ? '#6B7280' : '#9CA3AF',
    },
    border: {
      default: isDarkMode ? '#374151' : '#E5E7EB',
      hover: isDarkMode ? '#4B5563' : '#D1D5DB',
      focus: '#00D4AA',
    },
    accent: {
      primary: '#00D4AA',
      hover: '#00BF9A',
      light: isDarkMode ? '#00D4AA' : '#00D4AA',
    },
    success: {
      bg: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
      border: isDarkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)',
      text: isDarkMode ? '#22C55E' : '#16A34A',
      textSecondary: isDarkMode ? '#86EFAC' : '#15803D',
    },
    error: {
      bg: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      border: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
      text: isDarkMode ? '#EF4444' : '#991B1B',
      textSecondary: isDarkMode ? '#FCA5A5' : '#7F1D1D',
    },
  };

  // Helper to detect if input is an MNS name vs address
  const isMNSName = (input: string): boolean => {
    if (!input) return false;
    // If it starts with 0x and is 64+ chars, it's likely an address
    if (input.startsWith('0x') && input.length >= 64) return false;
    // If it ends with .move or doesn't start with 0x, treat as name
    return input.endsWith('.move') || !input.startsWith('0x');
  };

  // Normalize MNS name (remove .move suffix if present and lowercase)
  const normalizeMNSName = (name: string): string => {
    const lowered = name.toLowerCase();
    return lowered.endsWith('.move') ? lowered.slice(0, -5) : lowered;
  };

  // Resolve MNS name to address
  useEffect(() => {
    const resolveName = async () => {
      if (!recipientInput || !sdk?.mns) {
        setResolvedAddress(null);
        setNameResolutionError(null);
        return;
      }

      if (!isMNSName(recipientInput)) {
        // It's already an address
        setResolvedAddress(recipientInput);
        setNameResolutionError(null);
        return;
      }

      setIsResolvingName(true);
      setNameResolutionError(null);

      try {
        const normalizedName = normalizeMNSName(recipientInput);
        const result = await sdk.mns.getTargetAddress(normalizedName);

        // Handle result - SDK returns AccountAddress with byte array in data property
        let address: string | null = null;

        if (result && 'data' in result) {
          // Convert byte array to hex address
          const bytes = Object.keys(result.data).sort((a, b) => Number(a) - Number(b)).map(k => result.data[k]);
          if (bytes.length > 0 && bytes.some((b: number) => b !== 0)) {
            address = '0x' + bytes.map((b: number) => b.toString(16).padStart(2, '0')).join('');
          }
        }

        if (address) {
          setResolvedAddress(address);
          setNameResolutionError(null);
        } else {
          setResolvedAddress(null);
          setNameResolutionError(`Name "${normalizedName}.move" not found`);
        }
      } catch (error: any) {
        console.error('[Send App] MNS resolution error:', error);
        setResolvedAddress(null);
        setNameResolutionError('Failed to resolve name');
      } finally {
        setIsResolvingName(false);
      }
    };

    // Debounce the resolution
    const timeoutId = setTimeout(resolveName, 300);
    return () => clearTimeout(timeoutId);
  }, [recipientInput, sdk]);

  // Fetch theme from SDK
  useEffect(() => {
    const fetchTheme = async () => {
      if (!sdk) return;
      try {
        // getTheme may not exist in all SDK versions
        const getThemeFn = (sdk as any).getTheme;
        if (typeof getThemeFn === 'function') {
          const themeInfo = await getThemeFn();
          setIsDarkMode(themeInfo?.colorScheme === 'dark');
        }
      } catch (error) {
        console.error('[Send App] Error fetching theme:', error);
      }
    };
    fetchTheme();
  }, [sdk]);

  // Sync network from SDK
  useEffect(() => {
    if (sdk?.network) {
      setNetwork(sdk.network);
    }
  }, [sdk?.network]);

  // Fetch coin balance using RPC view call
  const fetchAssetBalance = useCallback(async (coinType: string, userAddress: string, decimals: number) => {
    if (!userAddress || !network) return;

    setIsLoadingBalance(true);
    try {
      const rpcUrl = RPC_URLS[network];

      // Use RPC view call to get coin balance
      const response = await fetch(`${rpcUrl}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: '0x1::coin::balance',
          type_arguments: [coinType],
          arguments: [userAddress],
        }),
      });

      if (!response.ok) {
        // Account might not have this coin registered
        console.log('[Send App] Balance fetch failed, coin may not be registered');
        setAssetBalance('0');
        return;
      }

      const result = await response.json();
      console.log('[Send App] Balance result:', result);

      // Result is an array with the balance as first element
      if (result && result[0] !== undefined) {
        const balanceRaw = BigInt(result[0]);
        const balance = Number(balanceRaw) / Math.pow(10, decimals);
        setAssetBalance(balance.toString());
      } else {
        setAssetBalance('0');
      }
    } catch (error) {
      console.error('[Send App] Error fetching balance:', error);
      setAssetBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [network]);


  // Fetch asset balance when address, selected token, or network changes
  // Only fetch when network is known (not null) to avoid fetching from wrong RPC
  useEffect(() => {
    if (address && selectedToken && network) {
      fetchAssetBalance(selectedToken.coinType, address, selectedToken.decimals);
    }
  }, [address, selectedToken, network, fetchAssetBalance]);

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!address || !selectedToken || !network) return;

    const intervalId = setInterval(() => {
      console.log('[Send App] Auto-refreshing balance...');
      fetchAssetBalance(selectedToken.coinType, address, selectedToken.decimals);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [address, selectedToken, network, fetchAssetBalance]);

  const handleSend = async () => {
    if (!sdk || !address) {
      setStatus('error');
      setErrorMessage('Wallet not connected');
      return;
    }

    if (!recipientInput || !amount) {
      setStatus('error');
      setErrorMessage('Please enter recipient and amount');
      return;
    }

    if (!resolvedAddress) {
      setStatus('error');
      setErrorMessage(nameResolutionError || 'Invalid recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatus('error');
      setErrorMessage('Please enter a valid amount');
      return;
    }

    try {
      setStatus('sending');
      setIsLoading(true);
      setErrorMessage('');

      const amountInUnits = Math.floor(amountNum * Math.pow(10, selectedToken.decimals)).toString();

      console.log('[Send App] Sending transaction to:', resolvedAddress);

      const result = await sendTransaction({
        function: selectedToken.transferFunction,
        type_arguments: selectedToken.transferFunction === '0x1::coin::transfer' ? [selectedToken.coinType] : [],
        arguments: [resolvedAddress, amountInUnits],
        title: `Send ${selectedToken.symbol}`,
        description: `Send ${amount} ${selectedToken.symbol}${isMNSName(recipientInput) ? ` to ${recipientInput}` : ''}`,
      });

      console.log('[Send App] Transaction result:', result);

      setStatus('success');
      await sdk.notify?.({
        title: 'Sent Successfully!',
        body: `Sent ${amount} ${selectedToken.symbol}`
      });

      // Refresh balance after successful transaction
      setTimeout(() => {
        fetchAssetBalance(selectedToken.coinType, address, selectedToken.decimals);
      }, 2000);

      // Clear form
      setTimeout(() => {
        setRecipientInput('');
        setResolvedAddress(null);
        setAmount('');
        setStatus('idle');
      }, 3000);

    } catch (error: any) {
      console.error('[Send App] Send error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = selectedToken.symbol === 'MOVE'
      ? Math.max(0, parseFloat(assetBalance) - 0.001)
      : parseFloat(assetBalance);
    // Truncate to 4 decimals (don't round)
    const truncated = Math.floor(maxAmount * 10000) / 10000;
    setAmount(truncated.toFixed(4));
  };

  const handleScanQR = async () => {
    if (!sdk) return;

    try {
      console.log('[Send App] Scanning QR code...');
      const scannedData = await sdk.scanQRCode?.();
      console.log('[Send App] Scanned:', scannedData);

      if (scannedData) {
        setRecipientInput(scannedData);
        await sdk.haptic?.({ type: 'impact', style: 'light' });
      }
    } catch (error: any) {
      console.error('[Send App] QR scan error:', error);
      if (error.message !== 'QR code scan cancelled') {
        setErrorMessage('Failed to scan QR code');
      }
    }
  };

  const handleImageError = (iconUrl: string) => {
    setImageErrors(prev => new Set(prev).add(iconUrl));
  };

  const handleCopyAddress = async () => {
    if (!resolvedAddress) return;

    try {
      // Try SDK clipboard first (for native apps)
      if (sdk && (sdk as any).Clipboard?.writeText) {
        await (sdk as any).Clipboard.writeText(resolvedAddress);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // Fallback to browser clipboard API
        await navigator.clipboard.writeText(resolvedAddress);
      } else {
        console.error('[Send App] No clipboard API available');
        return;
      }

      await sdk?.haptic?.({ type: 'impact', style: 'light' });
      await sdk?.notify?.({
        title: 'Address Copied!',
        body: 'The resolved address has been copied to your clipboard'
      });
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('[Send App] Copy error:', error);
    }
  };

  const renderTokenIcon = (token: typeof TOKENS[0], size: string = 'w-10 h-10') => {
    const isUrl = token.icon.startsWith('http') || token.icon.startsWith('/');
    const hasError = imageErrors.has(token.icon);

    if (isUrl && !hasError) {
      return (
        <img
          src={token.icon}
          alt={token.symbol}
          className={`${size} mr-3 rounded-full`}
          onError={() => handleImageError(token.icon)}
          loading="eager"
          decoding="async"
        />
      );
    }

    return (
      <div
        className={`${size} mr-3 flex items-center justify-center rounded-full font-bold text-xl`}
        style={{
          backgroundColor: `${theme.accent.primary}33`,
          color: theme.accent.primary
        }}
      >
        {token.icon.length <= 2 ? token.icon : token.symbol.charAt(0)}
      </div>
    );
  };

  const filteredTokens = TOKENS.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (sdkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg.primary }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: theme.accent.primary }} />
          <p style={{ color: theme.text.secondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Error state (not in mini app)
  if (sdkError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.bg.primary }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.error.bg }}>
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.error.text }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>Mini App Required</h1>
          <p className="mb-6" style={{ color: theme.text.secondary }}>
            Please open this app in the Movement Everything wallet to send tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: theme.bg.primary }}>
      <div className="max-w-md w-full mx-auto py-4">
        {/* Send Form Card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-4" style={{ backgroundColor: theme.bg.secondary }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00D4AA]/20 to-[#00AA8A]/20 px-5 py-4 border-b" style={{ borderColor: theme.border.default }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold" style={{ color: theme.text.primary }}>Send Token</h1>
                  {network && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: network === 'testnet' ? '#F59E0B20' : '#10B98120',
                        color: network === 'testnet' ? '#F59E0B' : '#10B981'
                      }}
                    >
                      {network}
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: theme.text.secondary }}>Transfer tokens instantly</p>
              </div>
              <div className="flex items-center gap-3">
                {address && (
                  <div className="text-right">
                    <div className="text-xs" style={{ color: theme.text.secondary }}>Address</div>
                    <div className="text-xs font-mono mt-1" style={{ color: theme.text.primary }}>
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                  </div>
                )}
                <button
                  onClick={openOnboarding}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: theme.border.default, color: theme.text.secondary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.accent.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
                  aria-label="Help"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {status === 'success' && (
            <div className="border-b px-5 py-3" style={{ backgroundColor: theme.success.bg, borderColor: theme.success.border }}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.success.text }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: theme.success.text }}>Transaction Successful!</p>
                  <p className="text-xs mt-0.5" style={{ color: theme.success.textSecondary }}>
                    Your {selectedToken.symbol} has been sent successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="p-5">
            {/* Token Selection */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: theme.text.secondary }}>Select Token</label>
                {address && (
                  <div className="text-xs" style={{ color: theme.text.secondary }}>
                    Balance: {isLoadingBalance ? (
                      <span style={{ color: theme.text.tertiary }}>...</span>
                    ) : (
                      <span className="font-semibold" style={{ color: theme.text.primary }}>
                        {(Math.floor(parseFloat(assetBalance || '0') * 10000) / 10000).toFixed(4)} {selectedToken.symbol}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowTokenSelector(true)}
                className="w-full flex items-center border rounded-xl p-4 cursor-pointer transition-colors"
                style={{
                  backgroundColor: theme.bg.tertiary,
                  borderColor: theme.border.default,
                  color: theme.text.primary
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.border.focus}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border.default}
              >
                {renderTokenIcon(selectedToken)}
                <div className="flex-1 text-left">
                  <p className="text-base font-bold">{selectedToken.symbol}</p>
                  <p className="text-xs mt-1" style={{ color: theme.text.secondary }}>{selectedToken.name}</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke={theme.text.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Recipient Input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Recipient (Address or .move Name)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="0x... or name.move"
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-4 py-3 pr-12 border rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: theme.bg.tertiary,
                    borderColor: nameResolutionError ? theme.error.border : theme.border.default,
                    color: theme.text.primary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.border.focus;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.border.focus}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = nameResolutionError ? theme.error.border : theme.border.default;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={handleScanQR}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: theme.accent.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.accent.hover}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.accent.primary}
                  title="Scan QR Code"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>

              {/* Name Resolution Status */}
              {recipientInput && isMNSName(recipientInput) && (
                <div className="mt-2 text-xs">
                  {isResolvingName ? (
                    <span style={{ color: theme.text.secondary }}>
                      Resolving name...
                    </span>
                  ) : nameResolutionError ? (
                    <span style={{ color: theme.error.text }}>
                      {nameResolutionError}
                    </span>
                  ) : resolvedAddress ? (
                    <div className="flex items-center gap-2">
                      <span style={{ color: theme.success.text }}>
                        → {resolvedAddress.slice(0, 10)}...{resolvedAddress.slice(-6)}
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className="p-1 rounded hover:bg-opacity-10 transition-colors"
                        style={{ color: theme.success.text }}
                        title={isCopied ? 'Copied!' : 'Copy address'}
                      >
                        {isCopied ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: theme.text.primary }}>Amount</label>
                <button
                  onClick={handleMaxAmount}
                  className="text-xs font-bold px-3 py-1 rounded-lg"
                  style={{
                    color: theme.accent.primary,
                    backgroundColor: `${theme.accent.primary}1A`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.accent.hover}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.accent.primary}
                >
                  MAX
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  className="w-full px-4 py-4 pr-24 border rounded-xl text-2xl focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: theme.bg.tertiary,
                    borderColor: theme.border.default,
                    color: theme.text.primary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.border.focus;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.border.focus}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.default;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: theme.text.secondary }}>
                  {selectedToken.symbol}
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="border rounded-xl p-4 mb-5" style={{ backgroundColor: theme.bg.tertiary, borderColor: theme.border.default }}>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: theme.text.secondary }}>Network Fee</span>
                <span style={{ color: theme.text.primary }}>~0.0001 MOVE</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t" style={{ borderColor: theme.border.default }}>
                <span className="font-semibold" style={{ color: theme.text.primary }}>You will send</span>
                <span className="font-bold" style={{ color: theme.text.primary }}>
                  {amount || '0.0000'} {selectedToken.symbol}
                </span>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isLoading || !isConnected || status === 'sending'}
              className="w-full font-semibold py-4 px-6 rounded-xl transition-all shadow-lg"
              style={{
                backgroundColor: (isLoading || !isConnected || status === 'sending') ? theme.border.default : theme.accent.primary,
                color: (isLoading || !isConnected || status === 'sending') ? theme.text.tertiary : '#000000',
                cursor: (isLoading || !isConnected || status === 'sending') ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !isConnected || status === 'sending') ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading && isConnected && status !== 'sending') {
                  e.currentTarget.style.backgroundColor = theme.accent.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && isConnected && status !== 'sending') {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                }
              }}
            >
              {status === 'sending' ? 'Sending...' : isConnected ? `Send ${selectedToken.symbol}` : 'Connect Wallet First'}
            </button>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="mt-4 border rounded-lg p-3 flex items-center gap-2" style={{ backgroundColor: theme.error.bg, borderColor: theme.error.border }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: theme.error.text }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-semibold" style={{ color: theme.error.text }}>{errorMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="rounded-xl p-4 border" style={{ backgroundColor: theme.bg.secondary, borderColor: theme.border.default }}>
          <p className="text-base font-semibold mb-2" style={{ color: theme.text.primary }}>About Sending</p>
          <div className="text-sm leading-5 space-y-1" style={{ color: theme.text.secondary }}>
            <p>• Instant transfers on Movement network</p>
            <p>• Low gas fees (~0.0001 MOVE)</p>
            <p>• Send to addresses or .move names</p>
            <p>• Double-check recipient before sending</p>
          </div>
        </div>

        {/* Token Selector Modal */}
        {showTokenSelector && (
          <div
            onClick={() => {
              setShowTokenSelector(false);
              setSearchQuery('');
            }}
            className="fixed inset-0 flex items-end z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-3xl max-w-md mx-auto p-6"
              style={{ backgroundColor: theme.bg.secondary }}
            >
              <div className="w-12 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: theme.border.default }} />
              <h3 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>Select Token</h3>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tokens..."
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: theme.bg.tertiary,
                    borderColor: theme.border.default,
                    color: theme.text.primary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.border.focus;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.border.focus}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.default;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Token List */}
              <div className="flex flex-col max-h-96 overflow-y-auto gap-3">
                {filteredTokens.length === 0 ? (
                  <div className="text-center py-8" style={{ color: theme.text.secondary }}>
                    No tokens found
                  </div>
                ) : (
                  filteredTokens.map((token) => (
                    <button
                      key={token.coinType}
                      onClick={() => {
                        setSelectedToken(token);
                        setShowTokenSelector(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center rounded-xl cursor-pointer transition-all p-4 border"
                      style={{
                        backgroundColor: selectedToken.symbol === token.symbol ? `${theme.accent.primary}1A` : theme.bg.tertiary,
                        borderColor: selectedToken.symbol === token.symbol ? theme.accent.primary : theme.border.default,
                        color: theme.text.primary
                      }}
                      onMouseEnter={(e) => {
                        if (selectedToken.symbol !== token.symbol) {
                          e.currentTarget.style.borderColor = theme.border.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedToken.symbol !== token.symbol) {
                          e.currentTarget.style.borderColor = theme.border.default;
                        }
                      }}
                    >
                      {renderTokenIcon(token)}
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-base">{token.symbol}</p>
                        <p className="text-xs mt-1" style={{ color: theme.text.secondary }}>{token.name}</p>
                      </div>
                      {selectedToken.symbol === token.symbol && (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill={theme.accent.primary}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Overlay */}
        <OnboardingOverlay
          isOpen={isOnboardingOpen}
          onClose={closeOnboarding}
          theme={theme}
        />
      </div>
    </div>
  );
}