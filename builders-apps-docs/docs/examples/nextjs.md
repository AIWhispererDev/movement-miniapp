# Next.js / React

Build your Movement Mini App with Next.js and React.

## Prerequisites

- Node.js 18+ installed
- Basic knowledge of React and Next.js

## Installation

### 1. Create a new Next.js project

```bash
npx create-next-app@latest my-miniapp
cd my-miniapp
```

### 2. Install the Movement SDK

```bash
npm install @movement-labs/miniapp-sdk
```

## Basic Setup

### 1. Create your mini app component

Create `app/page.tsx`:

```tsx
'use client';

import { useMovementSDK } from '@movement-labs/miniapp-sdk';
import { useEffect } from 'react';

export default function Home() {
  const { sdk, isConnected, address, connect, sendTransaction } = useMovementSDK();

  useEffect(() => {
    if (sdk && !isConnected) {
      connect();
    }
  }, [sdk, isConnected, connect]);

  const handleTransaction = async () => {
    try {
      const result = await sendTransaction({
        function: '0x1::aptos_account::transfer',
        type_arguments: [],
        arguments: ['0x123...', '1000000'], // receiver address, amount
      });
      console.log('Transaction sent:', result);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Mini App</h1>

      {isConnected ? (
        <div>
          <p className="mb-4">Connected: {address}</p>
          <button
            onClick={handleTransaction}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send Transaction
          </button>
        </div>
      ) : (
        <p>Connecting to wallet...</p>
      )}
    </main>
  );
}
```

## SDK Features

### Check Connection Status

```tsx
const { sdk, isConnected, address } = useMovementSDK();

if (isConnected) {
  console.log('Wallet address:', address);
}
```

### Get Account Balance

```tsx
const { sdk } = useMovementSDK();

const balance = await sdk.getAccountBalance(address);
console.log('Balance:', balance);
```

### Sign and Submit Transaction

```tsx
const { sendTransaction } = useMovementSDK();

const result = await sendTransaction({
  function: '0x1::coin::transfer',
  type_arguments: ['0x1::aptos_coin::MovementCoin'],
  arguments: [receiverAddress, amount],
});
```

### Sign Message

```tsx
const { sdk } = useMovementSDK();

const signature = await sdk.signMessage({
  message: 'Hello Movement!',
});
```

## Development

### Run locally

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`

### Test in Movement Everything

1. Open Movement Everything app
2. Go to Settings → Enable Developer Mode
3. Scroll to "Mini App Testing"
4. Enter `http://localhost:3000`
5. Click "Test App"

## Deployment

### Build for production

```bash
npm run build
```

### Deploy

Deploy to any static hosting:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Push to gh-pages branch

## Example: Token Transfer App

```tsx
'use client';

import { useMovementSDK } from '@movement-labs/miniapp-sdk';
import { useState } from 'react';

export default function TransferApp() {
  const { isConnected, address, sendTransaction } = useMovementSDK();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const handleTransfer = async () => {
    try {
      setStatus('Sending...');
      const result = await sendTransaction({
        function: '0x1::aptos_account::transfer',
        type_arguments: [],
        arguments: [recipient, (parseFloat(amount) * 100000000).toString()],
      });
      setStatus(`Success! Hash: ${result.hash}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  if (!isConnected) return <div>Connecting...</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Transfer MOVE</h1>
      <p className="mb-4 text-sm">From: {address}</p>

      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleTransfer}
        disabled={!recipient || !amount}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        Transfer
      </button>

      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          {status}
        </div>
      )}
    </div>
  );
}
```

## Next Steps

- Explore the [SDK API Reference](/reference/sdk-api)
- Check out [example mini apps](https://github.com/movementlabsxyz/miniapp-examples)
- Join the [Movement Discord](https://discord.gg/movement) for help
