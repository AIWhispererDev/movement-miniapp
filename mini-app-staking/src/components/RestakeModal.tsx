'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, RotateCcw, Info } from 'lucide-react';
import { DelegatorStake } from '@/types/staking';
import { formatMOVE, parseMOVE, MIN_UNSTAKE_AMOUNT, MOVE_DECIMALS } from '@/lib/constants';
import { useSDK } from '@/hooks/useSDK';

interface RestakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stake: DelegatorStake | null;
  onSuccess?: () => void;
}

export function RestakeModal({ isOpen, onClose, stake, onSuccess }: RestakeModalProps) {
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

  const pendingAmount = Number(stake.pendingInactive) / 10 ** MOVE_DECIMALS;
  const amountNum = parseFloat(amount) || 0;
  const minAmount = Number(MIN_UNSTAKE_AMOUNT) / 10 ** MOVE_DECIMALS;

  const isValidAmount = amountNum >= minAmount && amountNum <= pendingAmount;

  const handleRestake = async () => {
    if (!isValidAmount || !stake) return;

    setIsLoading(true);
    setError(null);

    try {
      const amountInOctas = parseMOVE(amount);

      const result = await sendTransaction({
        function: '0x1::delegation_pool::reactivate_stake',
        arguments: [stake.poolAddress, amountInOctas.toString()],
        title: `Restake ${amount} MOVE`,
        description: `Reactivating stake with ${stake.validatorName}`,
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
      setError(err.message || 'Failed to restake. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const setPercentage = (percent: number) => {
    const value = (pendingAmount * percent) / 100;
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
          <h2 className="text-xl font-bold text-white">Restake MOVE</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-400 font-medium">Cancel Unstaking</p>
            <p className="text-xs text-gray-400 mt-1">
              Reactivate your pending unstake to continue earning rewards. Your MOVE will return to active staking.
            </p>
          </div>
        </div>

        {/* Validator Info */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold">
                {stake.validatorName?.charAt(0) || 'V'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{stake.validatorName}</h3>
              <p className="text-sm text-gray-400">
                {formatMOVE(stake.pendingInactive)} MOVE unlocking
              </p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Amount to Restake</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              MOVE
            </span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">
              Min: {minAmount.toFixed(2)} MOVE
            </span>
            <span className="text-xs text-gray-400">
              Unlocking: {formatMOVE(stake.pendingInactive)} MOVE
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
          onClick={handleRestake}
          disabled={!isValidAmount || isLoading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <RotateCcw className="w-5 h-5" />
              Restake MOVE
            </>
          )}
        </button>
      </div>
    </div>
  );
}
