'use client';

import { ValidatorPool } from '@/types/staking';
import { formatMOVE, formatCommission, formatAPY, getAPYPercent } from '@/lib/constants';
import { ChevronRight, Shield, Percent, TrendingUp } from 'lucide-react';

interface ValidatorCardProps {
  validator: ValidatorPool;
  onStake?: () => void;
  onDetails?: () => void;
  compact?: boolean;
}

export function ValidatorCard({ validator, onStake, onDetails, compact = false }: ValidatorCardProps) {
  // Get APY as percentage for display
  const apyPercent = getAPYPercent(validator.apy);

  if (compact) {
    return (
      <button
        onClick={onDetails || onStake}
        className="w-full bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 hover:border-emerald-500/50 transition-all text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-xs">
                {validator.name?.charAt(0) || 'V'}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-white text-sm">
                {validator.name || 'Validator'}
              </h3>
              <p className="text-xs text-gray-400">
                {formatCommission(validator.commission)} fee
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-semibold text-sm">{formatAPY(validator.apy)}</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-emerald-500/30 transition-all cursor-pointer"
      onClick={onDetails}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 font-bold">
              {validator.name?.charAt(0) || 'V'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">
              {validator.name || 'Validator'}
            </h3>
            {validator.description && (
              <p className="text-xs text-gray-400 line-clamp-1">
                {validator.description}
              </p>
            )}
          </div>
        </div>
        {validator.isActive && (
          <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-900/50 rounded-xl p-3">
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs">APY</span>
          </div>
          <p className="text-emerald-400 font-bold">{formatAPY(validator.apy)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-3">
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Percent className="w-3 h-3" />
            <span className="text-xs">Fee</span>
          </div>
          <p className="text-white font-bold">{formatCommission(validator.commission)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-3">
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Shield className="w-3 h-3" />
            <span className="text-xs">Uptime</span>
          </div>
          <p className="text-white font-bold">{validator.performance}%</p>
        </div>
      </div>

      {/* Total Stake */}
      <div className="flex items-center justify-between bg-gray-900/50 rounded-xl p-3 mb-4">
        <span className="text-sm text-gray-400">Total Staked</span>
        <span className="text-white font-semibold">
          {formatMOVE(validator.totalStake, 0)} MOVE
        </span>
      </div>

      {/* Stake Button */}
      {onStake && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStake();
          }}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Stake MOVE
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
