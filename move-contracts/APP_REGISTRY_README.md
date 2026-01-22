# App Registry Smart Contract

On-chain app registry for Movement Everything that manages mini app submissions, approvals, and metadata.

## Features

### For Builders (App Developers)
- ✅ Submit apps for approval
- ✅ Request updates to existing apps (requires owner approval)
- ✅ Remove their own apps
- ✅ View app status and metadata
- ✅ Enforced unique app URL across non-rejected apps

### For Owners (Admins)
- ✅ Approve/reject pending apps
- ✅ Approve pending update requests
- ✅ Remove any app
- ✅ Update app stats (downloads, ratings)
- ✅ Add/remove other owners
- ✅ View all pending apps
- ✅ Update treasury address
- ✅ Update submission fee

## Contract Structure

### AppMetadata
```move
struct AppMetadata {
    name: String,
    description: String,
    icon: String,
    url: String,
    slug: String,
    developer_address: address,
    developer_name: String,
    category: String,  // "game", "defi", "social", "utility", "nft"
    status: u8,  // 0=Pending, 1=Approved, 2=Rejected
    submitted_at: u64,
    updated_at: u64,
    approved_at: u64,
    downloads: u64,
    rating: u64,  // rating * 10 (e.g., 45 = 4.5 stars)
    permissions: vector<String>,
    verified: bool,
}
```

### AppRegistry
```move
struct AppRegistry {
    next_app_index: u64,
    apps: SmartTable<u64, AppMetadata>,
    pending_changes: SmartTable<u64, PendingChange>,
    owners: vector<address>,
    total_apps: u64,
    approved_apps: u64,
    pending_apps: u64,
    app_indices: vector<u64>,
    approved_app_indices: vector<u64>,
    developer_index: SmartTable<address, vector<u64>>,
    treasury_address: address,
    submit_fee: u64,  // Fee in octas (1 MOVE = 10^8 octas)
}
```

## Deployment

### 1. Compile the contract
```bash
cd move-contracts
movement move compile
```

### 2. Deploy to Movement
```bash
# Testnet
movement move publish \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1 \
  --assume-yes

# Mainnet
movement move publish \
  --network custom \
  --url https://full.mainnet.movementinfra.xyz/v1 \
  --assume-yes
```

### 3. Initialize the registry

The registry is automatically initialized when the module is deployed via `init_module`. The treasury address is set to `@app_registry` and the default submission fee is 10 MOVE (1000000000 octas).

To update the treasury address or submission fee, use the owner-only functions:
```bash
# Update treasury address
movement move run \
  --function-id '@app_registry::app_registry::update_treasury_address' \
  --args address:NEW_TREASURY_ADDRESS \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1

# Update submission fee (in octas, e.g., 5000000000 = 50 MOVE)
movement move run \
  --function-id '@app_registry::app_registry::update_submit_fee' \
  --args u64:5000000000 \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1
```

## Usage Examples

### Submit an App (Builder)
```bash
movement move run \
  --function-id '@app_registry::app_registry::submit_app' \
  --args string:"My DeFi App" \
         string:"Best DeFi app on Movement" \
         string:"💰" \
         string:"https://my-app.com" \
         string:"my-defi-app" \
         string:"My Team" \
         string:"defi" \
         'vector<string>:["wallet.read","wallet.sign"]' \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1
```

**Note:** 
- The `url` must be unique among all non-rejected apps. Submissions will abort with `E_URL_IN_USE` if another pending or approved app already uses an equivalent URL. Equivalence is checked after normalization:
  - Scheme is ignored (`http://` and `https://` are treated the same)
  - A single trailing slash is ignored (e.g., `https://app.com` equals `https://app.com/`)
- **Submission Fee**: Submitting an app requires paying a fee (default: 10 MOVE). The fee is automatically transferred from the submitter's account to the treasury address. Ensure your account has sufficient balance.

### Approve an App (Owner)
```bash
movement move run \
  --function-id '@app_registry::app_registry::approve_app' \
  --args u64:APP_INDEX \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1
```

### Request Update (Builder)
```bash
movement move run \
  --function-id '@app_registry::app_registry::request_update' \
  --args u64:APP_INDEX \
         string:"My DeFi App v2" \
         string:"Updated description" \
         string:"💰" \
         string:"https://my-app.com" \
         string:"defi" \
         'vector<string>:["wallet.read","wallet.sign"]' \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1
```

### Approve Update (Owner)
```bash
movement move run \
  --function-id '@app_registry::app_registry::approve_update' \
  --args u64:APP_INDEX \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1
```

### Reject an App (Owner)
```bash
movement move run \
  --function-id '@app_registry::app_registry::reject_app' \
  --args u64:APP_INDEX \
         string:"Does not meet quality standards" \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1
```

### Update Stats (Owner)
```bash
movement move run \
  --function-id '@app_registry::app_registry::update_app_stats' \
  --args u64:APP_INDEX \
         u64:5000 \
         u64:45 \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1
```

### Remove an App (Builder or Owner)
```bash
movement move run \
  --function-id '@app_registry::app_registry::remove_app' \
  --args u64:APP_INDEX \
  --network custom \
  --url https://testnet.movementnetwork.xyz/v1
```

## View Functions

### Get App Metadata by Index
```typescript
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: 'https://testnet.movementnetwork.xyz/v1',
});
const aptos = new Aptos(config);

const app = await aptos.view({
  function: '@app_registry::app_registry::get_app',
  type_arguments: [],
  arguments: [APP_INDEX],
});
```

### Get App Metadata by Slug (Approved Apps Only)
```typescript
const app = await aptos.view({
  function: '@app_registry::app_registry::get_app_by_slug',
  type_arguments: [],
  arguments: ['send-tokens'],  // slug string
});
// Returns AppMetadata if the app exists and is approved
// Aborts with E_APP_NOT_FOUND if app doesn't exist or is not approved
```

### Check if App Exists
```typescript
const exists = await aptos.view({
  function: '@app_registry::app_registry::app_exists',
  type_arguments: [],
  arguments: [APP_INDEX],
});
```

### Get Registry Stats
```typescript
const [totalApps, approvedApps, pendingApps] = await aptos.view({
  function: '@app_registry::app_registry::get_stats',
  type_arguments: [],
  arguments: [],
});
```

### Get Treasury Address and Submission Fee
```typescript
const treasuryAddress = await aptos.view({
  function: '@app_registry::app_registry::get_treasury_address',
  type_arguments: [],
  arguments: [],
});

const submitFee = await aptos.view({
  function: '@app_registry::app_registry::get_submit_fee',
  type_arguments: [],
  arguments: [],
});
// Fee is returned in octas (1 MOVE = 10^8 octas)
```

### Check if Address is Owner
```typescript
const isOwner = await aptos.view({
  function: '@app_registry::app_registry::check_is_owner',
  type_arguments: [],
  arguments: [USER_ADDRESS],
});
```

### Get Pending Change
```typescript
const pendingChange = await aptos.view({
  function: '@app_registry::app_registry::get_pending_change',
  type_arguments: [],
  arguments: [APP_INDEX],
});
```

### Check if Has Pending Change
```typescript
const hasPending = await aptos.view({
  function: '@app_registry::app_registry::has_pending_change',
  type_arguments: [],
  arguments: [APP_INDEX],
});
```

### Get Developer Apps (indices + metadata)
```typescript
const [indices, apps] = await aptos.view({
  function: '@app_registry::app_registry::get_developer_apps',
  type_arguments: [],
  arguments: [DEVELOPER_ADDRESS],
});
// indices[i] corresponds to apps[i]
```

### Get All App Indices
```typescript
const allIndices = await aptos.view({
  function: '@app_registry::app_registry::get_all_app_indices',
  type_arguments: [],
  arguments: [],
});
```

### Get Non-Approved Apps
```typescript
const nonApprovedApps = await aptos.view({
  function: '@app_registry::app_registry::get_non_approved_apps',
  type_arguments: [],
  arguments: [],
});
// Returns all pending and rejected apps (no authorization required)
```

## Events

The contract emits the following events for indexing:

- `AppSubmittedEvent` - When a new app is submitted (includes `app_index`)
- `AppApprovedEvent` - When an app is approved
- `AppRejectedEvent` - When an app is rejected
- `AppUpdateRequestedEvent` - When an update is requested
- `AppRemovedEvent` - When an app is removed

## Frontend Integration

### Fetching All Apps

Since Move doesn't have native iteration over SmartTable, you'll need to:

1. **Use Events for Indexing**: Listen to `AppSubmittedEvent` to track app submissions (extract `app_index`)
2. **Cache Locally**: Store `app_index`es in your frontend/backend
3. **Query Individual Apps**: Use `get_app()` for each `app_index`
4. **Query by Slug**: Use `get_app_by_slug()` for approved apps (useful for URL routing)

Example indexing service:

```typescript
// Listen for app submission events
const events = await aptos.getAccountEventsByEventType({
  accountAddress: '@app_registry',
  eventType: '@app_registry::app_registry::AppSubmittedEvent',
});

// Extract app indices
const appIndices = events.map(e => e.data.app_index);

// Fetch metadata for each app
const apps = await Promise.all(
  appIndices.map(index =>
    aptos.view({
      function: '@app_registry::app_registry::get_app',
      arguments: [index],
    })
  )
);
```

### Querying by Slug

For approved apps, you can query directly by slug:

```typescript
// Get app by slug (approved apps only)
try {
  const app = await aptos.view({
    function: '@app_registry::app_registry::get_app_by_slug',
    arguments: ['send-tokens'],
  });
  // Use app metadata for display
} catch (error) {
  // App not found or not approved
}
```

## Security Considerations

1. **Owner Management**: Only owners can approve/reject apps and update treasury/fee settings
2. **Developer Ownership**: Developers can only update/remove their own apps
3. **Pending Changes**: Updates require owner approval to prevent spam
4. **Event Logging**: All actions are logged for transparency
5. **Status Checks**: Apps must be in correct status for state transitions
6. **Submission Fees**: Fees are automatically charged on submission to prevent spam
7. **Named Address**: The registry uses a named address `@app_registry` for security and consistency
8. **View Functions**: `get_app_by_slug` only returns approved apps to prevent exposing pending/rejected apps

## Next Steps

1. Deploy contract to Movement testnet
2. Build admin UI for managing approvals
3. Integrate with existing mini app submission flow
4. Add event indexing service
5. Build public app browser with filters/search

## Testing

```bash
cd move-contracts
movement move test
```

## License

MIT

faucet
curl --location --request POST 'https://faucet.testnet.movementnetwork.xyz/mint?amount=12000000000000&address=0f36a3bbd7c45132027453015b911b98ab749f8646797fc1c364f8d7b6584561'