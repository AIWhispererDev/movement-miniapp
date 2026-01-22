import { AppMetadata } from './types';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Re-export AppMetadata for use in other components
export type { AppMetadata };

// Contract configuration
const CONTRACT_ADDRESS = '0xba8a509e05730d3025d6d63e4974cf3296f7af78b6bb9c1e26d9e7d0fc1d8d63';
const RPC_URL = 'https://testnet.movementnetwork.xyz/v1';

// Initialize Aptos client
const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: RPC_URL,
});
const aptos = new Aptos(config);

export class AppRegistryService {
  /**
   * Get app metadata by slug (app ID)
   * Queries the on-chain registry using get_app_by_slug view function
   */
  async getApp(appId: string): Promise<AppMetadata | null> {
    try {
      console.log('Fetching app with slug:', appId);
      console.log('Contract address:', CONTRACT_ADDRESS);
      
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::app_registry::get_app_by_slug`,
          functionArguments: [appId],
        },
      });

      console.log('Raw result from blockchain:', JSON.stringify(result, null, 2));

      // Move view functions return structs - check if it's already an object or an array
      // The result is an array where the first element contains the struct
      const structData = Array.isArray(result) && result.length > 0 ? result[0] : result;
      
      console.log('Struct data:', structData);
      console.log('Struct type:', typeof structData);
      console.log('Is array?', Array.isArray(structData));
      
      // The Aptos SDK might return structs as objects with field names
      // Check if it's already an object with named fields
      if (structData && typeof structData === 'object' && !Array.isArray(structData)) {
        // It's already an object - use it directly
        // Type guard: check if it has the expected properties
        const data = structData as Record<string, unknown>;
        const appMetadata = {
          name: String(data.name || ''),
          description: String(data.description || ''),
          icon: String(data.icon || ''),
          url: String(data.url || ''),
          slug: String(data.slug || ''),
          developer_address: String(data.developer_address || ''),
          developer_name: String(data.developer_name || ''),
          category: String(data.category || ''),
          status: Number(data.status || 0),
          submitted_at: Number(data.submitted_at || 0),
          updated_at: Number(data.updated_at || 0),
          approved_at: Number(data.approved_at || 0),
          downloads: Number(data.downloads || 0),
          rating: Number(data.rating || 0),
          permissions: Array.isArray(data.permissions) ? data.permissions.map(String) : [],
          verified: Boolean(data.verified || false),
        };
        console.log('Mapped app metadata (from object):', appMetadata);
        return appMetadata;
      }
      
      // Otherwise, treat as array of field values
      // Map Move struct fields to TypeScript interface
      // Order: name, description, icon, url, slug, developer_address, developer_name, 
      //        category, status, submitted_at, updated_at, approved_at, downloads, 
      //        rating, permissions, verified
      const fields = Array.isArray(structData) ? structData : [structData];
      
      console.log('Fields array:', fields);
      
      const [
        name,
        description,
        icon,
        url,
        slug,
        developer_address,
        developer_name,
        category,
        status,
        submitted_at,
        updated_at,
        approved_at,
        downloads,
        rating,
        permissions,
        verified,
      ] = fields;

      const appMetadata = {
        name: String(name || ''),
        description: String(description || ''),
        icon: String(icon || ''),
        url: String(url || ''),
        slug: String(slug || ''),
        developer_address: String(developer_address || ''),
        developer_name: String(developer_name || ''),
        category: String(category || ''),
        status: Number(status || 0),
        submitted_at: Number(submitted_at || 0),
        updated_at: Number(updated_at || 0),
        approved_at: Number(approved_at || 0),
        downloads: Number(downloads || 0),
        rating: Number(rating || 0),
        permissions: Array.isArray(permissions) ? permissions.map(String) : [],
        verified: Boolean(verified || false),
      };

      console.log('Mapped app metadata (from array):', appMetadata);
      return appMetadata;
    } catch (error: unknown) {
      console.error('Error fetching app from blockchain:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's an abort error (E_APP_NOT_FOUND = 4)
        // This means the app doesn't exist or isn't approved
        if (error.message?.includes('ABORTED') || error.message?.includes('sub_status: Some(4)')) {
          console.log('App not found or not approved (E_APP_NOT_FOUND)');
          return null;
        }
      }
      
      return null;
    }
  }

  /**
   * Get all approved apps
   * Queries the on-chain registry using get_all_active_apps view function
   */
  async getAllApps(): Promise<AppMetadata[]> {
    try {
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::app_registry::get_all_active_apps`,
          functionArguments: [],
        },
      });

      console.log('Raw result from getAllApps:', JSON.stringify(result, null, 2));
      
      // Move returns a vector of AppMetadata structs
      // The result is an array where the first element is the vector (array of structs)
      const appsArray = Array.isArray(result) && result.length > 0 ? result[0] : result;
      
      console.log('Apps array:', appsArray);
      console.log('Is array?', Array.isArray(appsArray));
      
      if (!Array.isArray(appsArray)) {
        console.log('appsArray is not an array, returning empty');
        return [];
      }

      // Map each struct in the vector to TypeScript interface
      return appsArray.map((structData: unknown, index: number) => {
        console.log(`Processing struct ${index}:`, structData);
        console.log(`Struct type:`, typeof structData);
        console.log(`Is array?`, Array.isArray(structData));
        
        // The Aptos SDK might return structs as objects with field names
        // Check if it's already an object with named fields
        if (structData && typeof structData === 'object' && !Array.isArray(structData)) {
          // It's already an object - use it directly
          // Type guard: check if it has the expected properties
          const data = structData as Record<string, unknown>;
          return {
            name: String(data.name || ''),
            description: String(data.description || ''),
            icon: String(data.icon || ''),
            url: String(data.url || ''),
            slug: String(data.slug || ''),
            developer_address: String(data.developer_address || ''),
            developer_name: String(data.developer_name || ''),
            category: String(data.category || ''),
            status: Number(data.status || 0),
            submitted_at: Number(data.submitted_at || 0),
            updated_at: Number(data.updated_at || 0),
            approved_at: Number(data.approved_at || 0),
            downloads: Number(data.downloads || 0),
            rating: Number(data.rating || 0),
            permissions: Array.isArray(data.permissions) ? data.permissions.map(String) : [],
            verified: Boolean(data.verified || false),
          };
        }
        
        // Otherwise, treat as array of field values
        const fields = Array.isArray(structData) ? structData : [structData];
        const [
          name,
          description,
          icon,
          url,
          slug,
          developer_address,
          developer_name,
          category,
          status,
          submitted_at,
          updated_at,
          approved_at,
          downloads,
          rating,
          permissions,
          verified,
        ] = fields;

        return {
          name: String(name || ''),
          description: String(description || ''),
          icon: String(icon || ''),
          url: String(url || ''),
          slug: String(slug || ''),
          developer_address: String(developer_address || ''),
          developer_name: String(developer_name || ''),
          category: String(category || ''),
          status: Number(status || 0),
          submitted_at: Number(submitted_at || 0),
          updated_at: Number(updated_at || 0),
          approved_at: Number(approved_at || 0),
          downloads: Number(downloads || 0),
          rating: Number(rating || 0),
          permissions: Array.isArray(permissions) ? permissions.map(String) : [],
          verified: Boolean(verified || false),
        };
      });
    } catch (error) {
      console.error('Error fetching all apps from blockchain:', error);
      return [];
    }
  }

  /**
   * Get apps by category
   */
  async getAppsByCategory(category: string): Promise<AppMetadata[]> {
    const allApps = await this.getAllApps();
    return allApps.filter(app => app.category === category);
  }

  /**
   * Get verified apps only
   */
  async getVerifiedApps(): Promise<AppMetadata[]> {
    const allApps = await this.getAllApps();
    return allApps.filter(app => app.verified);
  }

  /**
   * Search apps by name or description
   */
  async searchApps(query: string): Promise<AppMetadata[]> {
    const allApps = await this.getAllApps();
    const lowercaseQuery = query.toLowerCase();

    return allApps.filter(app =>
      app.name.toLowerCase().includes(lowercaseQuery) ||
      app.description.toLowerCase().includes(lowercaseQuery) ||
      app.developer_name.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Generate share URL for an app
   */
  generateShareUrl(appId: string, path?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mini-app-sharing.vercel.app';
    const sharePath = path ? `/${path}` : '';
    return `${baseUrl}/app/${appId}${sharePath}`;
  }

  /**
   * Get app rating as stars (0-5)
   */
  getAppRating(app: AppMetadata): number {
    return app.rating / 10; // Convert from rating * 10 format
  }

  /**
   * Format app rating for display
   */
  formatAppRating(app: AppMetadata): string {
    const rating = this.getAppRating(app);
    return `${rating.toFixed(1)} ⭐`;
  }

  /**
   * Get app status as human-readable string
   */
  getAppStatus(app: AppMetadata): string {
    switch (app.status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  }

  /**
   * Check if app is approved
   */
  isAppApproved(app: AppMetadata): boolean {
    return app.status === 1;
  }
}

// Export singleton instance
export const appRegistryService = new AppRegistryService();
