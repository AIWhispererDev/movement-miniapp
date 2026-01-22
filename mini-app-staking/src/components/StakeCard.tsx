'use client';

import { useState } from 'react';
import { DelegatorStake } from '@/types/staking';
import { formatMOVE, formatAddress } from '@/lib/constants';
import { ChevronDown, ChevronUp, Clock, TrendingUp, Unlock, RotateCcw, Download, Copy, Check } from 'lucide-react';

interface StakeCardProps {
  stake: DelegatorStake;
  onUnstake?: () => void;
  onWithdraw?: () => void;
  onRestake?: () => void;
}

export function StakeCard({ stake, onUnstake, onWithdraw, onRestake }: StakeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasActiveStake = stake.activeStake > 0;
  const hasPendingUnstake = stake.pendingInactive > 0;
  const canWithdraw = stake.canWithdrawPendingInactive && stake.withdrawableStake > 0;

  // Total value (active + pending)
  const totalValue = stake.activeStake + stake.pendingInactive;

  // Format unlock time
  const formatUnlockTime = () => {
    if (!stake.unlockTime) return null;
    const now = Math.floor(Date.now() / 1000);
    const remaining = stake.unlockTime - now;
    if (remaining <= 0) return 'Ready to withdraw';
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(stake.poolAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 font-bold">
              {stake.validatorName?.charAt(0) || 'V'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {stake.validatorName || 'Validator'}
            </h3>
            <p className="text-sm text-gray-400">
              {formatMOVE(totalValue)} MOVE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stake.rewards !== undefined && stake.rewards > 0 && (
            <div className="text-right">
              <p className="text-sm text-emerald-400 font-medium">
                +{formatMOVE(stake.rewards)}
              </p>
              <p className="text-xs text-gray-500">rewards</p>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {/* Divider */}
          <div className="border-t border-gray-700/50" />

          {/* Active Stake Section */}
          {hasActiveStake && (
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-sm font-medium text-white">Active Stake</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Staked Amount</span>
                  <span className="text-white font-medium">{formatMOVE(stake.activeStake)} MOVE</span>
                </div>
                {stake.activeRewards !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      Rewards Earned
                    </span>
                    <span className="text-emerald-400 font-medium">+{formatMOVE(stake.activeRewards)} MOVE</span>
                  </div>
                )}
              </div>
              {onUnstake && (
                <button
                  onClick={onUnstake}
                  className="w-full mt-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Unstake
                </button>
              )}
            </div>
          )}

          {/* Pending Unstake Section */}
          {hasPendingUnstake && (
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Unlocking</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Amount</span>
                  <span className="text-white font-medium">{formatMOVE(stake.pendingInactive)} MOVE</span>
                </div>
                {stake.pendingInactiveRewards !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      Rewards
                    </span>
                    <span className="text-emerald-400 font-medium">+{formatMOVE(stake.pendingInactiveRewards)} MOVE</span>
                  </div>
                )}
                {stake.unlockTime && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className="text-sm text-yellow-400">{formatUnlockTime()}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                {onRestake && (
                  <button
                    onClick={onRestake}
                    className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restake
                  </button>
                )}
                {canWithdraw && onWithdraw && (
                  <button
                    onClick={onWithdraw}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pool Address */}
          <div className="bg-gray-900/30 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pool Address</p>
                <p className="text-sm text-gray-300 font-mono">{formatAddress(stake.poolAddress, 10)}</p>
              </div>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
