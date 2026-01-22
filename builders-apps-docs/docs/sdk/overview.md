# SDK Overview

The Movement Mini App SDK provides a comprehensive set of APIs to build rich, native-feeling apps inside the Move Everything wallet.

## Core Capabilities

### Wallet & Blockchain

Access users' wallets and execute blockchain transactions:

```typescript
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

const { sdk, isConnected, address } = useMovementSDK();

// Send transaction
await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [recipientAddress, '1000000'], // 0.01 MOVE
  type_arguments: [],
});

// Sign message
 
const signature = await sdk.signMessage({
  message: 'Verify ownership',
  nonce: '12345',
});

// Get account info
> Note: `sdk.getAccount()` is not exposed on `window.movementSDK` in the current host. Use `window.aptos.account()` instead.
const account = await sdk.getAccount();
console.log(account.address, account.balance);
```

### Native Device Features

Leverage device capabilities for immersive experiences:

#### Haptic Feedback

```typescript
// Impact feedback
await sdk.haptic?.({ type: 'impact', style: 'medium' });

// Notification feedback
await sdk.haptic?.({ type: 'notification', style: 'success' });

// Selection feedback
await sdk.haptic?.({ type: 'selection' });
```

#### Push Notifications

```typescript
await sdk.notify?.({
  title: 'Quest Complete!',
  body: 'You earned 100 MOVE tokens',
  data: { questId: '123' },
  sound: true,
  badge: 1,
});
```

#### Share

```typescript
const result = await sdk.share?.({
  title: 'Check out my high score!',
  message: 'I just scored 1000 points in Neon Racer',
  url: 'https://miniapp.com/share/score123',
});
```

### Camera & Media

Capture photos and videos directly in your app:

```typescript
// Take a picture
const photo = await sdk.camera?.takePicture({
  quality: 0.8,
  allowsEditing: true,
  mediaTypes: 'photo',
});

// Pick from gallery
const image = await sdk.camera?.pickImage({
  quality: 1.0,
});

console.log(photo.uri, photo.width, photo.height);
```

### Local Storage

Persist data on the device:

```typescript
// Save data
await sdk.storage?.set('user_preferences', JSON.stringify({
  theme: 'dark',
  notifications: true,
}));

// Retrieve data
const prefs = await sdk.storage?.get('user_preferences');
const data = JSON.parse(prefs || '{}');

// Remove data
await sdk.storage?.remove('user_preferences');

// Clear all
await sdk.storage?.clear();
```

### Biometric Authentication

Secure sensitive actions with FaceID/TouchID:

```typescript
// Check availability
const available = await sdk.biometric?.isAvailable();

if (available) {
  // Authenticate
  const result = await sdk.biometric?.authenticate({
    promptMessage: 'Authenticate to complete transaction',
    cancelText: 'Cancel',
    fallbackToPasscode: true,
  });

  if (result.success) {
    console.log('Authenticated with', result.biometricType);
  }
}
```

### Location

Access device location for location-based features:

```typescript
// Get current position
const position = await sdk.location?.getCurrentPosition();
console.log(position.latitude, position.longitude);

// Watch position
const unsubscribe = sdk.location?.watchPosition((position) => {
  console.log('Position updated:', position);
});

// Stop watching
unsubscribe();
```

### Clipboard

Copy and paste functionality:

```typescript
// Copy to clipboard
await sdk.clipboard?.copy('0x1234567890abcdef');

// Paste from clipboard
const text = await sdk.clipboard?.paste();
console.log('Clipboard content:', text);
```

## App Context

Access information about the user and platform:

```typescript
> Note: `sdk.getContext()` is not exposed on `window.movementSDK` yet.
const context = await sdk.getContext();

console.log(context.user.address);        // User's wallet address
console.log(context.user.verified);       // KYC status
console.log(context.platform.os);         // 'ios' or 'android'
console.log(context.platform.version);    // OS version
console.log(context.app.id);              // Your app ID
console.log(context.app.name);            // Your app name

// Check feature availability
if (context.features.camera) {
  // Camera is available
}
```

## Security Features

The SDK includes built-in security measures:

### Rate Limiting

Automatically prevents spam:

```typescript
// SDK will throw error if rate limit exceeded
try {
  await sdk.sendTransaction(payload);
} catch (error) {
  if (error.message.includes('rate limit')) {
    alert('Too many requests. Please wait a moment.');
  }
}
```

### Transaction Validation

Validates payloads before sending:

```typescript
// Invalid transactions are caught before reaching the blockchain
await sdk.sendTransaction({
  function: 'invalid::format',  // ❌ Will throw error
  arguments: ['bad_address'],    // ❌ Will throw error
  type_arguments: [],
});
```

### Custom Security Config

Configure security settings:

```typescript
import { getMovementSDK, createSecurityManager } from '@movement-labs/miniapp-sdk';

const sdk = getMovementSDK({
  maxTransactionAmount: '500000000', // 5 MOVE max
  rateLimitWindow: 60000,            // 1 minute
  maxRequestsPerWindow: 20,          // 20 requests per minute
  strictMode: true,                  // Enable strict validation
});
```

## React Hooks

Use convenient React hooks for common operations:

```typescript
import { useMovementSDK, useMovementAccount } from '@movement-labs/miniapp-sdk';

// Main SDK hook
const {
  sdk,
  isConnected,
  address,
  isLoading,
  error,
  connect,
  sendTransaction
} = useMovementSDK();

// Account hook
const {
  account,
  isConnected,
  isLoading,
  error
} = useMovementAccount();
```

## Navigation

Control app navigation:

```typescript
// Open external URL
await sdk.openUrl?.('https://example.com', 'external');

// Open in app browser
await sdk.openUrl?.('https://example.com', 'in-app');

// Close mini app
await sdk.close?.();
```

## Next Steps

- **[API Reference](/reference/sdk-api)** - Complete API documentation
- **[Security Best Practices](/guides/security)** - Secure your app
- **[Examples]https://github.com/movementlabsxyz/miniapp-examples** - See the SDK in action
