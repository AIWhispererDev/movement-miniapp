import { GraphQLClient, gql } from 'graphql-request';
import { NETWORK_CONFIG } from './constants';

export const graphqlClient = new GraphQLClient(NETWORK_CONFIG.indexerUrl);

export const GET_DELEGATOR_STAKES = gql`
  query GetDelegatorStakes($delegatorAddress: String!) {
    current_delegator_balances(
      where: { delegator_address: { _eq: $delegatorAddress } }
    ) {
      delegator_address
      pool_address
      shares
      table_handle
      parent_table_handle
      pool_type
    }
  }
`;

export const GET_STAKING_ACTIVITIES = gql`
  query GetStakingActivities($delegatorAddress: String!, $limit: Int = 50) {
    delegated_staking_activities(
      where: { delegator_address: { _eq: $delegatorAddress } }
      order_by: { transaction_version: desc }
      limit: $limit
    ) {
      transaction_version
      event_index
      event_type
      pool_address
      delegator_address
      amount
    }
  }
`;

export const GET_DELEGATOR_COUNT = gql`
  query GetDelegatorCount {
    num_active_delegator_per_pool {
      pool_address
      num_active_delegator
    }
  }
`;

export interface DelegatorBalance {
  delegator_address: string;
  pool_address: string;
  shares: string;
  table_handle: string;
  parent_table_handle: string;
  pool_type: string;
}

export interface StakingActivity {
  transaction_version: number;
  event_index: number;
  event_type: string;
  pool_address: string;
  delegator_address: string;
  amount: string;
}

export async function fetchDelegatorStakes(address: string): Promise<DelegatorBalance[]> {
  const data = await graphqlClient.request<{ current_delegator_balances: DelegatorBalance[] }>(
    GET_DELEGATOR_STAKES,
    { delegatorAddress: address }
  );
  return data.current_delegator_balances;
}

export async function fetchStakingActivities(address: string): Promise<StakingActivity[]> {
  const data = await graphqlClient.request<{ delegated_staking_activities: StakingActivity[] }>(
    GET_STAKING_ACTIVITIES,
    { delegatorAddress: address }
  );
  return data.delegated_staking_activities;
}
