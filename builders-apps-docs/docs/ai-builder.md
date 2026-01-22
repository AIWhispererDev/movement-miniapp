---
layout: doc
---

<script setup>
import AIBuilder from './.vitepress/theme/components/AIBuilder.vue'
</script>

# AI Mini App Builder

Build Movement mini apps with the help of AI. Describe your idea and get instant code generation with best practices built in.

<AIBuilder />

## How It Works

The AI Builder uses Claude (Anthropic's AI model) with deep knowledge of the Movement Mini App SDK to help you:

1. **Design your mini app** - Discuss features and architecture
2. **Generate code** - Get complete React/Next.js components with Movement SDK integration
3. **Create smart contracts** - Generate Move contracts when needed
4. **Write tests** - Get comprehensive test coverage
5. **Deploy** - Get deployment instructions and best practices

### LLM-Optimized Documentation

Our documentation includes an [/llms.txt](/llms.txt) file that provides structured information to AI tools. This helps ensure AI-generated code follows best practices and uses the latest SDK patterns.

**AI tools can access:**
- Complete SDK API reference with `isInstalled()` and `ready()` patterns
- Transaction and error handling patterns
- TypeScript type definitions
- Security best practices
- Design guidelines

## What You Can Build

- **DeFi Apps**: Token swaps, staking dashboards, yield farms
- **NFT Apps**: Galleries, marketplaces, minting platforms
- **Gaming**: On-chain games, leaderboards, achievements
- **Social**: Chat apps, social feeds, reputation systems
- **Payments**: P2P payments, invoicing, tipping
- **Utilities**: Multi-sig wallets, batch senders, portfolio trackers

## Tips for Best Results

1. **Be specific**: Instead of "token app", try "token swap app with slippage protection"
2. **Mention features**: List the specific features you need (QR scanning, haptic feedback, notifications)
3. **Request patterns**: Ask for proper SDK initialization with `isInstalled()` and `ready()` checks
4. **Ask questions**: The AI can explain concepts and suggest improvements
5. **Iterate**: Start simple and add features incrementally
6. **Review code**: Always review generated code for your use case
7. **Use TypeScript**: Request TypeScript code with full type definitions for best results

## Example Prompts

### Simple Apps

- "Create a token transfer app with QR code scanner for addresses, balance display, and haptic feedback"
- "Build an NFT gallery that shows my owned NFTs with proper SDK initialization using isInstalled() and ready()"
- "Make a simple staking dashboard with transaction notifications"

### SDK Patterns

- "Show me how to properly initialize the SDK with isInstalled() and ready() checks in a Next.js app"
- "Create a connect wallet button that uses the useMovementSDK hook with loading and error states"
- "Implement a transaction flow with waitForTransaction() and success notifications"

### Complex Apps

- "Create a P2P marketplace with escrow functionality and dispute resolution. Use a Move contract for escrow logic."
- "Build a decentralized social feed where users can post messages to the blockchain and follow other users"
- "Make a gaming leaderboard with on-chain score verification and rewards distribution"

### With Smart Contracts

- "Create a token vesting app with a Move contract that handles time-locked releases"
- "Build a DAO voting system with proposal creation, voting, and execution via Move contracts"
- "Make a lottery app where users buy tickets and winners are selected randomly on-chain"

## Features

- **Real-time code generation** - See code as it's being generated
- **Complete project structure** - Get package.json, components, contracts, and more
- **Best practices** - Security, error handling, and UX built in
- **TypeScript support** - Fully typed code generation
- **Smart contract generation** - Move contracts when blockchain logic is needed
- **Test generation** - Unit and integration tests

## Prerequisites

Before using the generated code:

1. Install Node.js 18+
2. Set up Movement wallet (for testing)
3. Get testnet MOVE tokens from faucet
4. Familiarity with React/Next.js (helpful but not required)

### For Local Development

If you're running the docs locally and want to use the AI Builder:

1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)
2. Set the environment variable:
   ```bash
   export ANTHROPIC_API_KEY=your-key-here
   npm run dev
   ```

The AI Builder requires the API server to be running (started automatically with `npm run dev`) and the `ANTHROPIC_API_KEY` environment variable to be set.

## Next Steps

After generating your mini app:

1. **Download the code** - Copy the generated files to your project
2. **Install dependencies** - Run `npm install`
3. **Test locally** - Run `npm run dev`
4. **Deploy** - Follow our [Publishing Guide](/guides/publishing)
5. **Submit to Movement** - Get your app listed in the Movement Everything wallet

## Support

Need help? Check out:

- [SDK Documentation](/sdk/overview)
- [API Reference](/reference/sdk-api)
- [Security Guide](/guides/security)
- [Discord Community](https://discord.gg/movementlabs)

---

**Ready to build?** Start chatting with the AI Builder above! 🚀
