# Installing

Get the Movement SDK integrated into your project.

## Quick Start

Create a new mini app with our starter template:

```bash
npx create-movement-app@latest my-app
cd my-app
npm run dev
```

This creates a fully configured Next.js app with the SDK pre-installed.

## Manual Installation

### For Next.js / React

Install the SDK package:

```bash
npm install @movement-labs/miniapp-sdk
```

Use the React hook in your components:

```tsx
// app/page.tsx or any component
'use client';

import { useMovementSDK } from '@movement-labs/miniapp-sdk';

export default function MyComponent() {
  const { sdk, isConnected, address, isLoading } = useMovementSDK();

  // Loading state while SDK initializes
  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Check if app is running in Movement wallet
  if (!sdk?.isInstalled()) {
    return (
      <div className="error">
        <h2>Not in Movement App</h2>
        <p>Please open this app inside Movement wallet</p>
      </div>
    );
  }

  // SDK is ready
  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Address: {address || 'Not connected'}</p>
    </div>
  );
}
```

The `useMovementSDK()` hook automatically:
- Checks if SDK is installed with `isInstalled()`
- Waits for SDK to be ready with `ready()`
- Returns connection state and user address
- Handles loading states

### For Vanilla JavaScript

The SDK is automatically injected by Movement wallet:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Mini App</title>
</head>
<body>
  <div id="app">Loading...</div>

  <script>
    async function initApp() {
      // Check if SDK is installed
      if (!window.movementSDK?.isInstalled()) {
        document.getElementById('app').innerHTML =
          '<p>⚠️ Please open this app inside Movement wallet</p>';
        return;
      }

      const sdk = window.movementSDK;

      // Wait for SDK to be ready
      await sdk.ready();

      // SDK is ready - safe to use
      document.getElementById('app').innerHTML = `
        <div>
          <h1>Welcome!</h1>
          <p>Connected: ${sdk.isConnected ? 'Yes' : 'No'}</p>
          <p>Address: ${sdk.address || 'Not connected'}</p>
          <button onclick="handleConnect()">
            ${sdk.isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      `;
    }

    async function handleConnect() {
      try {
        const account = await window.movementSDK.connect();
        console.log('Connected:', account.address);
        initApp(); // Refresh UI
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }

    // Initialize when page loads
    initApp();
  </script>
</body>
</html>
```

### For Unity

1. Download the Movement Unity SDK package:
   ```bash
   # Coming soon
   ```

2. Import into Unity:
   - Assets → Import Package → Custom Package
   - Select `MovementSDK.unitypackage`

3. Add to your scene:
   ```csharp
   using MovementSDK;

   public class GameManager : MonoBehaviour {
     void Start() {
       if (MovementSDK.Instance.IsInstalled()) {
         string address = MovementSDK.Instance.GetAddress();
         Debug.Log("Connected: " + address);
       }
     }
   }
   ```

## SDK Detection & Ready State

Movement SDK provides two key methods for reliable initialization:

### `isInstalled()`

Returns `true` if your app is running inside Movement wallet:

```typescript
const isInMovementApp = window.movementSDK?.isInstalled();

if (!isInMovementApp) {
  // Show error: "Please open in Movement wallet"
}
```

### `ready()`

Waits for the SDK to be fully initialized before allowing method calls:

```typescript
await window.movementSDK.ready();

// Now safe to call any SDK method
const account = await window.movementSDK.getAccount();
```

### Complete Pattern

Always use both methods together. The `useMovementSDK()` hook automatically calls `ready()` for you:

::: code-group

```typescript [React]
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

function App() {
  const { sdk, isLoading, error } = useMovementSDK();
  // useMovementSDK() automatically calls sdk.ready() internally

  if (isLoading) {
    return <div>Loading SDK...</div>;
  }

  if (error || !sdk?.isInstalled()) {
    return (
      <div className="error">
        <h2>Not in Movement App</h2>
        <p>Please open this app inside Movement wallet</p>
        <a href="https://movement.xyz">Download Movement</a>
      </div>
    );
  }

  // SDK is ready and installed (ready() was called by the hook)
  return <YourApp sdk={sdk} />;
}
```

```javascript [Vanilla JS]
async function initApp() {
  // Step 1: Check if installed
  if (!window.movementSDK?.isInstalled()) {
    console.error('Not running in Movement app');
    showError('Please open this app inside Movement wallet');
    return;
  }

  const sdk = window.movementSDK;

  // Step 2: Wait for ready
  try {
    await sdk.ready();
    console.log('SDK is ready!');
  } catch (error) {
    console.error('SDK initialization failed:', error);
    return;
  }

  // Step 3: SDK is ready - safe to use
  const account = await sdk.getAccount();
  console.log('Account:', account);
}

// Call on page load
initApp();
```

```csharp [Unity]
using MovementSDK;

public class GameManager : MonoBehaviour {
  async void Start() {
    // Check if installed
    if (!MovementSDK.Instance.IsInstalled()) {
      ShowError("Please open in Movement app");
      return;
    }

    // Wait for ready
    bool isReady = await MovementSDK.Instance.Ready();
    if (!isReady) {
      ShowError("SDK initialization failed");
      return;
    }

    // SDK is ready
    InitializeGame();
  }
}
```

:::

::: tip WHY USE `ready()`?
The SDK may need time to initialize after injection. Calling `ready()` ensures all methods are available and prevents race conditions.
:::

::: warning DON'T SKIP THESE CHECKS
Always check `isInstalled()` and wait for `ready()` before using SDK methods. Skipping these checks may cause runtime errors.
:::

## Verification

Verify the SDK is working:

```typescript
const sdk = window.movementSDK;

console.log('Installed:', sdk.isInstalled());
console.log('Ready:', await sdk.ready());
console.log('Address:', sdk.address);
console.log('Network:', sdk.network);
```

Expected output:
```
Installed: true
Ready: true
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Network: mainnet
```

## TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import type {
  MovementSDK,
  TransactionPayload,
  TransactionResult,
  SignMessagePayload
} from '@movement-labs/miniapp-sdk';

// Full type safety
const payload: TransactionPayload = {
  function: '0x1::aptos_account::transfer',
  arguments: [recipientAddress, amount],
  type_arguments: []
};

const result: TransactionResult = await sdk.sendTransaction(payload);
```

## Environment Setup

### Development

Create a `.env.local` file:

```bash
# Optional: Override default settings
NEXT_PUBLIC_MOVEMENT_NETWORK=testnet
NEXT_PUBLIC_DEBUG=true
```

### Production

Ensure your build is optimized:

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

## Next Steps

- **[Commands →](/quick-start/commands)** - Learn how to call SDK methods
- **[Testing →](/quick-start/testing)** - Test your app in Movement wallet
- **[Examples →](/examples/scaffold)** - See full examples

## Troubleshooting

**SDK is undefined?**
- Ensure you're testing inside the Movement app
- Check Developer Mode is enabled in Settings

**TypeScript errors?**
- Update to latest SDK: `npm install @movement-labs/miniapp-sdk@latest`
- Restart your TypeScript server

**Build errors?**
- Check Node.js version: `node --version` (requires 18+)
- Clear cache: `rm -rf .next node_modules && npm install`
