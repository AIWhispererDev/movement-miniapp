# Responses

Learn how to handle SDK command responses, results, and errors.

## Response Pattern

All SDK commands return promises that resolve with results or reject with errors:

```typescript
try {
  const result = await sdk.sendTransaction({...});
  // Handle success
  console.log('Transaction hash:', result.hash);
} catch (error) {
  // Handle error
  console.error('Error:', error.message);
}
```

## Success Responses

### Transaction Result

```typescript
const result = await sdk.sendTransaction({...});

// Result structure
{
  hash: '0x1234567890abcdef...', // Transaction hash
  success: true,                  // Whether it succeeded
  version: '12345678',            // Ledger version
  vmStatus: 'Executed'            // VM status
}
```

### Sign Message Result

```typescript
const result = await sdk.signMessage({
  message: 'Hello Movement',
  nonce: '12345'
});

// Result structure
{
  signature: '0xabcdef1234567890...', // Signature
  publicKey: '0x9876543210fedcba...', // Public key
  fullMessage: 'Hello Movement\nnonce: 12345' // Full signed message
}
```

### Balance Result

```typescript
const balance = await sdk.getBalance();

// Returns string
"1.25" // Balance in MOVE
```

### Account Result

```typescript
const account = await sdk.getAccount();

// Result structure
{
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  publicKey: '0x...',
  balance: '1.25'
}
```

## Error Responses

### Error Structure

All errors include:

```typescript
{
  code: 'ERROR_CODE',           // Error code
  message: 'Human-readable...',  // Error message
  details?: {...}                // Optional details
}
```

### Common Error Codes

| Code | Description | How to Handle |
|------|-------------|---------------|
| `USER_REJECTED` | User cancelled action | Don't show error, user intentionally cancelled |
| `INSUFFICIENT_BALANCE` | Not enough balance | Show friendly message, suggest getting more funds |
| `INVALID_SIGNATURE` | Signature verification failed | Check transaction format |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait before retrying |
| `NETWORK_ERROR` | Connection issue | Retry with exponential backoff |
| `INVALID_ADDRESS` | Malformed address | Validate address format |
| `TRANSACTION_FAILED` | Transaction reverted | Check contract logic |

### Error Handling Patterns

#### Basic Error Handling

```typescript
try {
  await sdk.sendTransaction({...});
} catch (error) {
  console.error('Error:', error.message);
  showErrorToast(error.message);
}
```

#### Specific Error Handling

```typescript
try {
  await sdk.sendTransaction({...});
} catch (error) {
  switch (error.code) {
    case 'USER_REJECTED':
      // User cancelled - don't show error
      console.log('User cancelled transaction');
      break;

    case 'INSUFFICIENT_BALANCE':
      showError('You don\'t have enough balance');
      break;

    case 'RATE_LIMIT_EXCEEDED':
      showError('Too many transactions. Please wait.');
      break;

    case 'NETWORK_ERROR':
      showError('Network error. Please check your connection.');
      retryWithBackoff();
      break;

    default:
      showError('Transaction failed: ' + error.message);
      logErrorToMonitoring(error);
  }
}
```

#### Retry Logic

```typescript
async function sendTransactionWithRetry(payload, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await sdk.sendTransaction(payload);
      return result;
    } catch (error) {
      // Only retry on network errors
      if (error.code !== 'NETWORK_ERROR' || i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Async vs Event Pattern

### Async Pattern (Recommended)

Wait for command completion:

```typescript
async function transfer() {
  try {
    const result = await sdk.sendTransaction({...});

    if (result.success) {
      showSuccess('Transaction confirmed!');
    }
  } catch (error) {
    showError(error.message);
  }
}
```

### Event Pattern (Advanced)

Subscribe to real-time updates:

```typescript
function transfer() {
  // Send transaction (non-blocking)
  sdk.sendTransaction({...})
    .then(result => {
      console.log('Transaction submitted:', result.hash);
    })
    .catch(error => {
      console.error('Error:', error);
    });

  // Listen for updates
  sdk.on('transaction:submitted', (tx) => {
    showToast('Transaction submitted...');
  });

  sdk.on('transaction:confirmed', (tx) => {
    showSuccess('Transaction confirmed!');
    refreshBalance();
  });

  sdk.on('transaction:failed', (error) => {
    showError('Transaction failed');
  });
}
```

## Transaction Status

### Wait for Confirmation

```typescript
const result = await sdk.sendTransaction({...});

// Wait for transaction confirmation
const status = await sdk.waitForTransaction(result.hash);

if (status.status === 'success') {
  console.log('Confirmed! Gas used:', status.gasUsed);
} else {
  console.error('Failed:', status.error);
}
```

### Real-time Monitoring

```typescript
const result = await sdk.sendTransaction({...});

// Subscribe to updates
const unsubscribe = sdk.onTransactionUpdate(result.hash, (status) => {
  console.log('Status:', status.status); // 'pending' | 'success' | 'failed'

  if (status.status === 'success') {
    showSuccess('Transaction confirmed!');
    unsubscribe(); // Stop monitoring
  } else if (status.status === 'failed') {
    showError('Transaction failed: ' + status.error);
    unsubscribe();
  }
});

// Cleanup when component unmounts
return () => unsubscribe();
```

## React Example

### With Hooks

```tsx
import { useState } from 'react';
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

function TransferButton() {
  const { sdk } = useMovementSDK();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleTransfer() {
    setLoading(true);
    setError('');

    try {
      const result = await sdk.sendTransaction({
        function: '0x1::aptos_account::transfer',
        arguments: [recipient, amount],
        type_arguments: []
      });

      await sdk.waitForTransaction(result.hash);

      await sdk.notify({
        title: 'Success!',
        body: 'Transfer completed'
      });
    } catch (err) {
      if (err.code !== 'USER_REJECTED') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleTransfer} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### With Real-time Updates

```tsx
import { useState, useEffect } from 'react';
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

function TransferStatus({ hash }) {
  const { sdk } = useMovementSDK();
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const unsubscribe = sdk.onTransactionUpdate(hash, (txStatus) => {
      setStatus(txStatus.status);
    });

    return () => unsubscribe();
  }, [hash]);

  return (
    <div className={`status ${status}`}>
      {status === 'pending' && '⏳ Confirming...'}
      {status === 'success' && '✅ Confirmed!'}
      {status === 'failed' && '❌ Failed'}
    </div>
  );
}
```

## Best Practices

::: tip ALWAYS HANDLE ERRORS
Never ignore error cases:

```typescript
// ❌ Bad
const result = await sdk.sendTransaction({...});

// ✅ Good
try {
  const result = await sdk.sendTransaction({...});
} catch (error) {
  handleError(error);
}
```
:::

::: tip USER FEEDBACK
Provide clear feedback for all states:

```typescript
setStatus('loading');
try {
  const result = await sdk.sendTransaction({...});
  setStatus('success');
  showToast('Transaction confirmed!');
} catch (error) {
  setStatus('error');
  showToast(error.message);
}
```
:::

::: tip GRACEFUL DEGRADATION
Handle SDK unavailability:

```typescript
if (!sdk?.isInstalled()) {
  return (
    <div className="error">
      Please open this app in Movement wallet
    </div>
  );
}
```
:::

::: warning DON'T RETRY USER REJECTIONS
If user cancels, respect their choice:

```typescript
catch (error) {
  if (error.code === 'USER_REJECTED') {
    // Don't show error or retry
    return;
  }
  // Handle other errors
}
```
:::

## Next Steps

- **[Testing →](/quick-start/testing)** - Test your response handling
- **[Commands →](/commands/)** - See all available commands
- **Error Reference** *(Coming Soon)* - Complete error code list
