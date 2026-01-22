'use client';

import { useState } from 'react';
import { X, AlertCircle, Loader2, Download, CheckCircle } from 'lucide-react';
import { DelegatorStake } from '@/types/staking';
import { formatMOVE } from '@/lib/constants';
import { useSDK } from '@/hooks/useSDK';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  stake: DelegatorStake | null;
  onSuccess?: () => void;
}

export function WithdrawModal({ isOpen, onClose, stake, onSuccess }: WithdrawModalProps) {
  const { sendTransaction } = useSDK();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !stake) return null;

  const withdrawableAmount = stake.withdrawableStake || stake.pendingInactive;

  const handleWithdraw = async () => {
    if (!stake) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sendTransaction({
        function: '0x1::delegation_pool::withdraw',
        arguments: [stake.poolAddress, withdrawableAmount.toString()],
        title: `Withdraw ${formatMOVE(withdrawableAmount)} MOVE`,
        description: `Withdrawing from ${stake.validatorName}`,
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
      setError(err.message || 'Failed to withdraw. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-xl font-bold text-white">Withdraw MOVE</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-gray-300 mb-2">Your unstaking period is complete!</p>
          <p className="text-gray-400 text-sm">
            Withdraw your MOVE tokens back to your wallet.
          </p>
        </div>

        {/* Amount */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Amount to withdraw</p>
                <p className="text-xl font-bold text-white">{formatMOVE(withdrawableAmount)} MOVE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Validator Info */}
        <div className="bg-gray-800/30 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300 font-bold text-xs">
                {stake.validatorName?.charAt(0) || 'V'}
              </span>
            </div>
            <div>
              <p className="text-sm text-white">{stake.validatorName}</p>
              <p className="text-xs text-gray-500">Validator</p>
            </div>
          </div>
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
          onClick={handleWithdraw}
          disabled={isLoading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Withdrawing...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Withdraw to Wallet
            </>
          )}
        </button>
      </div>
    </div>
  );
}
