'use client';

import useSWR from 'swr';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { DelegatorStake, StakingStats } from '@/types/staking';
import { NETWORK_CONFIG, FEATURED_VALIDATORS, ESTIMATED_APY_BPS } from '@/lib/constants';
import { fetchDelegatorStakes, fetchStakingActivities } from '@/lib/graphql';

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: NETWORK_CONFIG.nodeUrl,
});

const client = new Aptos(config);

// Map pool addresses to names
const validatorNameMap = new Map(
  FEATURED_VALIDATORS.map((v) => [v.poolAddress.toLowerCase(), v.name])
);

async function fetchStakingData(address: string): Promise<StakingStats> {
  // Fetch delegator stakes from indexer
  const delegatorBalances = await fetchDelegatorStakes(address);

  if (delegatorBalances.length === 0) {
    return {
      totalStaked: BigInt(0),
      totalRewards: BigInt(0),
      apy: ESTIMATED_APY_BPS,
      isStaking: false,
      canWithdraw: false,
      delegations: [],
    };
  }

  // Fetch staking activities for rewards calculation
  const activities = await fetchStakingActivities(address);

  // Get unique pool addresses
  const poolAddresses = [...new Set(delegatorBalances.map((b) => b.pool_address))];

  // Fetch detailed stake info for each pool
  const delegations: DelegatorStake[] = await Promise.all(
    poolAddresses.map(async (poolAddress) => {
      try {
        // Get stake info
        const stakeResult = await client.view({
          payload: {
            function: '0x1::delegation_pool::get_stake',
            functionArguments: [poolAddress, address],
          },
        });

        const [active, inactive, pendingInactive] = stakeResult as [string, string, string];

        // Get pending withdrawal status
        let canWithdrawPendingInactive = false;
        let withdrawableAmount = BigInt(0);

        try {
          const withdrawResult = await client.view({
            payload: {
              function: '0x1::delegation_pool::get_pending_withdrawal',
              functionArguments: [poolAddress, address],
            },
          });

          canWithdrawPendingInactive = withdrawResult[0] as boolean;
          withdrawableAmount = BigInt(withdrawResult[1] as string);
        } catch {
          // get_pending_withdrawal might not exist on all pools
        }

        // Get remaining lockup time
        let unlockTime: number | undefined;
        try {
          const lockupResult = await client.view({
            payload: {
              function: '0x1::stake::get_remaining_lockup_secs',
              functionArguments: [poolAddress],
            },
          });

          const remainingSecs = Number(lockupResult[0]);
          if (remainingSecs > 0) {
            unlockTime = Math.floor(Date.now() / 1000) + remainingSecs;
          }
        } catch {
          // Lockup info might not be available
        }

        // Calculate rewards from activities
        const poolActivities = activities.filter(
          (a) => a.pool_address.toLowerCase() === poolAddress.toLowerCase()
        );

        let activePrincipal = BigInt(0);
        let pendingInactivePrincipal = BigInt(0);

        // Replay events to calculate principal
        for (const activity of poolActivities.reverse()) {
          const amount = BigInt(activity.amount);
          if (activity.event_type.includes('AddStake')) {
            activePrincipal += amount;
          } else if (activity.event_type.includes('UnlockStake')) {
            activePrincipal -= amount;
            pendingInactivePrincipal += amount;
          } else if (activity.event_type.includes('ReactivateStake')) {
            activePrincipal += amount;
            pendingInactivePrincipal -= amount;
          }
        }

        const activeStakeBigInt = BigInt(active);
        const pendingInactiveBigInt = BigInt(pendingInactive);

        // Calculate rewards
        const activeRewards = activeStakeBigInt > activePrincipal
          ? activeStakeBigInt - activePrincipal
          : undefined;
        const pendingInactiveRewards = pendingInactiveBigInt > pendingInactivePrincipal
          ? pendingInactiveBigInt - pendingInactivePrincipal
          : undefined;

        return {
          poolAddress,
          activeStake: activeStakeBigInt,
          pendingInactive: pendingInactiveBigInt,
          withdrawableStake: withdrawableAmount,
          rewards: activeRewards !== undefined && pendingInactiveRewards !== undefined
            ? activeRewards + pendingInactiveRewards
            : undefined,
          activeRewards,
          pendingInactiveRewards,
          unlockTime,
          canWithdrawPendingInactive,
          validatorName: validatorNameMap.get(poolAddress.toLowerCase()) || 'Unknown Validator',
        };
      } catch (err) {
        console.error(`Failed to fetch stake for pool ${poolAddress}:`, err);
        return {
          poolAddress,
          activeStake: BigInt(0),
          pendingInactive: BigInt(0),
          withdrawableStake: BigInt(0),
          rewards: undefined,
          validatorName: validatorNameMap.get(poolAddress.toLowerCase()) || 'Unknown Validator',
        };
      }
    })
  );

  // Filter out empty delegations
  const activeDelegations = delegations.filter(
    (d) => d.activeStake > 0 || d.pendingInactive > 0 || d.withdrawableStake > 0
  );

  // Calculate totals
  const totalStaked = activeDelegations.reduce((sum, d) => sum + d.activeStake, BigInt(0));
  const totalRewards = activeDelegations.reduce((sum, d) => sum + (d.rewards || BigInt(0)), BigInt(0));
  const canWithdraw = activeDelegations.some((d) => d.canWithdrawPendingInactive && d.withdrawableStake > 0);

  return {
    totalStaked,
    totalRewards,
    apy: ESTIMATED_APY_BPS,
    isStaking: totalStaked > 0,
    canWithdraw,
    delegations: activeDelegations,
  };
}

export function useStaking(address: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    address ? ['staking', address] : null,
    () => fetchStakingData(address!),
    {
      dedupingInterval: 60 * 1000, // 1 minute
      revalidateOnFocus: true,
    }
  );

  return {
    stats: data || {
      totalStaked: BigInt(0),
      totalRewards: BigInt(0),
      apy: ESTIMATED_APY_BPS,
      isStaking: false,
      canWithdraw: false,
      delegations: [],
    },
    isLoading,
    error,
    refresh: mutate,
  };
}
