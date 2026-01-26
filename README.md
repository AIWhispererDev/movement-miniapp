# Mini App Examples

This repository contains example mini apps and tools for building with the Movement Mini App SDK.

## Mini Apps

### mini-app-starter-ds (includes Movement Design System) and mini-app-starter-basic (no Movement Design system)

A minimal counter mini app starter built with Next.js and Movement SDK. A simple on-chain counter to use as a starting point for your own mini app.

- Simple on-chain counter with increment and reset
- Movement Design System integration
- Wallet connection and SDK initialization

### mini-app-demo

A demonstration of all Movement Mini App SDK methods and components. Shows how to integrate the SDK into mini apps running within the Movement Everything (ME) super app.

- Interactive testing of all SDK methods
- Account, balance, and transaction examples
- Device features: QR scanning, popups, alerts, notifications
- Storage, clipboard, theme, and haptic feedback
- Native UI buttons (MainButton, SecondaryButton, BackButton)

### mini-app-send

Send tokens to other users. A simple token transfer mini app.

### mini-app-bridge

Bridge assets from Movement to Ethereum.

- Asset selector (USDC, USDT, WETH)
- EVM address validation
- Pending transaction tracking

### mini-app-social

On-chain social feed with posts and reactions.

- Create and view posts
- React to posts
- Persistent local caching

### mini-app-staking

Staking interface for Movement validators.

- View validator pools and APY
- Stake and unstake MOVE tokens
- Track staking stats and rewards

### mini-app-sharing

Universal sharing service for mini apps. Generates beautiful preview cards for social media sharing (Twitter/X, Facebook, etc.) with automatic OG image generation.

- Share content from any mini app to social media
- Automatic Open Graph image generation
- Supports multiple content types (posts, scores, PnL, etc.)

## Developer Tools

### builders-apps-docs

VitePress documentation site for mini app builders. Contains guides, API references, and examples for building with the Movement Mini App SDK.

### move-contracts

On-chain app registry smart contract for Movement Everything. Manages mini app submissions, approvals, and metadata.

- App submission and approval workflow
- Developer and admin functionality
- Update requests and status tracking

### publishing-admin

Admin dashboard for managing Movement mini app submissions and approvals.

- Wallet authentication
- App review and approval workflow
- Stats dashboard

## Getting Started

Each mini app is a standalone Next.js project. To run any mini app:

```bash
cd <mini-app-folder>
npm install
npm run dev
```

Note: The SDK only works when running inside the Movement Everything (ME) app.
