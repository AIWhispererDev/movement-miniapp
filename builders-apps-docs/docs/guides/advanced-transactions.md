# Advanced Transactions

The Movement SDK supports multiple transaction types beyond basic transfers. These advanced patterns enable complex on-chain interactions.

---

## Multi-Agent Transactions

Multi-agent transactions allow multiple accounts to participate in a single transaction. This is useful for:
- Multi-signature wallets
- Escrow services
- Collaborative actions

### How It Works

1. **Primary sender** initiates the transaction
2. **Secondary signers** provide additional signatures
3. All signatures are verified on-chain
4. Transaction executes with all signers' permissions

### Example: Multi-Sig Approval

```typescript
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

const { sdk } = useMovementSDK();

// Execute a multi-sig transaction
> Note: `sendMultiAgentTransaction()` is not implemented in the current host.
const result = await sdk.sendMultiAgentTransaction({
  function: '0x1::multisig::approve_transaction',
  arguments: [
    multisigAddress,
    transactionId,
  ],
  type_arguments: [],
  secondarySigners: [
    '0xabc...', // Second approver
    '0xdef...', // Third approver
  ],
});

console.log('Multi-sig approved:', result.hash);
```

### Security Notes

- All secondary signers must be valid addresses
- The Move function must accept the correct number of signers
- Rate limiting applies per sender account

---

## Fee Payer (Sponsored) Transactions

Fee payer transactions allow a different account to cover gas fees. Perfect for:
- Onboarding new users (sponsor their first transactions)
- App-funded operations
- Gasless user experiences

### How It Works

1. **User** signs the transaction payload
2. **Fee payer** (sponsor) signs as the gas payer
3. Fee payer's account is charged for gas
4. Transaction executes on behalf of the user

### Example: Sponsored NFT Mint

```typescript
const { sdk, address } = useMovementSDK();

// User mints NFT, sponsor pays gas
> Note: `sendFeePayerTransaction()` is not implemented in the current host.
const result = await sdk.sendFeePayerTransaction({
  function: '0x1::nft::mint',
  arguments: [
    'Cool NFT',
    'An awesome NFT',
    'https://example.com/nft.png',
  ],
  type_arguments: [],
  feePayer: '0x_sponsor_address_...', // This account pays gas
});

console.log('NFT minted (gas-free for user):', result.hash);
```

### Use Cases

- **Free trials**: Let users try your app without MOVE tokens
- **Rewards**: Sponsor claim transactions for users
- **Onboarding**: Remove gas fee friction for new users

---

## Batch Transactions

Submit multiple transactions in a single call. Useful for:
- Bulk token transfers
- Sequential operations
- Reducing transaction overhead

### How It Works

1. Provide an array of transaction payloads
2. SDK submits them sequentially
3. Returns results for all transactions
4. Partial failures are tracked

### Example: Bulk Airdrops

```typescript
const { sdk } = useMovementSDK();

// Airdrop tokens to multiple users
const recipients = [
  { address: '0xabc...', amount: '1000000' },
  { address: '0xdef...', amount: '2000000' },
  { address: '0x123...', amount: '1500000' },
];

> Note: `sendBatchTransactions()` is not implemented in the current host.
const result = await sdk.sendBatchTransactions({
  transactions: recipients.map(r => ({
    function: '0x1::aptos_account::transfer',
    arguments: [r.address, r.amount],
    type_arguments: [],
  })),
});

console.log(`Success: ${result.successCount}/${recipients.length}`);
console.log('Failed:', result.failureCount);
```

### Best Practices

- **Error handling**: Check individual results for failures
- **Gas estimation**: Ensure sufficient balance for all transactions
- **Rate limits**: Batch size affects rate limiting

---

## Script Transactions

Execute complex Move scripts with multiple function calls. For advanced use cases:
- Custom logic composition
- Multi-step operations
- Dynamic contract interactions

### How It Works

1. Compile a Move script to bytecode
2. Pass bytecode and arguments to SDK
3. Script executes on-chain with full composability

### Example: Complex Swap & Stake

```typescript
const { sdk } = useMovementSDK();

// Pre-compiled Move script that swaps tokens and stakes them
const swapAndStakeScript = '0x...'; // Compiled bytecode

const result = await sdk.sendScriptTransaction({
  script: swapAndStakeScript,
  arguments: [
    '1000000',  // Amount to swap
    '0xabc...',  // Pool address
  ],
  type_arguments: [
    '0x1::aptos_coin::AptosCoin',
    '0x1::usdc::USDC',
  ],
});

console.log('Swap & stake completed:', result.hash);
```

### When to Use Scripts

- **Complex workflows**: Multiple contract calls in one transaction
- **Gas optimization**: Reduce multiple transactions to one
- **Atomic operations**: All-or-nothing execution

---

## Transaction Options

All transaction types support additional options:

```typescript
// Coming soon: Gas configuration
{
  maxGasAmount: '100000',
  gasUnitPrice: '100',
  expirationTimestamp: Date.now() + 60000, // 1 minute
}
```

---

## Error Handling

Always handle errors appropriately:

```typescript
try {
  const result = await sdk.sendMultiAgentTransaction(payload);
  console.log('Success:', result.hash);
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Rate limit exceeded
    alert('Too many requests. Please wait.');
  } else if (error.message.includes('Invalid')) {
    // Validation error
    console.error('Invalid payload:', error);
  } else {
    // Other errors
    console.error('Transaction failed:', error);
  }
}
```

---

## Security Considerations

All advanced transaction types include:

- **Rate limiting** - Prevents spam and abuse
- **Payload validation** - Ensures correct format
- **Address verification** - Validates all addresses
- **Amount limits** - Configurable transaction caps

See [Security Guide](/guides/security) for more details.

---

## Next Steps

- **[API Reference](/reference/sdk-api)** - Complete method documentation
- **[Security Guide](/guides/security)** - Best practices
- **[SDK Overview](/sdk/overview)** - Core features
