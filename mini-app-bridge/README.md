# Movement Bridge Mini App

A clean, modern bridge interface for moving assets from Movement to Ethereum.

## Features

- 🌉 Bridge assets from Movement → Ethereum
- 🔍 Asset selector (USDC, USDT, WETH)
- ✅ EVM address validation
- 📊 Pending transaction tracking
- 🎨 Clean, modern UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (see `.env.example`):
```bash
GH_TOKEN=your_github_personal_access_token
```

3. Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3011`

## Vercel Deployment

See `.npmrc` for GitHub token configuration. Set `GH_TOKEN` environment variable in Vercel project settings.

## SDK Integration

Uses `@movement-labs/miniapp-sdk` for wallet integration. The SDK is injected by the host app and provides:
- Wallet connection status
- Transaction signing via `signTransaction()`
- Haptic feedback
- Notifications

## Usage

1. Connect your Movement wallet in the host app
2. Select the asset to bridge
3. Enter the amount
4. Enter destination Ethereum address
5. Click "Bridge to Ethereum"
6. Track pending bridge status

## Architecture

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Ethers.js** for address validation
- **Movement SDK** for wallet integration
