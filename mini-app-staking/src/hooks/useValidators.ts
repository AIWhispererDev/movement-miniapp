'use client';

import useSWR from 'swr';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { ValidatorPool } from '@/types/staking';
import { FEATURED_VALIDATORS, NETWORK_CONFIG } from '@/lib/constants';

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: NETWORK_CONFIG.nodeUrl,
});

const client = new Aptos(config);

/**
 * Fetches validator data from on-chain
 * - Total stake from get_delegation_pool_stake
 * - Commission from operator_commission_percentage
 */
async function fetchValidators(): Promise<ValidatorPool[]> {
  const validators = [...FEATURED_VALIDATORS];

  // Fetch on-chain data for each validator in parallel
  const updatedValidators = await Promise.all(
    validators.map(async (validator) => {
      try {
        // Fetch stake data and commission in parallel
        const [stakeResult, commissionResult] = await Promise.all([
          client.view({
            payload: {
              function: `${NETWORK_CONFIG.delegationPoolModule}::get_delegation_pool_stake` as `${string}::${string}::${string}`,
              functionArguments: [validator.poolAddress],
            },
          }),
          client.view({
            payload: {
              function: `${NETWORK_CONFIG.delegationPoolModule}::operator_commission_percentage` as `${string}::${string}::${string}`,
              functionArguments: [validator.poolAddress],
            },
          }),
        ]);

        // Parse stake data
        const [active, inactive, pendingInactive] = stakeResult as [string, string, string];
        const totalStake = BigInt(active || '0') + BigInt(inactive || '0') + BigInt(pendingInactive || '0');

        // Parse commission (returned in basis points, 0-10000)
        const commission = Number(Array.isArray(commissionResult) ? commissionResult[0] : commissionResult);

        return {
          ...validator,
          totalStake,
          commission, // Store as basis points
        };
      } catch (err) {
        console.error(`Failed to fetch data for validator ${validator.name}:`, err);
        return validator;
      }
    })
  );

  // Sort by total stake (descending)
  return updatedValidators.sort((a, b) => {
    if (a.totalStake > b.totalStake) return -1;
    if (a.totalStake < b.totalStake) return 1;
    return 0;
  });
}

export function useValidators() {
  const { data, error, isLoading, mutate } = useSWR(
    'validators',
    fetchValidators,
    {
      // Don't auto-refresh - validator data rarely changes
      refreshInterval: 0,
      // Revalidate when user returns to tab
      revalidateOnFocus: true,
      // Don't retry on error more than 3 times
      errorRetryCount: 3,
      // Cache for 5 minutes before considering stale
      dedupingInterval: 300000,
    }
  );

  const getValidatorByAddress = (poolAddress: string) => {
    return data?.find((v) => v.poolAddress.toLowerCase() === poolAddress.toLowerCase());
  };

  return {
    validators: data || [],
    isLoading,
    error,
    refresh: mutate,
    getValidatorByAddress,
  };
}
