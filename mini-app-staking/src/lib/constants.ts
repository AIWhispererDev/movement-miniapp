import { ValidatorPool } from '@/types/staking';

// Network Configuration Type
export interface NetworkConfig {
  name: string;
  network: string;
  chainId: string;
  nodeUrl: string;
  indexerUrl: string;
  delegationPoolModule: string;
}

// Mainnet Configuration
export const MAINNET_CONFIG: NetworkConfig = {
  name: 'Movement Mainnet',
  network: 'mainnet',
  chainId: '126',
  nodeUrl: 'https://mainnet.movementnetwork.xyz/v1',
  indexerUrl: 'https://indexer.mainnet.movementnetwork.xyz/v1/graphql',
  delegationPoolModule: '0x1::delegation_pool',
};

// Testnet Configuration
export const TESTNET_CONFIG: NetworkConfig = {
  name: 'Movement Testnet',
  network: 'testnet',
  chainId: '250',
  nodeUrl: 'https://testnet.movementnetwork.xyz/v1',
  indexerUrl: 'https://hasura.testnet.movementnetwork.xyz/v1/graphql',
  delegationPoolModule: '0x1::delegation_pool',
};

export function getNetworkConfig(network: 'mainnet' | 'testnet'): NetworkConfig {
  return network === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
}

// Default to mainnet for the mini app
export const NETWORK_CONFIG = MAINNET_CONFIG;

// Staking Constants (Movement uses 8 decimals like Aptos)
export const MOVE_DECIMALS = 8;
export const MIN_STAKE_AMOUNT = BigInt('1000100000'); // 10.01 MOVE
export const MIN_UNSTAKE_AMOUNT = BigInt('1000010000'); // 10 MOVE
export const LOCKUP_PERIOD = 14 * 24 * 60 * 60; // 14 days in seconds

// APY in basis points (1000 = 10%)
export const ESTIMATED_APY_BPS = 1000;

// Featured Validators - Mainnet
// APY and commission are in basis points (e.g., 1000 = 10%, 500 = 5%)
export const FEATURED_VALIDATORS: ValidatorPool[] = [
  {
    poolAddress: '0x1ef54ef84e7fb389095f83021755dd71bb51cbfbc8124a4349ec619f9d901f1f',
    operatorAddress: '0xe3182576475dba780baac237cf5ddd48ecdd1af46fdb4556213099b712f685c0',
    commission: 0, // Fetched from on-chain
    totalStake: BigInt('0'), // Fetched from on-chain
    isActive: true,
    apy: 1000, // 10% in basis points - placeholder until on-chain
    performance: 99.9,
    name: 'Apollo',
    description: 'Movement delegation pool for staking',
  },
  {
    poolAddress: '0x830bfd0cd58b06dc938d409b6f3bc8ee97818ffcf9b32d714c068454afb644c7',
    operatorAddress: '0x7f2f6077ad31fbfe3f03b514405b35945eb0ecdfce9ff9d85c30dffdb2e19140',
    commission: 0,
    totalStake: BigInt('0'),
    isActive: true,
    apy: 1000,
    performance: 99.9,
    name: 'Hephaestus',
    description: 'Movement delegation pool for staking',
  },
  {
    poolAddress: '0x39f116ee9ef048895bff51a5ce62229d153a6fe855798fa75810fd2b85008b9c',
    operatorAddress: '0x58354b7f12cf6162a2702a61d1f5db7b30e3903c146b16616b036364346d9e5b',
    commission: 0,
    totalStake: BigInt('0'),
    isActive: true,
    apy: 1000,
    performance: 99.9,
    name: 'Hermes',
    description: 'Movement delegation pool for staking',
  },
  {
    poolAddress: '0xccba2d929183a642f64d10d27bae0947c112ed7f5427ca3c64a1f0dd0b4b76ea',
    operatorAddress: '0xaa80be0fe238d329028f92dd7b7a3b2f23bac16f382911b3d156347f213233dc',
    commission: 0,
    totalStake: BigInt('0'),
    isActive: true,
    apy: 1000,
    performance: 99.9,
    name: 'Artemis',
    description: 'Movement delegation pool for staking',
  },
];

// Helper functions

/**
 * Format MOVE amount from octas to human-readable
 * @param amount Amount in octas (bigint or number)
 * @param decimals Number of decimal places to show
 */
export function formatMOVE(amount: bigint | number, decimals: number = 2): string {
  const value = typeof amount === 'bigint'
    ? Number(amount) / 10 ** MOVE_DECIMALS
    : amount / 10 ** MOVE_DECIMALS;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Parse MOVE amount from human-readable to octas
 * @param amount Amount in MOVE (e.g., "10.5")
 */
export function parseMOVE(amount: string): bigint {
  const num = parseFloat(amount);
  return BigInt(Math.floor(num * 10 ** MOVE_DECIMALS));
}

/**
 * Format address for display (truncated)
 * @param address Full address
 * @param chars Number of chars to show on each side
 */
export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format APY from basis points to percentage string
 * @param basisPoints APY in basis points (1000 = 10%)
 */
export function formatAPY(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(1)}%`;
}

/**
 * Format commission from basis points to percentage string
 * @param basisPoints Commission in basis points (500 = 5%)
 */
export function formatCommission(basisPoints: number): string {
  return `${(basisPoints / 100).toFixed(1)}%`;
}

/**
 * Get APY as a number (percentage)
 * @param basisPoints APY in basis points
 */
export function getAPYPercent(basisPoints: number): number {
  return basisPoints / 100;
}
