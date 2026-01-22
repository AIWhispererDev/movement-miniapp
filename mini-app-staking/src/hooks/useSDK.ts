'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

interface TransactionPayload {
  function: string;
  arguments?: any[];
  type_arguments?: string[];
  title?: string;
  description?: string;
  useFeePayer?: boolean;
  gasLimit?: number | 'Sponsored';
}

interface TransactionResult {
  hash: string;
  success: boolean;
}

export interface UseSDKResult {
  sdk: ReturnType<typeof useMovementSDK>['sdk'];
  isConnected: boolean;
  address: string | null;
  balance: bigint;
  isLoading: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  sendTransaction: (payload: TransactionPayload) => Promise<TransactionResult | null>;
  refreshBalance: () => Promise<void>;
}

// Helper to safely convert balance to BigInt
function parseBalance(value: unknown): bigint {
  if (value === null || value === undefined) {
    return BigInt(0);
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned) {
      return BigInt(cleaned);
    }
    return BigInt(0);
  }

  if (typeof value === 'number') {
    return BigInt(Math.floor(value));
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if ('balance' in obj) {
      return parseBalance(obj.balance);
    }
  }

  return BigInt(0);
}

export function useSDK(): UseSDKResult {
  // Use the official SDK hook
  const {
    sdk,
    isConnected: sdkConnected,
    address: sdkAddress,
    isLoading: sdkLoading,
    error: sdkError,
    connect: sdkConnect,
  } = useMovementSDK();

  const [balance, setBalance] = useState<bigint>(BigInt(0));

  // Fetch balance
  const refreshBalance = useCallback(async () => {
    if (!sdk || !sdkConnected) return;
    try {
      console.log('[useSDK] Fetching balance...');
      const result = await sdk.getBalance();
      console.log('[useSDK] Balance result:', result, typeof result);
      const parsedBalance = parseBalance(result);
      console.log('[useSDK] Parsed balance:', parsedBalance.toString());
      setBalance(parsedBalance);
    } catch (err) {
      console.error('[useSDK] Failed to fetch balance:', err);
    }
  }, [sdk, sdkConnected]);

  // Refresh balance when connected
  useEffect(() => {
    if (sdkConnected && sdk) {
      refreshBalance();
    }
  }, [sdkConnected, sdk, refreshBalance]);

  const connect = useCallback(async () => {
    if (!sdk) {
      throw new Error('SDK not available');
    }

    try {
      console.log('[useSDK] Connecting...');
      await sdkConnect();
      console.log('[useSDK] Connected');

      // Fetch balance after connecting
      await refreshBalance();
    } catch (err) {
      console.error('[useSDK] Connect error:', err);
      throw err;
    }
  }, [sdk, sdkConnect, refreshBalance]);

  const sendTransaction = useCallback(async (payload: TransactionPayload): Promise<TransactionResult | null> => {
    if (!sdk || !sdkConnected) {
      throw new Error('SDK not connected');
    }

    try {
      console.log('[useSDK] Sending transaction:', payload);

      // Trigger haptic feedback
      try {
        await sdk.haptic?.({ type: 'impact', style: 'medium' });
      } catch (hapticErr) {
        console.warn('[useSDK] Haptic error:', hapticErr);
      }

      // Ensure payload has required arrays
      const sdkPayload = {
        function: payload.function,
        arguments: payload.arguments || [],
        type_arguments: payload.type_arguments || [],
      };

      const result = await sdk.sendTransaction(sdkPayload);
      console.log('[useSDK] Transaction result:', result);

      // Success haptic
      if (result.success) {
        try {
          await sdk.haptic?.({ type: 'notification', style: 'light' });
        } catch (hapticErr) {
          console.warn('[useSDK] Success haptic error:', hapticErr);
        }
      }

      // Refresh balance after transaction
      await refreshBalance();

      return result;
    } catch (err) {
      console.error('[useSDK] Transaction error:', err);
      // Error haptic
      try {
        await sdk.haptic?.({ type: 'notification', style: 'heavy' });
      } catch (hapticErr) {
        console.warn('[useSDK] Error haptic error:', hapticErr);
      }
      throw err;
    }
  }, [sdk, sdkConnected, refreshBalance]);

  return {
    sdk,
    isConnected: sdkConnected,
    address: sdkAddress,
    balance,
    isLoading: sdkLoading,
    error: sdkError,
    connect,
    sendTransaction,
    refreshBalance,
  };
}
