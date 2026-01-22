'use client';

import { useState } from 'react';
import { useSDK } from '@/hooks/useSDK';
import { useStaking } from '@/hooks/useStaking';
import { useValidators } from '@/hooks/useValidators';
import { StakeCard } from '@/components/StakeCard';
import { StakeModal } from '@/components/StakeModal';
import { UnstakeModal } from '@/components/UnstakeModal';
import { WithdrawModal } from '@/components/WithdrawModal';
import { RestakeModal } from '@/components/RestakeModal';
import { formatMOVE, formatAddress, ESTIMATED_APY_BPS, formatAPY } from '@/lib/constants';
import { DelegatorStake, ValidatorPool } from '@/types/staking';
import { Wallet, TrendingUp, Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function MyStakesPage() {
  const { isConnected, address, balance, connect, isLoading: sdkLoading, error: sdkError } = useSDK();
  const { stats, isLoading: stakingLoading, refresh } = useStaking(address);
  const { validators } = useValidators();

  const [selectedStake, setSelectedStake] = useState<DelegatorStake | null>(null);
  const [selectedValidator, setSelectedValidator] = useState<ValidatorPool | null>(null);
  const [isUnstakeModalOpen, setIsUnstakeModalOpen] = useState(false);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isRestakeModalOpen, setIsRestakeModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUnstake = (stake: DelegatorStake) => {
    setSelectedStake(stake);
    setIsUnstakeModalOpen(true);
  };

  const handleWithdraw = (stake: DelegatorStake) => {
    setSelectedStake(stake);
    setIsWithdrawModalOpen(true);
  };

  const handleRestake = (stake: DelegatorStake) => {
    setSelectedStake(stake);
    setIsRestakeModalOpen(true);
  };

  const handleAddStake = () => {
    if (validators.length > 0) {
      setSelectedValidator(validators[0]);
      setIsStakeModalOpen(true);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleSuccess = () => {
    refresh();
  };

  // Loading state
  if (sdkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Connect Wallet</h1>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your staking positions
          </p>
          {sdkError ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{sdkError.message}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={connect}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800/50 to-transparent">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-white">My Stakes</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            {formatAddress(address || '', 8)}
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Staked */}
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-xs">Total Staked</span>
            </div>
            <p className="text-xl font-bold text-white">
              {formatMOVE(stats.totalStaked)}
            </p>
            <p className="text-xs text-gray-500">MOVE</p>
          </div>

          {/* Total Rewards */}
          <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Rewards</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">
              +{formatMOVE(stats.totalRewards)}
            </p>
            <p className="text-xs text-emerald-400/60">MOVE</p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-gray-800/30 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">Available to stake</span>
          <span className="text-sm text-white font-medium">
            {formatMOVE(balance)} MOVE
          </span>
        </div>

        {/* Stakes List */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Positions</h2>
            <button
              onClick={handleAddStake}
              className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
            >
              <Plus className="w-4 h-4" />
              Add Stake
            </button>
          </div>

          {stakingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : !stats.delegations || stats.delegations.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl">
              <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">No staking positions yet</p>
              <Link
                href="/validators"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Start Staking
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.delegations.map((stake) => (
                <StakeCard
                  key={stake.poolAddress}
                  stake={stake}
                  onUnstake={() => handleUnstake(stake)}
                  onWithdraw={
                    stake.canWithdrawPendingInactive && stake.withdrawableStake > 0
                      ? () => handleWithdraw(stake)
                      : undefined
                  }
                  onRestake={
                    stake.pendingInactive > 0
                      ? () => handleRestake(stake)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        {stats.isStaking && (
          <div className="bg-gray-800/30 rounded-2xl p-4 mt-4">
            <h3 className="text-sm font-medium text-white mb-2">Staking Info</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Estimated APY: {formatAPY(ESTIMATED_APY_BPS)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>14-day lockup period for unstaking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Rewards compound automatically</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Unstake Modal */}
      <UnstakeModal
        isOpen={isUnstakeModalOpen}
        onClose={() => setIsUnstakeModalOpen(false)}
        stake={selectedStake}
        onSuccess={handleSuccess}
      />

      {/* Stake Modal */}
      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        validator={selectedValidator}
        onSuccess={handleSuccess}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        stake={selectedStake}
        onSuccess={handleSuccess}
      />

      {/* Restake Modal */}
      <RestakeModal
        isOpen={isRestakeModalOpen}
        onClose={() => setIsRestakeModalOpen(false)}
        stake={selectedStake}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
