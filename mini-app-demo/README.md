# Movement Mini App Demo

A demonstration of the Movement Mini App SDK methods and components. This demo shows how to integrate the SDK into mini apps that run within the Movement Everything (ME) super app.

## Running the App

```bash
npm install
npm run dev
```

Open the ME app on your mobile device and navigate to this mini app. The SDK only works when running inside the ME app.

## SDK Methods

**Core SDK Methods**

- `isInstalled()` - Check if running inside ME app
- `ready()` - Wait for SDK initialization
- `connect()` - Connection status management

**Account & Balance**

- `getUserInfo()` - Get connection/address info
- `getAccount()` - Detailed account information
- `getBalance()` - Current MOVE token balance

**Transactions**

- `sendTransaction()` - Sign and submit transactions
- `waitForTransaction()` - Wait for confirmation
- `onTransactionUpdate()` - Real-time status updates

**Device & UI**

- `scanQRCode()` - Open camera for QR scanning
- `showPopup()` - Native popup with custom buttons
- `showAlert()` - Simple alert dialogs
- `showConfirm()` - Confirmation dialogs
- `sendNotification()` - Push notifications

**Storage & Clipboard**

- `CloudStorage` - Persistent local storage (setItem, getItem, removeItem, getKeys)
- `Clipboard` - System clipboard access (writeText, readText)

**Theme & Haptics**

- `getTheme()` - Current host theme
- `haptic()` - Device vibration feedback (mobile only)

**Native UI Buttons**

- `MainButton` - Primary overlay button (setText, show, hide, onClick)
- `SecondaryButton` - Secondary overlay button
- `BackButton` - Top overlay back control

## Features

- **Interactive testing** - Each method shows real-time status and results
- **Error handling** - Clear error messages and debugging info
- **Debug information** - Shows available SDK methods and console logs
- **Real examples** - Complete transaction flows and native UI components

## Usage

The SDK is injected by the ME app and available as `window.movementSDK`:

```typescript
const sdk = window.movementSDK;
if (sdk?.isInstalled?.()) {
  // SDK methods are available
}
```

## Troubleshooting

**"SDK not available"** - Make sure you're running inside the ME app
**"Method not available"** - Some methods may not be implemented in all SDK versions
**Notifications not working** - Requires notification permissions and ME app
**Haptics not working** - Only available on mobile devices
