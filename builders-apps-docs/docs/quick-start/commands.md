# Commands

Commands are methods you call on the SDK to interact with the blockchain, device features, and platform capabilities.

## How Commands Work

All commands are available through the SDK instance:

```typescript
const sdk = window.movementSDK;

// Call a command
const result = await sdk.sendTransaction({...});
```

Commands return promises that resolve with results or reject with errors.

## Command Categories

### Blockchain Commands

Execute on-chain operations:

```typescript
// Send transaction
const tx = await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [recipient, amount],
  type_arguments: []
});

 
// Sign message
const signature = await sdk.signMessage({
  message: 'Hello Movement',
  nonce: '12345'
});

// Get balance
const balance = await sdk.getBalance();

> Note: `sdk.getAccount()` is not exposed on `window.movementSDK` in the current host. Use `window.aptos.account()` instead.
// Get account info
const account = await sdk.getAccount();
```

### Device Commands

Access device features:

```typescript
// Scan QR code
const address = await sdk.scanQRCode();

// Trigger haptic feedback
await sdk.haptic({ type: 'impact', style: 'medium' });

> Note: `sdk.camera.*` is not implemented in the current host.
// Take photo
const photo = await sdk.camera.takePicture();

> Note: `sdk.biometric.*` is not implemented in the current host.
// Authenticate with biometrics
const auth = await sdk.biometric.authenticate({
  promptMessage: 'Confirm transaction'
});

> Note: `sdk.location.*` is not implemented in the current host.
// Get location
const location = await sdk.location.getCurrentPosition();
```

### Platform Commands

Use platform features:

```typescript
// Send notification
await sdk.notify({
  title: 'Transaction Complete',
  body: 'Your transfer was successful'
});

// Share content
await sdk.share({
  message: 'Check out my mini app!',
  url: 'https://moveeverything.app/apps/my-app'
});

> Note: Use `sdk.CloudStorage.setItem/getItem` instead of `sdk.storage.*` in the current host.
// Save to storage
await sdk.storage.set('user_prefs', JSON.stringify(prefs));

// Get from storage
const data = await sdk.storage.get('user_prefs');
```

## Async Pattern

All commands are asynchronous and return promises:

```typescript
// Using async/await
async function sendTokens() {
  try {
    const result = await sdk.sendTransaction({...});
    console.log('Success:', result.hash);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Using .then/.catch
sdk.sendTransaction({...})
  .then(result => {
    console.log('Success:', result.hash);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

## Event Pattern (Advanced)

Subscribe to real-time updates:

```typescript
> Note: `sdk.onTransactionUpdate` is not implemented in the current host.
// Listen for transaction updates
sdk.onTransactionUpdate(hash, (status) => {
  if (status.status === 'success') {
    console.log('Transaction confirmed!');
  } else if (status.status === 'failed') {
    console.error('Transaction failed:', status.error);
  }
});

// Listen for balance changes
sdk.on('balance:updated', (balance) => {
  updateBalanceUI(balance);
});

// Cleanup when done
sdk.off('balance:updated', handler);
```

## Command Options

Most commands accept optional parameters:

```typescript
// Basic usage
await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [recipient, amount],
  type_arguments: []
});

// With options
await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [recipient, amount],
  type_arguments: [],

  // Display metadata
  title: 'Send MOVE',
  description: 'Transfer 1 MOVE to Alice',
  toAddress: recipient,
  amount: '1',

  // Advanced options
  maxGasAmount: '1000',
  gasUnitPrice: '100'
});
```

## Chaining Commands

Chain multiple commands together:

```typescript
async function claimAndSend() {
  // Claim reward
  const claimTx = await sdk.sendTransaction({
    function: '0xGame::rewards::claim',
    arguments: [playerId]
  });

  // Wait for confirmation
  await sdk.waitForTransaction(claimTx.hash);

  // Get new balance
  const balance = await sdk.getBalance();

  // Send to another address
  const sendTx = await sdk.sendTransaction({
    function: '0x1::aptos_account::transfer',
    arguments: [friendAddress, amount]
  });

  return sendTx.hash;
}
```

## Error Handling

Always handle errors gracefully:

```typescript
try {
  const result = await sdk.sendTransaction({...});

  // Check result
  if (result.success) {
    await sdk.notify({
      title: 'Success!',
      body: 'Transaction confirmed'
    });
  }
} catch (error) {
  // Handle specific errors
  switch (error.code) {
    case 'USER_REJECTED':
      console.log('User cancelled transaction');
      break;

    case 'INSUFFICIENT_BALANCE':
      showError('Not enough balance');
      break;

    case 'RATE_LIMIT_EXCEEDED':
      showError('Too many requests, try again later');
      break;

    default:
      showError('Transaction failed: ' + error.message);
  }
}
```

## Rate Limiting

Commands are rate-limited to prevent abuse:

| Command Type | Limit | Window |
|--------------|-------|--------|
| Transactions | 300 | Per day |
| Notifications | 50 | Per day |
| Storage operations | 1000 | Per hour |
| Other commands | 1000 | Per hour |

Check remaining quota:

```typescript
const limits = await sdk.getRateLimitStatus();
console.log('Remaining transactions:', limits.transactions.remaining);
console.log('Resets at:', new Date(limits.transactions.reset));
```

## Best Practices

::: tip USER FEEDBACK
Always provide loading states and feedback:

```typescript
setLoading(true);
try {
  const result = await sdk.sendTransaction({...});
  showSuccess('Transaction sent!');
} catch (error) {
  showError(error.message);
} finally {
  setLoading(false);
}
```
:::

::: tip ERROR HANDLING
Handle all error cases explicitly:

```typescript
try {
  await sdk.sendTransaction({...});
} catch (error) {
  if (error.code === 'USER_REJECTED') {
    // User cancelled - don't show error
  } else if (error.code === 'INSUFFICIENT_BALANCE') {
    showError('Insufficient balance');
  } else {
    // Log unexpected errors
    console.error('Unexpected error:', error);
    showError('Something went wrong');
  }
}
```
:::

::: warning VALIDATION
Validate inputs before calling commands:

```typescript
// ❌ Bad
await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [userInput, amount] // Not validated!
});

// ✅ Good
if (!isValidAddress(recipient)) {
  throw new Error('Invalid address');
}

if (amount <= 0) {
  throw new Error('Amount must be positive');
}

await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: [recipient, amount]
});
```
:::

## Next Steps

- **[Responses →](/quick-start/responses)** - Handle command results
- **[Testing →](/quick-start/testing)** - Test your commands
- **[Commands Reference →](/commands/)** - See all available commands
