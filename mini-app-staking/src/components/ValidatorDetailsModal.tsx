'use client';

import { X, TrendingUp, Percent, Shield, Users, ExternalLink, CheckCircle } from 'lucide-react';
import { ValidatorPool } from '@/types/staking';
import { formatMOVE, formatCommission, formatAPY, formatAddress, getAPYPercent } from '@/lib/constants';

interface ValidatorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  validator: ValidatorPool | null;
  onStake?: () => void;
}

export function ValidatorDetailsModal({ isOpen, onClose, validator, onStake }: ValidatorDetailsModalProps) {
  if (!isOpen || !validator) return null;

  const apyPercent = getAPYPercent(validator.apy);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 rounded-t-3xl p-6 pb-8 safe-area-bottom animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-lg">
                {validator.name?.charAt(0) || 'V'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{validator.name}</h2>
              <p className="text-sm text-gray-400">{formatAddress(validator.poolAddress, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        {validator.isActive && (
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-400 font-medium">Active Validator</span>
            </div>
          </div>
        )}

        {/* Description */}
        {validator.description && (
          <div className="mb-6">
            <p className="text-gray-300">{validator.description}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">APY</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatAPY(validator.apy)}</p>
            <p className="text-xs text-gray-500 mt-1">Estimated annual yield</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Percent className="w-4 h-4" />
              <span className="text-sm">Commission</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCommission(validator.commission)}</p>
            <p className="text-xs text-gray-500 mt-1">Validator fee</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Uptime</span>
            </div>
            <p className="text-2xl font-bold text-white">{validator.performance}%</p>
            <p className="text-xs text-gray-500 mt-1">Network availability</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Total Staked</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatMOVE(validator.totalStake, 0)}</p>
            <p className="text-xs text-gray-500 mt-1">MOVE tokens</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-800/30 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Features</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-300">High Performance Infrastructure</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-300">Secure & Reliable Operations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-300">Transparent Fee Structure</span>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-gray-800/30 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Addresses</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pool Address</p>
              <p className="text-sm text-gray-300 font-mono break-all">{validator.poolAddress}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Operator Address</p>
              <p className="text-sm text-gray-300 font-mono break-all">{validator.operatorAddress}</p>
            </div>
          </div>
        </div>

        {/* Stake Button */}
        {onStake && (
          <button
            onClick={onStake}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
          >
            Stake with {validator.name}
          </button>
        )}
      </div>
    </div>
  );
}
