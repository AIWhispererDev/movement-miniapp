export interface StakeInfo {
  active: bigint;
  inactive: bigint;
  pendingActive: bigint;
  pendingInactive: bigint;
}

export interface ValidatorPool {
  poolAddress: string;
  operatorAddress: string;
  commission: number; // Basis points (0-10000)
  totalStake: bigint;
  isActive: boolean;
  apy: number;
  performance: number;
  delegatorCount?: number;
  name?: string;
  logo?: string;
  website?: string;
  description?: string;
}

export interface DelegatorStake {
  poolAddress: string;
  activeStake: bigint;
  pendingInactive: bigint;
  withdrawableStake: bigint;
  rewards: bigint | undefined;
  activeRewards?: bigint | undefined;
  pendingInactiveRewards?: bigint | undefined;
  unlockTime?: number;
  stakeStartTime?: number;
  canWithdrawPendingInactive?: boolean;
  validatorName?: string;
}

export interface StakingStats {
  totalStaked: bigint;
  totalRewards: bigint;
  apy: number;
  isStaking: boolean;
  canWithdraw: boolean;
  unlockTime?: number;
  delegations?: DelegatorStake[];
}

export interface StakingActivity {
  transaction_version: number;
  event_index: number;
  event_type: string;
  pool_address: string;
  delegator_address: string;
  amount: string;
}
