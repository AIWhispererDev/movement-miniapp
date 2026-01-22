'use client';

import { useState } from 'react';
import { useSDK } from '@/hooks/useSDK';
import { useValidators } from '@/hooks/useValidators';
import { useStaking } from '@/hooks/useStaking';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ValidatorCard } from '@/components/ValidatorCard';
import { StakeModal } from '@/components/StakeModal';
import { ValidatorDetailsModal } from '@/components/ValidatorDetailsModal';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { formatMOVE, ESTIMATED_APY_BPS, formatAPY } from '@/lib/constants';
import { ValidatorPool } from '@/types/staking';
import { TrendingUp, Wallet, ArrowRight, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { isConnected, address, balance, isLoading: sdkLoading, error: sdkError, connect } = useSDK();
  const { validators, isLoading: validatorsLoading } = useValidators();
  const { stats, refresh: refreshStaking } = useStaking(address);
  const { isOnboardingOpen, openOnboarding, closeOnboarding } = useOnboarding();

  const [selectedValidator, setSelectedValidator] = useState<ValidatorPool | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleStake = (validator: ValidatorPool) => {
    setSelectedValidator(validator);
    setIsStakeModalOpen(true);
  };

  const handleViewDetails = (validator: ValidatorPool) => {
    setSelectedValidator(validator);
    setIsDetailsModalOpen(true);
  };

  const handleStakeFromDetails = () => {
    setIsDetailsModalOpen(false);
    setIsStakeModalOpen(true);
  };

  const handleStakeSuccess = () => {
    refreshStaking();
  };

  // Loading state
  if (sdkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state (not in mini app)
  if (sdkError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Mini App Required</h1>
          <p className="text-gray-400 mb-6">
            Please open this app in the Movement Everything wallet to use staking features.
          </p>
          <a
            href="https://staking.movementnetwork.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
          >
            Visit web staking
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-500/20 to-transparent pt-safe">
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Movement Staking</h1>
              <p className="text-gray-400 text-sm">Stake MOVE and earn rewards</p>
            </div>
            <button
              onClick={openOnboarding}
              className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-gray-800 transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Balance Card */}
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-xs">Available</span>
            </div>
            <p className="text-xl font-bold text-white">
              {isConnected ? formatMOVE(balance) : '0.00'}
            </p>
            <p className="text-xs text-gray-500">MOVE</p>
          </div>

          {/* APY Card */}
          <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Est. APY</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{formatAPY(ESTIMATED_APY_BPS)}</p>
            <p className="text-xs text-emerald-400/60">Annual yield</p>
          </div>
        </div>

        {/* Staking Summary */}
        {isConnected && stats.isStaking && (
          <Link href="/my-stakes">
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Your Total Staked</p>
                  <p className="text-2xl font-bold text-white">
                    {formatMOVE(stats.totalStaked)} MOVE
                  </p>
                  {stats.totalRewards > 0 && (
                    <p className="text-sm text-emerald-400 mt-1">
                      +{formatMOVE(stats.totalRewards)} MOVE rewards
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>
        )}

        {/* Connect Wallet CTA */}
        {!isConnected && (
          <button
            onClick={connect}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold transition-colors"
          >
            Connect Wallet to Stake
          </button>
        )}

        {/* Validators Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Top Validators</h2>
            {validators.length > 4 && (
              <Link
                href="/validators"
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {validatorsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-700" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
                      <div className="h-3 bg-gray-700 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {validators.slice(0, 4).map((validator) => (
                <ValidatorCard
                  key={validator.poolAddress}
                  validator={validator}
                  onStake={isConnected ? () => handleStake(validator) : undefined}
                  onDetails={() => handleViewDetails(validator)}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl p-5 border border-emerald-500/20 mt-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Earn up to {formatAPY(ESTIMATED_APY_BPS)} APY
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Stake your MOVE tokens with trusted validators and earn rewards while securing the network.
          </p>
          <Link
            href="/validators"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
          >
            Start Staking
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stake Modal */}
      <StakeModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        validator={selectedValidator}
        onSuccess={handleStakeSuccess}
      />

      {/* Validator Details Modal */}
      <ValidatorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        validator={selectedValidator}
        onStake={isConnected ? handleStakeFromDetails : undefined}
      />

      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
      />
    </div>
  );
}
