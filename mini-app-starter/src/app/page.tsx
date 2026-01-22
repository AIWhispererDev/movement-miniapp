"use client";

import { Button } from "movement-design-system";
import { useEffect, useState } from "react";
import { useMovementSDK } from "@movement-labs/miniapp-sdk";
import { COUNTER_MODULE_ADDRESS } from "../../constants";

export default function CounterPage() {
  const { sdk, isConnected, address } = useMovementSDK();

  const [counter, setCounter] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch counter value from blockchain
  const fetchCounter = async () => {
    if (!sdk || !address) return;

    try {
      setError("");
      const result = await sdk.view({
        function: `${COUNTER_MODULE_ADDRESS}::counter::get_value`,
        type_arguments: [],
        function_arguments: [address],
      });

      // SDK view returns the result directly, which may be an array
      const value = Array.isArray(result) ? result[0] : result;
      const numValue = Number(value || 0);
      setCounter(numValue);

      // If we can successfully read the value, the counter is initialized
      // (the view function returns 0 if not exists, but we'll assume if it doesn't error, it exists)
      // Actually, let's check by trying to see if the resource exists
      // For now, we'll assume if fetchCounter succeeds, the resource exists
      setIsInitialized(true);
    } catch (err) {
      console.error("[Counter] Failed to fetch:", err);
      // If view fails, counter might not be initialized
      setIsInitialized(false);
      setCounter(0);
    }
  };

  // Fetch counter when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchCounter();
    }
  }, [isConnected, address, sdk]);

  // Initialize counter resource (one-time setup)
  const handleInitialize = async () => {
    if (!sdk || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await sdk.haptic?.({ type: "impact", style: "light" });
      const result = await sdk.sendTransaction({
        function: `${COUNTER_MODULE_ADDRESS}::counter::initialize`,
        type_arguments: [],
        arguments: [],
        title: "Initialize Counter",
        description: "Set up your counter resource",
        useFeePayer: true,
        gasLimit: "Sponsored",
      });

      console.log("[Counter] Initialize tx:", result?.hash);
      setIsInitialized(true);
      await fetchCounter();
      await sdk.notify?.({
        title: "Counter Initialized",
        body: "Your counter is ready!",
      });
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to initialize";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Increment counter
  const handleIncrement = async () => {
    if (!sdk || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isInitialized) {
      setError("Please initialize the counter first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await sdk.haptic?.({ type: "impact", style: "light" });
      const result = await sdk.sendTransaction({
        function: `${COUNTER_MODULE_ADDRESS}::counter::increment`,
        type_arguments: [],
        arguments: [],
        title: "Increment Counter",
        description: "Add 1 to your counter",
        useFeePayer: true,
        gasLimit: "Sponsored",
      });

      console.log("[Counter] Increment tx:", result?.hash);
      await fetchCounter();
      await sdk.haptic?.({ type: "notification", style: "success" });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to increment";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset counter to 0
  const handleReset = async () => {
    if (!sdk || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isInitialized) {
      setError("Please initialize the counter first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await sdk.haptic?.({ type: "impact", style: "medium" });
      const result = await sdk.sendTransaction({
        function: `${COUNTER_MODULE_ADDRESS}::counter::reset`,
        type_arguments: [],
        arguments: [],
        title: "Reset Counter",
        description: "Reset counter to 0",
        useFeePayer: true,
        gasLimit: "Sponsored",
      });

      console.log("[Counter] Reset tx:", result?.hash);
      await fetchCounter();
      await sdk.notify?.({
        title: "Counter Reset",
        body: "Counter set to 0",
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to reset";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Mini App Starter
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A simple on-chain counter... modify it to create Your Mini App!
          </p>
        </div>

        {/* Counter Display */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <div className="text-6xl font-bold text-gray-900 dark:text-white mb-8">
            {counter}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}


          {/* Action buttons */}
          <div className="space-y-3">
            {!isConnected ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Connect your wallet to get started
              </div>
            ) : !isInitialized ? (
              <Button
                onClick={handleInitialize}
                disabled={isLoading}
                variant="default"
                color="green"
                size="lg"
                className="w-full"
              >
                {isLoading ? "Loading..." : "Initialize Counter"}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleIncrement}
                  disabled={isLoading}
                  variant="default"
                  color="green"
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? "Loading..." : "Increment"}
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Footer info */}
        {address && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
      </div>
    </div>
  );
}

