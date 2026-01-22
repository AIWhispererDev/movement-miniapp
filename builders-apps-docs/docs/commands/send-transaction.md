# Send Transaction

Execute blockchain transactions with user approval. Supports token transfers, smart contract interactions, and complex on-chain operations.

## Basic Usage

```typescript
const result = await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [recipientAddress, '1000000'], // 0.01 MOVE (8 decimals)
  type_arguments: []
});

console.log('Transaction hash:', result.hash);
```

## Parameters

### `function` <Badge type="danger" text="required" />

Fully qualified module function in format: `address::module::function`

```typescript
function: '0x1::aptos_account::transfer'
```

### `arguments` <Badge type="danger" text="required" />

Array of function arguments. Types must match the Move function signature.

```typescript
arguments: [
  '0x123...', // address
  '1000000',  // u64 as string
  true        // bool
]
```

### `type_arguments` <Badge type="tip" text="optional" />

Generic type arguments for the function.

```typescript
type_arguments: ['0x1::aptos_coin::AptosCoin']
```

### Display Metadata <Badge type="tip" text="optional" />

Additional fields for transaction confirmation UI:

```typescript
{
  title: 'Send MOVE',
  description: 'Transfer 0.01 MOVE',
  toAddress: recipientAddress,
  amount: '0.01'
}
```

## Return Value

Returns a `Promise<TransactionResult>`:

```typescript
{
  hash: string;      // Transaction hash
  success: boolean;  // Whether transaction succeeded
  version?: string;  // Ledger version (if successful)
  vmStatus?: string; // VM execution status
}
```

## Examples

### Token Transfer

```typescript
const result = await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    '100000000' // 1 MOVE (8 decimals)
  ],
  type_arguments: [],

  // Optional: Display metadata
  title: 'Send MOVE',
  description: 'Transfer 1 MOVE to Alice',
  toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  amount: '1'
});

console.log('Transfer complete:', result.hash);
```

### NFT Minting

```typescript
const result = await sdk.sendTransaction({
  function: '0x3::token::mint',
  arguments: [
    collectionName,
    tokenName,
    description,
    imageUri,
    maxSupply
  ],
  type_arguments: [],

  title: 'Mint NFT',
  description: `Mint "${tokenName}" NFT`
});
```

### Coin Transfer (Generic)

For transferring coins other than MOVE:

```typescript
const result = await sdk.sendTransaction({
  function: '0x1::coin::transfer',
  type_arguments: [
    '0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39::coin::USDC'
  ],
  arguments: [
    recipientAddress,
    '1000000' // 1 USDC (6 decimals)
  ],

  title: 'Send USDC',
  description: 'Transfer 1 USDC'
});
```

### Smart Contract Interaction

```typescript
const result = await sdk.sendTransaction({
  function: '0xMyContract::game::claim_reward',
  arguments: [
    playerId,
    rewardAmount,
    rewardType
  ],
  type_arguments: [],

  title: 'Claim Reward',
  description: 'Claim 100 game tokens'
});
```

## Error Handling

Always wrap transactions in try-catch:

```typescript
try {
  const result = await sdk.sendTransaction({...});

  if (result.success) {
    // Transaction confirmed
    await sdk.notify({
      title: 'Success!',
      body: 'Transaction confirmed'
    });
  }
} catch (error) {
  if (error.code === 'USER_REJECTED') {
    console.log('User cancelled transaction');
  } else if (error.code === 'INSUFFICIENT_BALANCE') {
    console.error('Not enough balance');
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.error('Too many transactions, try again later');
  } else {
    console.error('Transaction failed:', error.message);
  }
}
```

## Transaction Monitoring

Wait for transaction confirmation:

```typescript
const result = await sdk.sendTransaction({...});

// Option 1: Wait for confirmation
const status = await sdk.waitForTransaction(result.hash);
console.log('Confirmed!', status);

// Option 2: Subscribe to updates
sdk.onTransactionUpdate(result.hash, (status) => {
  if (status.status === 'success') {
    console.log('Transaction confirmed!');
  } else if (status.status === 'failed') {
    console.error('Transaction failed:', status.error);
  }
});
```

## Best Practices

::: tip AMOUNTS
Always pass amounts as strings to avoid precision loss with large numbers.

```typescript
// ✅ Good
arguments: ['1000000000']

// ❌ Bad - may lose precision
arguments: [1000000000]
```
:::

::: tip VALIDATION
Validate addresses and amounts before sending:

```typescript
if (!recipientAddress.startsWith('0x')) {
  throw new Error('Invalid address format');
}

const amount = parseFloat(amountInput);
if (isNaN(amount) || amount <= 0) {
  throw new Error('Invalid amount');
}
```
:::

::: warning USER FEEDBACK
Always provide loading states and feedback:

```typescript
setIsLoading(true);
try {
  const result = await sdk.sendTransaction({...});
  showSuccessMessage('Transaction sent!');
} catch (error) {
  showErrorMessage(error.message);
} finally {
  setIsLoading(false);
}
```
:::

::: danger SECURITY
Never expose private keys or seed phrases in your app code. The SDK handles all signing securely.
:::

## Rate Limits

- **300 transactions per day** per user
- Exceeding limit returns error code `429`
- Resets at midnight UTC

## Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `USER_REJECTED` | User cancelled transaction | Handle gracefully, don't retry |
| `INSUFFICIENT_BALANCE` | Not enough balance | Check balance before sending |
| `INVALID_SIGNATURE` | Signature verification failed | Ensure correct transaction format |
| `RATE_LIMIT_EXCEEDED` | Too many transactions | Wait before retrying |
| `NETWORK_ERROR` | Connection issue | Retry with exponential backoff |

## Related

- Sign Message *(Coming Soon)* - Sign messages without transactions
- Multi-Agent Transactions *(Coming Soon)* - Multiple signers
- Fee Payer Transactions *(Coming Soon)* - Sponsored gas fees
- Batch Transactions *(Coming Soon)* - Multiple transactions at once
