'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { ValidatorPool } from '@/types/staking';
import { formatMOVE, parseMOVE, MIN_STAKE_AMOUNT, MOVE_DECIMALS, formatAPY, getAPYPercent } from '@/lib/constants';
import { useSDK } from '@/hooks/useSDK';

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  validator: ValidatorPool | null;
  onSuccess?: () => void;
}

export function StakeModal({ isOpen, onClose, validator, onSuccess }: StakeModalProps) {
  const { balance, sendTransaction, isConnected, connect } = useSDK();
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

  if (!isOpen || !validator) return null;

  const availableBalance = Number(balance) / 10 ** MOVE_DECIMALS;
  const amountNum = parseFloat(amount) || 0;
  const minStake = Number(MIN_STAKE_AMOUNT) / 10 ** MOVE_DECIMALS;

  const isValidAmount = amountNum >= minStake && amountNum <= availableBalance;

  const handleStake = async () => {
    if (!isValidAmount || !validator) return;

    setIsLoading(true);
    setError(null);

    try {
      const amountInOctas = parseMOVE(amount);

      const result = await sendTransaction({
        function: '0x1::delegation_pool::add_stake',
        arguments: [validator.poolAddress, amountInOctas.toString()],
        title: `Stake ${amount} MOVE`,
        description: `Staking to ${validator.name}`,
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
      setError(err.message || 'Failed to stake. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const setPercentage = (percent: number) => {
    const value = (availableBalance * percent) / 100;
    // Leave some for gas if staking max
    const adjusted = percent === 100 ? Math.max(0, value - 0.01) : value;
    // Truncate to 4 decimals (don't round)
    const truncated = Math.floor(adjusted * 10000) / 10000;
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
          <h2 className="text-xl font-bold text-white">Stake MOVE</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validator Info */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold">
                {validator.name?.charAt(0) || 'V'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{validator.name}</h3>
              <p className="text-sm text-gray-400">
                {formatAPY(validator.apy)} APY
              </p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Amount to Stake</label>
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
              Min: {minStake.toFixed(2)} MOVE
            </span>
            <span className="text-xs text-gray-400">
              Available: {formatMOVE(balance)} MOVE
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

        {/* Projected Rewards */}
        {amountNum > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-400">Est. Yearly Rewards</span>
              <span className="text-emerald-400 font-semibold">
                +{((amountNum * getAPYPercent(validator.apy)) / 100).toFixed(2)} MOVE
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action Button */}
        {!isConnected ? (
          <button
            onClick={connect}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={handleStake}
            disabled={!isValidAmount || isLoading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Staking...
              </>
            ) : (
              'Stake MOVE'
            )}
          </button>
        )}

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          14-day lockup period. You can unstake anytime but funds will be available after the lockup cycle ends.
        </p>
      </div>
    </div>
  );
}
