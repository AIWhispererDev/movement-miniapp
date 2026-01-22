# Social App

A decentralized social media mini app demonstrating on-chain posts, global feeds, and real-time updates using Move contracts and view functions.

## Overview

The Social App demonstrates:
- On-chain post storage using Move contracts
- Global feed aggregation
- View functions for reading blockchain data
- Transaction-based post creation
- Reaction system with on-chain state
- Real-time feed updates

## Repository

The Social app is available in the `mini-app-social` directory of the [mini-app-examples](https://github.com/movementlabsxyz/miniapp-examples) repository.

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Movement Everything (ME) app installed on your mobile device
- Deployed Move contract (or use the testnet deployment)

### Setup

1. **Install dependencies:**

```bash
cd mini-app-social
npm install
# or
pnpm install
```

2. **Configure contract address:**

Update `constants.ts` with your deployed contract address:

```typescript
export const SOCIAL_MODULE_ADDRESS = '0x...';
```

Or use the testnet deployment:
```
0xe08098cd9db04d38b7962a4e2653c2b7362477943c47e976ed55c624b759580f
```

3. **Run the development server:**

```bash
npm run dev
# or
pnpm dev
```

4. **Open in ME app:**

Open the Movement Everything (ME) app on your mobile device and navigate to this mini app.

## Features

### On-Chain Posts

- **Create posts** - Store messages permanently on the blockchain
- **User feeds** - Each user has their own feed of posts
- **Global feed** - Aggregated feed of all posts across all users
- **Reactions** - React to posts with on-chain state

### View Functions

The app uses `sdk.view()` to read on-chain data without requiring wallet connection:

- `get_global_count()` - Total number of posts in global feed
- `get_global_pointer(index)` - Get pointer to a post in global feed
- `get_post(owner, index)` - Get a specific post by owner and index
- `get_post_count(owner)` - Get number of posts for a user

### Transaction Functions

- `post(content)` - Create a new on-chain post
- `react(owner, index)` - React to a specific post

## Architecture

### Move Contract

The `social.move` contract provides:

- **Feed struct** - Stores posts for each user
- **GlobalIndex** - Aggregates pointers to all posts
- **Post struct** - Contains author, content, timestamp, reactions

### Frontend Flow

1. **Load feed** - Use `sdk.view()` to fetch global feed count
2. **Fetch posts** - Iterate through global pointers and fetch each post
3. **Create post** - Use `sdk.sendTransaction()` to call `post()` function
4. **React** - Use `sdk.sendTransaction()` to call `react()` function

### Key Files

- `app/page.tsx` - Main social feed UI and logic
- `constants.ts` - Contract address configuration
- `move/sources/social.move` - On-chain social contract

## Contract Address

The social contract is deployed on testnet at:
```
0xe08098cd9db04d38b7962a4e2653c2b7362477943c47e976ed55c624b759580f
```

## SDK Features Used

- `view()` - Read posts and feed data from contract
- `sendTransaction()` - Create posts and reactions
- `getUserInfo()` - Get connected wallet address
- `isInstalled()` - Check if running in ME app
- `ready()` - Wait for SDK initialization

## Use Cases

- **Social apps** - Learn how to build decentralized social networks
- **On-chain data** - See how to store and retrieve data on blockchain
- **View functions** - Understand read-only blockchain queries
- **Feed aggregation** - Learn patterns for aggregating on-chain data
- **Real-time updates** - See how to refresh data without transactions

## Code Examples

### Reading Posts with View Functions

```typescript
// Get global feed count
const count = await sdk.view({
  function: `${SOCIAL_MODULE_ADDRESS}::social::get_global_count`,
  functionArguments: []
});

// Get a specific post
const post = await sdk.view({
  function: `${SOCIAL_MODULE_ADDRESS}::social::get_post`,
  functionArguments: [ownerAddress, postIndex]
});
```

### Creating a Post

```typescript
const result = await sdk.sendTransaction({
  function: `${SOCIAL_MODULE_ADDRESS}::social::post`,
  functionArguments: [message]
});
```

### Reacting to a Post

```typescript
const result = await sdk.sendTransaction({
  function: `${SOCIAL_MODULE_ADDRESS}::social::react`,
  functionArguments: [postOwner, postIndex]
});
```

## Troubleshooting

**"SDK not available"** - Make sure you're running inside the ME app

**"View function failed"** - Check that the contract address is correct and the contract is deployed

**"Posts not loading"** - Verify the contract address in `constants.ts` matches your deployment

**"Transaction failed"** - Ensure your wallet is connected and has testnet MOVE tokens

## Next Steps

- Explore the [SDK API Reference](/reference/sdk-api) for detailed method documentation
- Learn about [View Functions](/commands/view) for reading on-chain data
- Check out the [Scaffold App](/examples/scaffold) for more SDK examples
- Read about [Send Transaction](/commands/send-transaction) for on-chain operations

