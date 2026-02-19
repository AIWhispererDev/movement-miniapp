'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, Clock } from 'lucide-react';
import { DelegatorStake } from '@/types/staking';
import { formatMOVE, parseMOVE, MIN_UNSTAKE_AMOUNT, MOVE_DECIMALS } from '@/lib/constants';
import { useSDK } from '@/hooks/useSDK';

interface UnstakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stake: DelegatorStake | null;
  onSuccess?: () => void;
}

export function UnstakeModal({ isOpen, onClose, stake, onSuccess }: UnstakeModalProps) {
  const { sendTransaction } = useSDK();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !stake) return null;

  const availableStake = Number(stake.activeStake) / 10 ** MOVE_DECIMALS;
  const amountNum = parseFloat(amount) || 0;
  const minUnstake = Number(MIN_UNSTAKE_AMOUNT) / 10 ** MOVE_DECIMALS;

  const isValidAmount = amountNum >= minUnstake && amountNum <= availableStake;

  const handleUnstake = async () => {
    if (!isValidAmount || !stake) return;

    setIsLoading(true);
    setError(null);

    try {
      const amountInOctas = parseMOVE(amount);

      const result = await sendTransaction({
        function: '0x1::delegation_pool::unlock',
        arguments: [stake.poolAddress, amountInOctas.toString()],
        title: `Unstake ${amount} MOVE`,
        description: `Unlocking from ${stake.validatorName}`,
        useFeePayer: true,
        gasLimit: 'Sponsored',
      });

      if (result?.success) {
        onSuccess?.();
        onClose();
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to unstake. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const setPercentage = (percent: number) => {
    const value = (availableStake * percent) / 100;
    // Truncate to 4 decimals (don't round)
    const truncated = Math.floor(value * 10000) / 10000;
    setAmount(truncated.toFixed(4));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 rounded-t-3xl p-6 pb-8 safe-area-bottom animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Unstake MOVE</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-400 font-medium">14-Day Lockup Period</p>
            <p className="text-xs text-gray-400 mt-1">
              Your MOVE will continue earning rewards during the unlock period but won&apos;t be withdrawable until the cycle ends.
            </p>
          </div>
        </div>

        {/* Validator Info */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300 font-bold">
                {stake.validatorName?.charAt(0) || 'V'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{stake.validatorName}</h3>
              <p className="text-sm text-gray-400">
                {formatMOVE(stake.activeStake)} MOVE staked
              </p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Amount to Unstake</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg font-semibold focus:outline-none focus:border-yellow-500 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              MOVE
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">
              Min: {minUnstake.toFixed(2)} MOVE
            </span>
            <span className="text-xs text-gray-400">
              Staked: {formatMOVE(stake.activeStake)} MOVE
            </span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[25, 50, 75, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => setPercentage(percent)}
              className="py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              {percent}%
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleUnstake}
          disabled={!isValidAmount || isLoading}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-400 text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Unstake MOVE'
          )}
        </button>
      </div>
    </div>
  );
}
