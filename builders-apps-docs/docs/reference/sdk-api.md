# SDK API Reference

Complete reference for all Movement SDK methods and properties.

## Installation

```bash
npm install @movement-labs/miniapp-sdk
```

## SDK Status

### `isInstalled()`

Check if the app is running inside Movement wallet.

**Returns:** `boolean`

```typescript
const isInMovementApp = window.movementSDK.isInstalled();

if (!isInMovementApp) {
  console.error('App must run in Movement wallet');
}
```

**When to use:**
- Always check before using any SDK method
- Show error messages if not in Movement app
- Conditionally render UI based on environment

**Example:**

```tsx
function App() {
  if (!window.movementSDK?.isInstalled()) {
    return (
      <div className="error">
        <h2>Not Available</h2>
        <p>Please open this app inside Movement wallet</p>
      </div>
    );
  }

  return <Dashboard />;
}
```

---

### `ready()`

Wait for the SDK to be fully initialized before using methods.

**Returns:** `Promise<boolean>`

```typescript
await window.movementSDK.ready();
console.log('SDK is ready!');
```

**When to use:**
- After checking `isInstalled()`
- Before calling any SDK methods
- In initialization code

**Example:**

```typescript
async function initApp() {
  if (!window.movementSDK?.isInstalled()) {
    return;
  }

  // Wait for SDK to be ready
  await window.movementSDK.ready();

  // Now safe to use SDK
  const account = await window.movementSDK.getAccount();
  console.log('Account:', account);
}
```

**Timeout:**

The `ready()` method has a 2-second timeout. If initialization takes longer, it resolves anyway:

```typescript
try {
  await window.movementSDK.ready();
} catch (error) {
  console.error('SDK initialization timeout:', error);
}
```

---

## Properties

### `isConnected`

**Type:** `boolean`

Whether a wallet is currently connected.

```typescript
if (sdk.isConnected) {
  console.log('Wallet is connected');
}
```

---

### `address`

**Type:** `string | undefined`

The connected wallet address (if connected).

```typescript
const address = sdk.address;
console.log('Address:', address);
// Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

### `network`

**Type:** `'mainnet' | 'testnet' | 'devnet'`

Current network the wallet is connected to.

```typescript
const network = sdk.network;
console.log('Network:', network);
// Network: mainnet
```

---

## Account Methods

### `connect()`

Connect to the user's wallet and request access.

**Returns:** `Promise<MovementAccount>`

```typescript
const account = await sdk.connect();
console.log('Connected:', account.address);
```

**Example:**

```tsx
function ConnectButton() {
  const [account, setAccount] = useState(null);

  async function handleConnect() {
    try {
      const acc = await sdk.connect();
      setAccount(acc);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }

  return (
    <button onClick={handleConnect}>
      {account ? `Connected: ${account.address}` : 'Connect Wallet'}
    </button>
  );
}
```

---

### `getAccount()`
> Note: Not exposed on `window.movementSDK` in the current host. Use `window.aptos.account()` instead. A future update may expose `sdk.getAccount()` directly.

Get the current account information.

**Returns:** `Promise<MovementAccount>`

```typescript
interface MovementAccount {
  address: string;
  publicKey: string;
  balance?: string;
}
```

**Example:**

```typescript
const account = await sdk.getAccount();
console.log('Account:', account);
// { address: '0x...', publicKey: '0x...', balance: '1.5' }
```

---

### `getBalance()`

Get the current MOVE token balance.

**Returns:** `Promise<string>`

```typescript
const balance = await sdk.getBalance();
console.log('Balance:', balance, 'MOVE');
// Balance: 1.5 MOVE
```

---

### `getContext()`
> Note: Handler exists in host, but `sdk.getContext()` is not exposed on `window.movementSDK` yet.

Get comprehensive app context including user, app, and platform info.

**Returns:** `Promise<AppContext>`

```typescript
interface AppContext {
  user: {
    address: string;
    publicKey: string;
    verified: boolean;
  };
  app: {
    id: string;
    name: string;
    version: string;
  };
  platform: {
    os: 'ios' | 'android';
    version: string;
  };
  features: {
    haptics: boolean;
    notifications: boolean;
    camera: boolean;
    biometrics: boolean;
    location: boolean;
  };
}
```

**Example:**

```typescript
const context = await sdk.getContext();
console.log('Platform:', context.platform.os);
console.log('Features:', context.features);
```

---

### `getTheme()`

Get the current theme (light or dark mode) from the host app.

**Returns:** `Promise<ThemeInfo>`

```typescript
interface ThemeInfo {
  colorScheme: 'light' | 'dark';
}
```

**Example:**

```typescript
const theme = await sdk.getTheme();
if (theme.colorScheme === 'dark') {
  // Apply dark mode styles
  document.body.classList.add('dark-mode');
} else {
  // Apply light mode styles
  document.body.classList.remove('dark-mode');
}
```

---

## Transaction Methods

### `view()`

Call a Move view function (read-only, no wallet required).

**Parameters:**

```typescript
interface ViewPayload {
  function: string;             // address::module::function
  function_arguments?: any[];   // function args (preferred key)
  type_arguments?: string[];    // generic type args

  // Backwards-compat: some hosts also accept camelCase
  functionArguments?: any[];
  typeArguments?: string[];
}
```

**Returns:** `Promise<any>` (the decoded view result)

The result may be a primitive, struct, or array. Some hosts may wrap results in an extra array.

**Example:**

```typescript
const result = await sdk.view({
  function: '0xabc::leaderboard::get_leaderboard',
  function_arguments: ['50'],
  type_arguments: [],
});

// Handle wrapped arrays
const entries = Array.isArray(result)
  ? (Array.isArray(result[0]) ? result[0] : result)
  : [];
```

### `sendTransaction()`

Send a transaction on the Movement blockchain.

**Parameters:**

```typescript
interface TransactionPayload {
  function: string;              // Module function to call
  arguments: any[];              // Function arguments
  type_arguments: string[];      // Type arguments (generics)
}
```

**Returns:** `Promise<TransactionResult>`

```typescript
interface TransactionResult {
  hash: string;
  success: boolean;
  version?: string;
  vmStatus?: string;
}
```

**Example:**

```typescript
const result = await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: ['0x123...', '1000000'],
  type_arguments: []
});

console.log('Transaction hash:', result.hash);
```

---

### `waitForTransaction()`

Wait for a transaction to be confirmed on-chain.

**Parameters:** `hash: string`

**Returns:** `Promise<TransactionStatus>`

```typescript
interface TransactionStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  gasUsed?: string;
  timestamp?: number;
  error?: string;
}
```

**Example:**

```typescript
const result = await sdk.sendTransaction({...});
const status = await sdk.waitForTransaction(result.hash);

if (status.status === 'success') {
  console.log('Transaction confirmed!');
} else {
  console.error('Transaction failed:', status.error);
}
```

---

### `onTransactionUpdate()`

Subscribe to real-time transaction status updates.

**Parameters:** `hash: string, callback: (status: TransactionStatus) => void`

**Returns:** `() => void` (unsubscribe function)

```typescript
// Subscribe to transaction updates
const unsubscribe = sdk.onTransactionUpdate?.(result.hash, (status) => {
  console.log('Transaction status:', status.status);

  if (status.status === 'success') {
    console.log('Transaction confirmed!');
    unsubscribe();
  } else if (status.status === 'failed') {
    console.error('Transaction failed:', status.error);
    unsubscribe();
  }
});

// Clean up when component unmounts
useEffect(() => {
  return () => unsubscribe?.();
}, []);
```

---

### `signMessage()`
> Note: Not yet implemented in the current host. Calls will fail. Prefer server-side challenges or wait for host support.

Sign an arbitrary message with the user's private key.

**Parameters:**

```typescript
interface SignMessagePayload {
  message: string;
  nonce?: string;  // Optional nonce for replay protection
}
```

**Returns:** `Promise<SignMessageResult>`

```typescript
interface SignMessageResult {
  signature: string;
  publicKey: string;
  fullMessage?: string;
}
```

**Example:**

```typescript
const result = await sdk.signMessage({
  message: 'Welcome to my app!',
  nonce: Date.now().toString()
});

console.log('Signature:', result.signature);
```

---

## MNS (Movement Name Service)

The MNS API allows you to resolve human-readable `.move` names to wallet addresses and perform reverse lookups.

### `mns.getTargetAddress()`

Resolve a `.move` name to its associated wallet address.

**Parameters:** `name: string` - The name to resolve (e.g., "alice" or "alice.move")

**Returns:** `Promise<AccountAddress | null>` - An AccountAddress object or null if not found

The result is an `AccountAddress` object from the Movement SDK, which may need to be converted to a hex string:

**Example:**

```typescript
const result = await sdk.mns.getTargetAddress('alice.move');

if (!result) {
  console.log('Name not found');
  return;
}

// Handle AccountAddress object - convert to hex string
let address: string | null = null;

if (typeof result === 'string') {
  address = result;
} else if (result && typeof result === 'object' && 'data' in result) {
  // Convert byte array to hex address
  const data = (result as any).data;
  const bytes = Object.keys(data)
    .sort((a, b) => Number(a) - Number(b))
    .map(k => data[k]);

  if (bytes.length > 0 && bytes.some((b: number) => b !== 0)) {
    address = '0x' + bytes.map((b: number) => b.toString(16).padStart(2, '0')).join('');
  }
}

console.log('Resolved address:', address);
```

---

### `mns.getPrimaryName()`

Get the primary `.move` name associated with a wallet address (reverse lookup).

**Parameters:** `address: string`

**Returns:** `Promise<string | null>`

**Example:**

```typescript
const name = await sdk.mns.getPrimaryName('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb...');
console.log('Name:', name);
// alice
```

---

**Use Cases:**
- Allow users to send tokens to `.move` names instead of addresses
- Display human-readable names in transaction history
- Verify name ownership before transfers

---

## Device Features

### `scanQRCode()`

Open the camera to scan a QR code.

**Returns:** `Promise<string>`

```typescript
const scannedData = await sdk.scanQRCode();
console.log('Scanned:', scannedData);
```

**Example:**

```tsx
async function handleScan() {
  try {
    const address = await sdk.scanQRCode();
    setRecipient(address);
  } catch (error) {
    if (error.message !== 'QR code scan cancelled') {
      console.error('Scan failed:', error);
    }
  }
}
```

---

### `haptic()`

Provide tactile feedback to the user.

**Parameters:**

```typescript
interface HapticOptions {
  type: 'impact' | 'notification' | 'selection';
  style?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}
```

**Example:**

```typescript
// Button press
await sdk.haptic({ type: 'impact', style: 'light' });

// Success feedback
await sdk.haptic({ type: 'notification', style: 'success' });

// Selection change
await sdk.haptic({ type: 'selection' });
```

---

### `notify()`

Send a push notification to the user.

**Parameters:**

```typescript
interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
}
```

**Example:**

```typescript
await sdk.notify({
  title: 'Transaction Complete',
  body: 'Your transfer was successful',
  data: {
    deepLink: '/transactions',
    txHash: result.hash
  }
});
```

---

### `share()`

Open the native share sheet.

**Parameters:**

```typescript
interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
}
```

**Returns:** `Promise<{ success: boolean }>`

**Example:**

```typescript
await sdk.share({
  title: 'Check out this mini app!',
  message: 'Play this awesome game on Movement',
  url: 'https://moveeverything.app/apps/my-game'
});
```

---

### `Clipboard`

Copy and paste text.

**Methods:**

```typescript
// Copy text to clipboard
await sdk.Clipboard.writeText(text: string): Promise<void>

// Read text from clipboard
const text = await sdk.Clipboard.readText(): Promise<string>
```

**Example:**

```typescript
// Copy wallet address
await sdk.Clipboard.writeText(address);
await sdk.showAlert('Address copied to clipboard!');

// Paste from clipboard
const pastedText = await sdk.Clipboard.readText();
setRecipientAddress(pastedText);
```

---

### `camera`
> Note: Not yet implemented in the current host.

Access device camera and photo library.

```typescript
// Take picture
await sdk.camera.takePicture(options?: CameraOptions): Promise<CameraResult>

// Pick from library
await sdk.camera.pickImage(options?: CameraOptions): Promise<CameraResult>
```

**Options:**

```typescript
interface CameraOptions {
  quality?: number;          // 0-1
  allowsEditing?: boolean;
  mediaTypes?: 'photo' | 'video' | 'all';
}
```

**Returns:**

```typescript
interface CameraResult {
  uri: string;
  width: number;
  height: number;
  type: 'image' | 'video';
}
```

---

### `location`
> Note: Not yet implemented in the current host.

Access device location.

```typescript
// Get current position
await sdk.location.getCurrentPosition(): Promise<LocationResult>

// Watch position changes
const unsubscribe = sdk.location.watchPosition((position) => {
  console.log(position);
});
```

**LocationResult:**

```typescript
interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}
```

---

### `biometric`
> Note: Not yet implemented in the current host.

Authenticate with FaceID/TouchID.

```typescript
// Check availability
await sdk.biometric.isAvailable(): Promise<boolean>

// Authenticate
await sdk.biometric.authenticate(options?: BiometricOptions): Promise<BiometricResult>
```

**Options:**

```typescript
interface BiometricOptions {
  promptMessage?: string;
  cancelText?: string;
  fallbackToPasscode?: boolean;
}
```

**Returns:**

```typescript
interface BiometricResult {
  success: boolean;
  biometricType?: 'FaceID' | 'TouchID' | 'Fingerprint';
}
```

---

## Storage

### `CloudStorage`

Persistent storage for user data, preferences, and app state.

**Limits:** 1024 items per user

**Methods:**

```typescript
// Store data
await sdk.CloudStorage.setItem(key: string, value: string): Promise<void>

// Get data
const value = await sdk.CloudStorage.getItem(key: string): Promise<string | null>

// Remove data
await sdk.CloudStorage.removeItem(key: string): Promise<void>

// Get all keys
const keys = await sdk.CloudStorage.getKeys(): Promise<string[]>
```

**Example:**

```typescript
// Save user preferences
await sdk.CloudStorage.setItem('theme', 'dark');
await sdk.CloudStorage.setItem('language', 'en');

// Load preferences
const theme = await sdk.CloudStorage.getItem('theme') || 'light';
const language = await sdk.CloudStorage.getItem('language') || 'en';

// Save game progress
await sdk.CloudStorage.setItem('level', '5');
await sdk.CloudStorage.setItem('score', '1250');

// Load on app start
const level = await sdk.CloudStorage.getItem('level');
if (level) {
  resumeGame(parseInt(level));
}

// Get all saved data
const allKeys = await sdk.CloudStorage.getKeys();
console.log('Saved keys:', allKeys);
```

**Use Cases:**
- Save game progress
- Store user preferences (theme, language)
- Cache frequently accessed data
- Persist form drafts

---

### `storage.get()`
> Note: The simple `storage.*` API is not exposed in the current host. Use `CloudStorage.*` instead.

Get a value from local storage.

**Parameters:** `key: string`

**Returns:** `Promise<string | null>`

```typescript
const value = await sdk.storage.get('user_preferences');
```

---

### `storage.set()`
> Note: Use `CloudStorage.setItem(key, value)` instead.

Set a value in local storage.

**Parameters:** `key: string, value: string`

**Returns:** `Promise<void>`

```typescript
await sdk.storage.set('user_preferences', JSON.stringify(prefs));
```

---

### `storage.remove()`
> Note: Use `CloudStorage.removeItem(key)` instead.

Remove a value from local storage.

**Parameters:** `key: string`

**Returns:** `Promise<void>`

```typescript
await sdk.storage.remove('user_preferences');
```

---

### `storage.clear()`
> Note: Not exposed. You can emulate by iterating `CloudStorage.getKeys()` and removing each.

Clear all storage data for this app.

**Returns:** `Promise<void>`

```typescript
await sdk.storage.clear();
```

---

### `storage.getAll()`

Get all stored key-value pairs.

**Returns:** `Promise<{ key: string; value: string }[]>`

```typescript
const allData = await sdk.storage?.getAll();
console.log('All stored data:', allData);
// [{ key: 'theme', value: 'dark' }, { key: 'language', value: 'en' }]
```

---

## UI Components

### `MainButton`

Fixed bottom button for primary actions.

**Methods:**

```typescript
// Set button text
sdk.MainButton.setText(text: string): void

// Show button
sdk.MainButton.show(): void

// Hide button
sdk.MainButton.hide(): void

// Handle click
sdk.MainButton.onClick(callback: () => void): void
```

**Example:**

```typescript
// Set up send button
sdk.MainButton.setText('Send 10 MOVE');
sdk.MainButton.show();
sdk.MainButton.onClick(async () => {
  const confirmed = await sdk.showConfirm('Send 10 MOVE to recipient?');
  if (confirmed) {
    await sendTransaction();
  }
});
```

---

### `SecondaryButton`

Secondary fixed bottom button.

**Methods:**

```typescript
sdk.SecondaryButton.setText(text: string): void
sdk.SecondaryButton.show(): void
sdk.SecondaryButton.hide(): void
sdk.SecondaryButton.onClick(callback: () => void): void
```

**Example:**

```typescript
sdk.MainButton.setText('Send');
sdk.SecondaryButton.setText('Cancel');
sdk.SecondaryButton.show();
sdk.SecondaryButton.onClick(() => {
  sdk.MainButton.hide();
  sdk.SecondaryButton.hide();
  resetForm();
});
```

---

### `BackButton`

Back button for navigation.

**Methods:**

```typescript
sdk.BackButton.show(): void
sdk.BackButton.hide(): void
sdk.BackButton.onClick(callback: () => void): void
```

**Example:**

```typescript
sdk.BackButton.show();
sdk.BackButton.onClick(() => {
  // Navigate back or close modal
  window.history.back();
});
```

---

### `showPopup()`

Show a popup dialog with custom buttons.

**Parameters:**

```typescript
interface PopupOptions {
  title?: string;
  message: string;
  buttons?: PopupButton[];
}

interface PopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text: string;
}
```

**Returns:** `Promise<PopupResult>`

```typescript
const result = await sdk.showPopup({
  title: 'Confirm',
  message: 'Are you sure?',
  buttons: [
    { id: 'yes', text: 'Yes', type: 'default' },
    { id: 'no', text: 'No', type: 'cancel' }
  ]
});

if (result.button_id === 'yes') {
  console.log('User confirmed');
}
```

---

### `showAlert()`

Show a simple alert message.

**Parameters:** `message: string`

**Returns:** `Promise<void>`

```typescript
await sdk.showAlert('Transaction submitted successfully!');
```

---

### `showConfirm()`

Show a confirmation dialog with OK/Cancel buttons.

**Parameters:** `message: string, okText?: string, cancelText?: string`

**Returns:** `Promise<boolean>`

```typescript
const confirmed = await sdk.showConfirm(
  'Delete this item?',
  'Delete',
  'Cancel'
);

if (confirmed) {
  deleteItem();
}
```

---

## React Hooks

### `useMovementSDK()`

React hook for accessing the SDK. The hook automatically handles SDK initialization by calling `isInstalled()` and `ready()` internally.

**How it works:**

The hook internally performs these steps:
1. Checks if SDK is installed: `window.movementSDK?.isInstalled()`
2. Waits for SDK to be ready: `await window.movementSDK.ready()`
3. Returns the SDK instance and connection state

The `isLoading` state is `true` while waiting for `ready()` to complete. Once `isLoading` is `false`, the SDK is ready to use.

**Conceptually, the hook does this internally:**

```typescript
// Simplified internal implementation
function useMovementSDK() {
  const [sdk, setSdk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Step 1: Check if installed
      if (!window.movementSDK?.isInstalled()) {
        setIsLoading(false);
        return;
      }

      // Step 2: Wait for ready (this is what you don't see!)
      await window.movementSDK.ready();

      // Step 3: SDK is ready
      setSdk(window.movementSDK);
      setIsLoading(false);
    }

    init();
  }, []);

  return { sdk, isLoading, ... };
}
```

**Returns:**

```typescript
interface UseMovementSDKResult {
  sdk: MovementSDK | null;
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;  // true while waiting for ready() to complete
  error: Error | null;
  connect: () => Promise<void>;
  sendTransaction: (payload: TransactionPayload) => Promise<TransactionResult | null>;
}
```

**Example:**

```tsx
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

function MyComponent() {
  const {
    sdk,
    isConnected,
    address,
    isLoading,
    error,
    connect,
    sendTransaction
  } = useMovementSDK();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}
```

---

### `useMovementAccount()`

React hook for accessing account information.

**Returns:**

```typescript
interface UseMovementAccountResult {
  account: MovementAccount | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
import { useMovementAccount } from '@movement-labs/miniapp-sdk';

function AccountInfo() {
  const { account, isLoading } = useMovementAccount();

  if (isLoading) return <div>Loading account...</div>;

  return (
    <div>
      <p>Address: {account?.address}</p>
      <p>Balance: {account?.balance} MOVE</p>
    </div>
  );
}
```

---

### `useMovementTheme()`

React hook for accessing the app's current theme (light or dark mode).

**Returns:**

```typescript
interface UseMovementThemeResult {
  theme: ThemeInfo | null;
  isLoading: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
import { useMovementTheme } from '@movement-labs/miniapp-sdk';

function App() {
  const { theme, isLoading, error } = useMovementTheme();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const isDark = theme?.colorScheme === 'dark';

  return (
    <div className={isDark ? 'dark' : 'light'}>
      {/* Your app content */}
    </div>
  );
}
```

---

### `useAnalytics()`

React hook for tracking analytics events in mini apps. Events are sent through the host app's analytics service with automatic mini app context enrichment.

**Returns:**

```typescript
interface UseAnalyticsResult {
  track: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  identify: (userId: string, traits?: Record<string, any>) => Promise<void>;
  trackScreen: (screenName: string, properties?: Record<string, any>) => Promise<void>;
  setUserProperties: (properties: Record<string, any>) => Promise<void>;
  reset: () => Promise<void>;
  isEnabled: boolean;
  optOut: () => Promise<void>;
  optIn: () => Promise<void>;
  isAvailable: boolean;
}
```

**Example:**

```tsx
import { useAnalytics } from '@movement-labs/miniapp-sdk';

function MyComponent() {
  const { track, trackScreen, isAvailable } = useAnalytics();

  useEffect(() => {
    trackScreen('Home');
  }, []);

  const handleButtonClick = () => {
    track('Button Clicked', { button_name: 'submit' });
  };

  return <button onClick={handleButtonClick}>Submit</button>;
}
```

**Methods:**

- `track(eventName, properties?)` - Track a custom event
- `identify(userId, traits?)` - Identify the current user
- `trackScreen(screenName, properties?)` - Track a screen/page view
- `setUserProperties(properties)` - Set user properties without tracking an event
- `reset()` - Reset analytics state (e.g., on logout)
- `optOut()` - Opt out of analytics tracking
- `optIn()` - Opt back into analytics tracking

---

## Helper Functions

### `isInMovementApp()`

Check if app is running in Movement wallet (alternative to `sdk.isInstalled()`).

**Returns:** `boolean`

```typescript
import { isInMovementApp } from '@movement-labs/miniapp-sdk';

if (!isInMovementApp()) {
  console.error('Not in Movement app');
}
```

---

### `waitForSDK()`

Wait for SDK to be available with timeout.

**Parameters:** `timeout?: number, config?: SecurityConfig`

**Returns:** `Promise<MovementSDK>`

```typescript
import { waitForSDK } from '@movement-labs/miniapp-sdk';

try {
  const sdk = await waitForSDK(5000); // 5 second timeout
  console.log('SDK ready:', sdk);
} catch (error) {
  console.error('SDK not available:', error);
}
```

---

## Deep Linking

Share direct links to your mini app.

**Format:** `/apps/{appId}`

**Examples:**
- `/apps/send-tokens` - Opens send tokens app
- `/apps/bridge` - Opens bridge app
- `/apps/game-snake` - Opens your game

**Usage:**

```typescript
// Get your app's deep link
const deepLink = `https://moveeverything.app/apps/my-app-id`;

// Share via clipboard
await sdk.Clipboard.writeText(deepLink);
await sdk.showAlert('Link copied! Share with friends.');

// Or use native share
await sdk.share({
  title: 'Check out this mini app!',
  message: 'Play this awesome game on Movement',
  url: deepLink
});
```

**Use Cases:**
- Share games with friends
- Invite users to your app
- Deep link from notifications
- QR code generation

---

## Analytics

The SDK provides built-in analytics capabilities that bridge to the host app's analytics service (Mixpanel).

### `analytics.track()`

Track a custom event.

**Parameters:** `eventName: string, properties?: Record<string, any>`

**Returns:** `Promise<void>`

```typescript
await sdk.analytics?.track('Button Clicked', {
  button_name: 'submit',
  screen: 'checkout'
});
```

---

### `analytics.identify()`

Identify the current user with optional traits.

**Parameters:** `userId: string, traits?: Record<string, any>`

**Returns:** `Promise<void>`

```typescript
await sdk.analytics?.identify(userAddress, {
  premium_user: true,
  signup_date: '2024-01-15'
});
```

---

### `analytics.trackScreen()`

Track a screen/page view.

**Parameters:** `screenName: string, properties?: Record<string, any>`

**Returns:** `Promise<void>`

```typescript
await sdk.analytics?.trackScreen('Home', {
  referrer: 'deep_link'
});
```

---

### `analytics.setUserProperties()`

Set user properties without tracking an event.

**Parameters:** `properties: Record<string, any>`

**Returns:** `Promise<void>`

```typescript
await sdk.analytics?.setUserProperties({
  level: 5,
  total_purchases: 3
});
```

---

### `analytics.reset()`

Reset analytics state (e.g., on logout).

**Returns:** `Promise<void>`

```typescript
await sdk.analytics?.reset();
```

---

### `analytics.optOut()` / `analytics.optIn()`

Opt out of or back into analytics tracking.

**Returns:** `Promise<void>`

```typescript
// User requests to opt out
await sdk.analytics?.optOut();

// User opts back in
await sdk.analytics?.optIn();
```

---

### `analytics.isEnabled()`

Check if analytics is currently enabled.

**Returns:** `Promise<boolean>`

```typescript
const enabled = await sdk.analytics?.isEnabled();
console.log('Analytics enabled:', enabled);
```

---

## Security Configuration

Configure SDK security settings.

```typescript
import { getMovementSDK } from '@movement-labs/miniapp-sdk';

const sdk = getMovementSDK({
  maxTransactionAmount: '500000000',  // Max amount in octas
  rateLimitWindow: 60000,             // Window in ms
  maxRequestsPerWindow: 20,           // Max requests per window
  allowedOrigins: ['https://your-domain.com'],
  enableCSP: true,
  strictMode: true,
});
```

**SecurityConfig:**

```typescript
interface SecurityConfig {
  maxTransactionAmount?: string;
  allowedOrigins?: string[];
  rateLimitWindow?: number;
  maxRequestsPerWindow?: number;
  enableCSP?: boolean;
  strictMode?: boolean;
}
```

---

## TypeScript Types

Import types for full type safety:

```typescript
import type {
  MovementSDK,
  MovementAccount,
  NetworkInfo,
  TransactionPayload,
  TransactionResult,
  TransactionStatus,
  ViewPayload,
  SignMessagePayload,
  SignMessageResult,
  HapticOptions,
  NotificationOptions,
  PopupOptions,
  StorageOptions,
  AppContext,
  ThemeInfo,
  ShareOptions,
  CameraOptions,
  CameraResult,
  LocationResult,
  BiometricOptions,
  BiometricResult,
  SecurityConfig,
  AnalyticsAPI,
  AnalyticsEventProperties,
  AnalyticsUserProperties,
  MultiAgentTransactionPayload,
  FeePayerTransactionPayload,
  BatchTransactionPayload,
  BatchTransactionResult,
  ScriptComposerPayload,
  MNSAPI
} from '@movement-labs/miniapp-sdk';
```

---

## Error Handling

All SDK methods may throw errors. Always use try-catch:

```typescript
try {
  const result = await sdk.sendTransaction({...});
} catch (error) {
  switch (error.code) {
    case 'USER_REJECTED':
      console.log('User rejected transaction');
      break;
    case 'INSUFFICIENT_BALANCE':
      console.error('Not enough funds');
      break;
    default:
      console.error('Transaction failed:', error.message);
  }
}
```

Common error codes:
- `USER_REJECTED` - User cancelled the operation
- `INSUFFICIENT_BALANCE` - Not enough tokens for transaction
- `NETWORK_ERROR` - Network connection issues
- `INVALID_ADDRESS` - Invalid address format
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `PERMISSION_DENIED` - Missing required permissions
- `NOT_SUPPORTED` - Feature not available on this platform
