import { Aptos, AptosConfig, Network, AccountAddress } from '@aptos-labs/ts-sdk';
import { REGISTRY_ADDRESS } from './config';
import { AppMetadata, PendingChange } from '@/types/app';

// Lazy initialization to ensure env vars are loaded
let aptosInstance: Aptos | null = null;

function getAptosClient(): Aptos {
  if (!aptosInstance) {
    const fullnodeUrl = process.env.NEXT_PUBLIC_FULLNODE_URL;
    const indexerUrl = process.env.NEXT_PUBLIC_INDEXER_URL;
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '250';

    if (!fullnodeUrl || !indexerUrl) {
      throw new Error('FULLNODE_URL and INDEXER_URL must be set in environment variables');
    }

    const config = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: fullnodeUrl,
      indexer: indexerUrl,
    });

    aptosInstance = new Aptos(config);
  }
  return aptosInstance;
}

// View functions
export async function getApp(appId: number): Promise<AppMetadata | null> {
  try {
    const aptos = getAptosClient();
    console.log('Fetching app with ID:', appId);
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::get_app`,
        functionArguments: [appId],
      },
    });
    console.log('App result:', result);
    const app = result[0] as AppMetadata;
    // Add app_id to the metadata
    return { ...app, app_id: appId };
  } catch (error) {
    console.error('Error fetching app', appId, ':', error);
    return null;
  }
}

export async function getStats(): Promise<{ total: number; approved: number; pending: number }> {
  try {
    const aptos = getAptosClient();
    console.log('Fetching stats from:', `${REGISTRY_ADDRESS}::app_registry::get_stats`);
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::get_stats`,
        functionArguments: [],
      },
    });
    console.log('Stats result:', result);
    const stats = {
      total: Number(result[0]),
      approved: Number(result[1]),
      pending: Number(result[2]),
    };
    console.log('Parsed stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { total: 0, approved: 0, pending: 0 };
  }
}

export async function hasPendingChange(appId: number): Promise<boolean> {
  try {
    const aptos = getAptosClient();
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::has_pending_change`,
        functionArguments: [appId],
      },
    });
    return result[0] as boolean;
  } catch (error) {
    console.error('Error checking pending changes:', error);
    return false;
  }
}

export async function getPendingChange(appId: number): Promise<PendingChange | null> {
  try {
    const aptos = getAptosClient();
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::get_pending_change`,
        functionArguments: [appId],
      },
    });
    return result[0] as PendingChange;
  } catch (error) {
    console.error('Error fetching pending change:', error);
    return null;
  }
}

// Normalize address to proper 0x + 64 hex chars format
function normalizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    throw new Error('Invalid address: must be a non-empty string');
  }
  let hex = address.toLowerCase().trim();
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  // Remove any non-hex characters
  hex = hex.replace(/[^0-9a-f]/g, '');
  // Pad to 64 characters if needed
  hex = hex.padStart(64, '0');
  return `0x${hex}`;
}

export async function checkIsOwner(address: string): Promise<boolean> {
  try {
    console.log('checkIsOwner called with address:', address);
    const aptos = getAptosClient();
    const normalizedAddress = normalizeAddress(address);
    console.log('Normalized address:', normalizedAddress);
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::check_is_owner`,
        functionArguments: [normalizedAddress],
      },
    });
    console.log('checkIsOwner result:', result);
    return result[0] as boolean;
  } catch (error) {
    console.error('Error checking owner:', error);
    return false;
  }
}

export async function getOwners(): Promise<string[]> {
  try {
    const aptos = getAptosClient();
    console.log('Fetching owners from registry');
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::get_owners`,
        functionArguments: [],
      },
    });
    console.log('Owners result:', result);
    return result[0] as string[];
  } catch (error) {
    console.error('Error fetching owners:', error);
    return [];
  }
}

export async function getAllAppIds(): Promise<number[]> {
  try {
    const aptos = getAptosClient();
    console.log('Fetching all app indices');
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::get_all_app_indices`,
        functionArguments: [],
      },
    });
    console.log('All app indices result:', result);
    return (result[0] as number[]) || [];
  } catch (error) {
    console.error('Error fetching all app indices:', error);
    return [];
  }
}

export async function getNonApprovedApps(): Promise<AppMetadata[]> {
  try {
    const aptos = getAptosClient();
    console.log('Fetching non-approved apps');
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::get_non_approved_apps`,
        functionArguments: [],
      },
    });
    console.log('Non-approved apps result:', result);
    return result[0] as AppMetadata[];
  } catch (error) {
    console.error('Error fetching non-approved apps:', error);
    return [];
  }
}

// Get ALL apps (approved, pending, rejected) - requires admin/owner access
export async function getAllApps(callerAddress: string): Promise<AppMetadata[]> {
  try {
    console.log('Fetching all apps for admin:', callerAddress);

    // Get all app IDs first
    const allIds = await getAllAppIds();
    console.log('Found app IDs:', allIds.length);

    // Fetch metadata for each app
    const apps: AppMetadata[] = [];
    for (const appId of allIds) {
      try {
        const app = await getApp(appId);
        if (app) {
          apps.push(app);
        }
      } catch (error) {
        console.error(`Error fetching app with ID ${appId}:`, error);
      }
    }

    console.log('Total apps loaded:', apps.length);
    return apps;
  } catch (error) {
    console.error('Error fetching all apps:', error);
    return [];
  }
}

// Helper function to build and submit transactions manually
// This bypasses the wallet adapter's network validation
async function buildAndSubmitTransaction(
  account: any,
  signTransaction: any,
  functionName: `${string}::${string}::${string}`,
  functionArguments: any[]
): Promise<boolean> {
  try {
    const aptos = getAptosClient();

    // Build the transaction
    const transaction = await aptos.transaction.build.simple({
      sender: account.address,
      data: {
        function: functionName,
        functionArguments: functionArguments,
      },
    });

    // Sign the transaction with the wallet
    const senderAuthenticator = await signTransaction(transaction);

    // Submit the signed transaction
    const committedTransaction = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });

    // Wait for transaction confirmation
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash
    });

    console.log('Transaction successful:', executedTransaction);
    return true;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

// Entry functions (require wallet signature)
export async function approveApp(
  account: any,
  signTransaction: any,
  appId: number
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::approve_app`,
      [appId]
    );
  } catch (error) {
    console.error('Error approving app:', error);
    return false;
  }
}

export async function rejectApp(
  account: any,
  signTransaction: any,
  appId: number,
  reason: string
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::reject_app`,
      [appId, reason]
    );
  } catch (error) {
    console.error('Error rejecting app:', error);
    return false;
  }
}

export async function approveUpdate(
  account: any,
  signTransaction: any,
  appId: number
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::approve_update`,
      [appId]
    );
  } catch (error) {
    console.error('Error approving update:', error);
    return false;
  }
}

export async function updateStats(
  account: any,
  signTransaction: any,
  appId: number,
  downloads: number,
  rating: number
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::update_stats`,
      [appId, downloads, rating * 10]
    );
  } catch (error) {
    console.error('Error updating stats:', error);
    return false;
  }
}

export async function approveRejectedApp(
  account: any,
  signTransaction: any,
  appId: number
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::approve_rejected_app`,
      [appId]
    );
  } catch (error) {
    console.error('Error approving rejected app:', error);
    return false;
  }
}

export async function revertToPending(
  account: any,
  signTransaction: any,
  appId: number
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::revert_to_pending`,
      [appId]
    );
  } catch (error) {
    console.error('Error reverting app to pending:', error);
    return false;
  }
}

export async function addOwner(
  account: any,
  signTransaction: any,
  newOwnerAddress: string
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::add_owner`,
      [newOwnerAddress]
    );
  } catch (error) {
    console.error('Error adding owner:', error);
    return false;
  }
}

export async function removeOwner(
  account: any,
  signTransaction: any,
  ownerToRemove: string
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::remove_owner`,
      [ownerToRemove]
    );
  } catch (error) {
    console.error('Error removing owner:', error);
    return false;
  }
}

// Treasury and Fee Management
export async function getTreasuryAddress(): Promise<string> {
  try {
    const aptos = getAptosClient();
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::get_treasury_address`,
        functionArguments: [],
      },
    });
    return result[0] as string;
  } catch (error) {
    console.error('Error fetching treasury address:', error);
    return '';
  }
}

export async function getSubmitFee(): Promise<number> {
  try {
    const aptos = getAptosClient();
    const result = await aptos.view({
      payload: {
        function: `${REGISTRY_ADDRESS}::app_registry::get_submit_fee`,
        functionArguments: [],
      },
    });
    return Number(result[0]);
  } catch (error) {
    console.error('Error fetching submit fee:', error);
    return 0;
  }
}

export async function updateTreasuryAddress(
  account: any,
  signTransaction: any,
  newTreasuryAddress: string
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::update_treasury_address`,
      [newTreasuryAddress]
    );
  } catch (error) {
    console.error('Error updating treasury address:', error);
    return false;
  }
}

export async function updateSubmitFee(
  account: any,
  signTransaction: any,
  newFeeInOctas: number
): Promise<boolean> {
  try {
    return await buildAndSubmitTransaction(
      account,
      signTransaction,
      `${REGISTRY_ADDRESS}::app_registry::update_submit_fee`,
      [newFeeInOctas]
    );
  } catch (error) {
    console.error('Error updating submit fee:', error);
    return false;
  }
}
