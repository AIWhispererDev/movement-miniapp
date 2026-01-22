'use client';

import { useState } from 'react';
import { useSDK } from '@/hooks/useSDK';
import { useValidators } from '@/hooks/useValidators';
import { useStaking } from '@/hooks/useStaking';
import { ValidatorCard } from '@/components/ValidatorCard';
import { StakeModal } from '@/components/StakeModal';
import { ValidatorDetailsModal } from '@/components/ValidatorDetailsModal';
import { ValidatorPool } from '@/types/staking';
import { Search, Loader2, Filter } from 'lucide-react';

type SortOption = 'stake' | 'apy' | 'commission';

export default function ValidatorsPage() {
  const { isConnected, address } = useSDK();
  const { validators, isLoading, refresh } = useValidators();
  const { refresh: refreshStaking } = useStaking(address);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('stake');
  const [selectedValidator, setSelectedValidator] = useState<ValidatorPool | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filter validators by search
  const filteredValidators = validators.filter((v) =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.poolAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort validators
  const sortedValidators = [...filteredValidators].sort((a, b) => {
    switch (sortBy) {
      case 'apy':
        return b.apy - a.apy;
      case 'commission':
        return a.commission - b.commission;
      case 'stake':
      default:
        if (a.totalStake > b.totalStake) return -1;
        if (a.totalStake < b.totalStake) return 1;
        return 0;
    }
  });

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
    refresh();
    refreshStaking();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800/50 to-transparent">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-white mb-1">Validators</h1>
          <p className="text-gray-400 text-sm">
            Choose a validator to stake your MOVE
          </p>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search validators..."
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Sort:</span>
            <div className="flex gap-2">
              {[
                { value: 'stake', label: 'Stake' },
                { value: 'apy', label: 'APY' },
                { value: 'commission', label: 'Fee' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as SortOption)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Validators List */}
      <div className="px-4 space-y-3 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : sortedValidators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No validators found</p>
          </div>
        ) : (
          sortedValidators.map((validator) => (
            <ValidatorCard
              key={validator.poolAddress}
              validator={validator}
              onStake={isConnected ? () => handleStake(validator) : undefined}
              onDetails={() => handleViewDetails(validator)}
            />
          ))
        )}
      </div>

      {/* Not Connected Notice */}
      {!isConnected && validators.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4">
          <div className="bg-gray-800/95 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50 text-center">
            <p className="text-sm text-gray-300">
              Connect your wallet to start staking
            </p>
          </div>
        </div>
      )}

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
    </div>
  );
}
