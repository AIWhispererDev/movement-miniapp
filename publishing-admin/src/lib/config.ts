// Registry Contract Configuration
export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '0x4cbdd14b9c9c142aca56de70d55a6017c8d870fc4f45ab6ff21a0b0e9e0b5586';

// Admin addresses (hardcoded for now)
export const ADMIN_ADDRESSES = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES
  ? process.env.NEXT_PUBLIC_ADMIN_ADDRESSES.split(',').map(addr => addr.trim().toLowerCase())
  : [];

// Network configuration
export const NETWORK: 'testnet' | 'mainnet' = 'testnet';

// Node URLs
export const FULLNODE_URL = process.env.NEXT_PUBLIC_FULLNODE_URL;
export const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL;

export const isAdmin = (address: string | undefined): boolean => {
  if (!address) return false;
  return ADMIN_ADDRESSES.includes(address);
};
