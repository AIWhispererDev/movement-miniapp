'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

interface TransactionPayload {
  function: string;
  arguments?: any[];
  type_arguments?: string[];
  title?: string;
  description?: string;
}

interface TransactionResult {
  hash: string;
  success: boolean;
}

export interface UseSDKResult {
  sdk: ReturnType<typeof useMovementSDK>['sdk'];
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  sendTransaction: (payload: TransactionPayload) => Promise<TransactionResult | null>;
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

  const connect = useCallback(async () => {
    if (!sdk) {
      throw new Error('SDK not available');
    }

    try {
      console.log('[useSDK] Connecting...');
      await sdkConnect();
      console.log('[useSDK] Connected');
    } catch (err) {
      console.error('[useSDK] Connect error:', err);
      throw err;
    }
  }, [sdk, sdkConnect]);

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
  }, [sdk, sdkConnected]);

  return {
    sdk,
    isConnected: sdkConnected,
    address: sdkAddress,
    isLoading: sdkLoading,
    error: sdkError,
    connect,
    sendTransaction,
  };
}
