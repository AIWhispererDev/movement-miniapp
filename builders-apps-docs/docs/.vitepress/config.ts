import { defineConfig } from 'vitepress'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: 'Movement Mini Apps',
  description: 'Build blockchain apps that run natively in Movement wallet',
  base: '/',
  appearance: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#81ffba' }],
  ],

  markdown: {
    container: {
      tipLabel: 'Tip',
      warningLabel: 'Warning',
      dangerLabel: 'Danger',
      infoLabel: 'Info',
      detailsLabel: 'Details'
    },
    config(md) {
      md.use(copyOrDownloadAsMarkdownButtons)
    }
  },

  vite: {
    plugins: [
      llmstxt({
        title: 'Movement Mini Apps Documentation',
        customLLMsTxtTemplate: `# Movement Mini Apps SDK

> Build blockchain mini apps that run natively inside Movement wallet.
> Web apps (HTML/CSS/JS) with automatic wallet connection, transaction signing, and native device APIs.

## What Are Mini Apps?

Mini apps are lightweight web applications that run inside the Movement "Move Everything" super app. Users don't need to install anything - your app loads instantly inside their wallet with full blockchain capabilities.

**Key benefits:**
- Wallet is already connected (no "Connect Wallet" flow needed)
- Native device access: camera, haptics, notifications, biometrics
- Instant distribution to all Movement wallet users
- Build with any web framework: React, Next.js, vanilla JS

## Installation

\`\`\`bash
npm install @movement-labs/miniapp-sdk
\`\`\`

## Quick Start (React)

\`\`\`typescript
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

function App() {
  const { sdk, address, isConnected, isLoading } = useMovementSDK();

  if (isLoading) return <div>Loading...</div>;

  async function sendMove() {
    const result = await sdk.sendTransaction({
      function: '0x1::aptos_account::transfer',
      arguments: [recipientAddress, '100000000'], // 1 MOVE (8 decimals)
      type_arguments: []
    });
    console.log('TX Hash:', result.hash);
  }

  return <button onClick={sendMove}>Send 1 MOVE</button>;
}
\`\`\`

## Quick Start (Vanilla JS)

\`\`\`javascript
// SDK is available on window.movementSDK
const sdk = window.movementSDK;

// Wait for SDK to be ready
await sdk.ready();

// Send transaction
const result = await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [recipientAddress, '100000000'],
  type_arguments: []
});
\`\`\`

## Core APIs

### Blockchain
- \`sdk.sendTransaction({ function, arguments, type_arguments })\` - Execute transactions
- \`sdk.view({ function, function_arguments, type_arguments })\` - Read on-chain data (no signing)
- \`sdk.waitForTransaction(hash)\` - Wait for confirmation
- \`sdk.address\` - Connected wallet address
- \`sdk.getBalance()\` - Get MOVE balance

### Device Features
- \`sdk.scanQRCode()\` - Open camera to scan QR
- \`sdk.haptic({ type, style })\` - Tactile feedback (impact/notification/selection)
- \`sdk.notify({ title, body })\` - Push notifications
- \`sdk.share({ title, message, url })\` - Native share sheet
- \`sdk.Clipboard.writeText(text)\` - Copy to clipboard

### UI Components
- \`sdk.MainButton.setText(text)\` / \`.show()\` / \`.onClick(fn)\` - Fixed bottom button
- \`sdk.showAlert(message)\` - Simple alert
- \`sdk.showConfirm(message)\` - OK/Cancel dialog
- \`sdk.showPopup({ title, message, buttons })\` - Custom popup

### Storage
- \`sdk.CloudStorage.setItem(key, value)\` - Persist data
- \`sdk.CloudStorage.getItem(key)\` - Retrieve data

## Important Patterns

### Always check SDK is ready
\`\`\`typescript
// React: useMovementSDK handles this automatically
const { sdk, isLoading } = useMovementSDK();
if (isLoading) return <Loading />;

// Vanilla JS: call ready() first
await window.movementSDK.ready();
\`\`\`

### Amounts are strings (8 decimals for MOVE)
\`\`\`typescript
// 1 MOVE = 100000000 (8 decimals)
arguments: ['100000000'] // ✅ String
arguments: [100000000]   // ❌ May lose precision
\`\`\`

### Handle user rejection
\`\`\`typescript
try {
  await sdk.sendTransaction({...});
} catch (error) {
  if (error.code === 'USER_REJECTED') {
    // User cancelled - don't show error
  }
}
\`\`\`

### Transaction function format
\`\`\`typescript
function: 'address::module::function'
// Example: '0x1::aptos_account::transfer'
\`\`\`

## Rate Limits
- Transactions: 300/day per user
- Notifications: 50/day per user
- Other commands: 1000/hour

## Common Error Codes
- \`USER_REJECTED\` - User cancelled
- \`INSUFFICIENT_BALANCE\` - Not enough funds
- \`RATE_LIMIT_EXCEEDED\` - Too many requests
- \`NETWORK_ERROR\` - Connection issues

## React Hooks
- \`useMovementSDK()\` - Main hook: sdk, address, isConnected, sendTransaction
- \`useMovementAccount()\` - Account info
- \`useMovementTheme()\` - Light/dark mode
- \`useAnalytics()\` - Event tracking

---

## Full Documentation

{toc}

---

For llms-full.txt with complete API reference and examples, fetch: /llms-full.txt`
      })
    ],
    build: {
      target: 'esnext'
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  },

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Docs', link: '/quick-start/' },
      { text: 'Commands', link: '/commands/' },
      { text: 'Publishing', link: '/publishing/' },
      { text: 'Guidelines', link: '/guidelines/design' },
      // { text: 'AI Builder', link: '/ai-builder' },
      { text: 'GitHub', link: 'https://github.com/movementlabsxyz' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What are Mini Apps?', link: '/' },
          { text: 'Quick Start', link: '/quick-start/' },
        ]
      },
      {
        text: 'Quick Start',
        collapsed: false,
        items: [
          { text: 'Installing', link: '/quick-start/installing' },
          { text: 'Commands', link: '/quick-start/commands' },
          { text: 'Responses', link: '/quick-start/responses' },
          { text: 'Testing', link: '/quick-start/testing' },
        ]
      },
      {
        text: 'Commands',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/commands/' },
          { text: 'View Function', link: '/commands/view' },
          { text: 'Send Transaction', link: '/commands/send-transaction' },
          { text: 'Scan QR Code', link: '/commands/scan-qr' },
          { text: 'Haptic Feedback', link: '/commands/haptic' },
          { text: 'Notifications', link: '/commands/notifications' },
        ]
      },
      {
        text: 'Examples',
        collapsed: false,
        items: [
          { text: 'Next.js / React', link: '/examples/nextjs' },
          { text: 'Vanilla JavaScript', link: '/examples/vanilla' },
          { text: 'Starter App', link: '/examples/starter' },
          { text: 'Scaffold App', link: '/examples/scaffold' },
          { text: 'Social App', link: '/examples/social' },
          // { text: 'Unity', link: '/examples/unity' },
        ]
      },
      {
        text: 'Guidelines',
        collapsed: false,
        items: [
          { text: 'Design Guidelines', link: '/guidelines/design' },
        ]
      },
      {
        text: 'Technical Reference',
        collapsed: false,
        items: [
          { text: 'SDK API Reference', link: '/reference/sdk-api' },
        ]
      },
      {
        text: 'Publishing',
        collapsed: false,
        items: [
          { text: 'Publishing Guide', link: '/publishing/' },
          { text: '🚀 Publish App', link: '/publishing/publisher' },
        ]
      },
    ],

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/movementlabsxyz' },
      { icon: 'twitter', link: 'https://twitter.com/moveindustries' },
      { icon: 'discord', link: 'https://discord.gg/movementlabs' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Movement Labs'
    },

    editLink: {
      pattern: 'https://github.com/movementlabsxyz/miniapp-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
