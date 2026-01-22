# Scaffold App

A complete reference implementation demonstrating all Movement SDK methods and components. Perfect for exploring SDK capabilities and testing features.

## Overview

The Scaffold App is a comprehensive demo that showcases:
- All SDK methods with interactive testing
- Real-time status and results
- Error handling patterns
- Native UI components
- Storage and clipboard APIs

## Repository

The scaffold app is available in the `mini-app-scaffold` directory of the [mini-app-examples](https://github.com/movementlabsxyz/miniapp-examples) repository.

## Quick Start

```bash
cd mini-app-scaffold
npm install
npm run dev
```

Open the Movement Everything (ME) app on your mobile device and navigate to this mini app.

## Features Demonstrated

### Core SDK Methods

- `isInstalled()` - Check if running inside ME app
- `ready()` - Wait for SDK initialization
- `connect()` - Connection status management

### Account & Balance

- `getUserInfo()` - Get connection/address info
- `getAccount()` - Detailed account information
- `getBalance()` - Current MOVE token balance

### Transactions

- `sendTransaction()` - Sign and submit transactions
- `waitForTransaction()` - Wait for confirmation
- `onTransactionUpdate()` - Real-time status updates

### Device & UI

- `scanQRCode()` - Open camera for QR scanning
- `showPopup()` - Native popup with custom buttons
- `showAlert()` - Simple alert dialogs
- `showConfirm()` - Confirmation dialogs
- `notify()` - Push notifications

### Storage & Clipboard

- `CloudStorage` - Persistent local storage (setItem, getItem, removeItem, getKeys)
- `Clipboard` - System clipboard access (writeText, readText)

### Theme & Haptics

- `getTheme()` - Current host theme
- `haptic()` - Device vibration feedback (mobile only)

### Native UI Buttons

- `MainButton` - Primary overlay button (setText, show, hide, onClick)
- `SecondaryButton` - Secondary overlay button
- `BackButton` - Top overlay back control

## Use Cases

- **Learning the SDK** - Interactive exploration of all available methods
- **Testing features** - Verify SDK functionality before implementing in your app
- **Debugging** - See real-time status and error messages
- **Reference** - Copy patterns and code snippets for your own app

## Project Structure

```
mini-app-scaffold/
├── app/
│   ├── page.tsx      # Main scaffold component
│   ├── layout.tsx    # App layout
│   └── globals.css   # Styles
├── package.json
└── README.md
```

## Next Steps

- Explore the [SDK API Reference](/reference/sdk-api) for detailed method documentation
- Check out other examples: [Next.js](/examples/nextjs), [Vanilla JS](/examples/vanilla), [Social App](/examples/social)
- Read the [Commands guide](/quick-start/commands) to understand SDK usage patterns

