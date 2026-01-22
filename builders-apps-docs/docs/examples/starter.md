# Starter App

A minimal counter mini app starter built with Next.js and Movement SDK. Perfect for developers who want a clean, simple starting point for building their own mini apps.

## Overview

The Starter App demonstrates:
- Simple on-chain counter with Move smart contract
- Clean, minimal UI with lots of whitespace
- SDK initialization and wallet connection
- Entry functions (increment, reset) and view functions
- Movement Design System integration

## Repository

The starter app is available in the `mini-app-starter` directory of the [mini-app-examples](https://github.com/movementlabsxyz/miniapp-examples) repository.

## Quick Start

```bash
cd mini-app-starter
npm install
npm run dev
```

Open the Movement Everything (ME) app on your mobile device and navigate to this mini app.

## Features

### Move Smart Contract

The app includes a simple Move contract with:
- `initialize()` - One-time setup to create counter resource
- `increment()` - Add 1 to the counter
- `reset()` - Reset counter to 0
- `get_value(address)` - View function to read counter value

### Frontend Features

- **Minimal Design** - Clean UI with lots of whitespace, inspired by create-vite-app
- **Wallet Integration** - Automatic SDK initialization and wallet connection
- **Error Handling** - Clear error messages and loading states
- **Haptic Feedback** - Tactile feedback on button interactions
- **Notifications** - Success messages after transactions

## Project Structure

```
mini-app-starter/
├── move/
│   ├── sources/
│   │   └── counter.move    # Move smart contract
│   └── Move.toml
├── src/
│   └── app/
│       ├── page.tsx        # Main counter page
│       ├── layout.tsx      # App layout
│       └── globals.css     # Styles with Movement Design System
├── constants.ts            # Contract address configuration
├── package.json
└── README.md
```

## Getting Started

1. **Deploy the Move contract:**
   ```bash
   cd move
   # Deploy using your preferred Move tooling
   ```

2. **Update the contract address:**
   Edit `constants.ts` and set `COUNTER_MODULE_ADDRESS` to your deployed contract address.

3. **Run the app:**
   ```bash
   npm install
   npm run dev
   ```

4. **Test in Movement wallet:**
   - Connect your wallet
   - Click "Initialize Counter" (one-time setup)
   - Use "Increment" and "Reset" buttons

## Code Highlights

### SDK Initialization

The app automatically initializes the SDK and connects to the wallet:

```typescript
useEffect(() => {
  const bootstrap = async () => {
    const instance = window.movementSDK;
    if (instance) {
      await instance.ready();
      // Get user info and subscribe to wallet changes
    }
  };
  bootstrap();
}, []);
```

### Calling Entry Functions

Send transactions to call Move entry functions:

```typescript
const result = await sdk.sendTransaction({
  function: `${COUNTER_MODULE_ADDRESS}::counter::increment`,
  type_arguments: [],
  arguments: [],
  title: "Increment Counter",
  description: "Add 1 to your counter",
});
```

### Reading View Functions

Query on-chain state without transactions:

```typescript
const result = await sdk.view({
  function: `${COUNTER_MODULE_ADDRESS}::counter::get_value`,
  type_arguments: [],
  function_arguments: [address],
});
const value = Array.isArray(result) ? result[0] : result;
```

## Use Cases

- **Learning** - Understand the basics of Movement mini apps
- **Starting Point** - Use as a template for your own mini app
- **Reference** - See how to structure a simple app with Move contracts
- **Customization** - Modify the counter to build your own features

## Next Steps

- Explore the [SDK API Reference](/reference/sdk-api) for detailed method documentation
- Check out other examples: [Scaffold App](/examples/scaffold), [Social App](/examples/social)
- Read the [Quick Start guide](/quick-start/) to learn more about building mini apps
- Review the [Move contract](/examples/starter#move-smart-contract) to understand on-chain logic

