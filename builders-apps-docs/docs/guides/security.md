# Security Best Practices

Building secure mini apps is critical. The SDK includes built-in protections, but you should follow these guidelines to ensure your app is secure.

---

## Built-in Security Features

### Rate Limiting

The SDK automatically rate-limits requests to prevent abuse:

- **30 requests per minute** (configurable)
- **1-minute window** (configurable)
- Applies to: transactions, connections, message signing

```typescript
// If rate limit is exceeded, SDK throws an error
try {
  await sdk.sendTransaction(payload);
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limit error
    console.log('Too many requests. Please slow down.');
  }
}
```

### Transaction Validation

All transactions are validated before sending:

- **Function format** - Must be `0x...::module::function`
- **Address validation** - Checks valid Movement address format
- **Amount limits** - Prevents excessive transfers (default: 10,000 MOVE)
- **Type safety** - Ensures arguments match expected types

```typescript
// ❌ Invalid - will be rejected
await sdk.sendTransaction({
  function: 'bad format',
  arguments: ['not_an_address', '999999999999999'],
  type_arguments: [],
});

// ✅ Valid
await sdk.sendTransaction({
  function: '0x1::aptos_account::transfer',
  arguments: ['0x1234...', '1000000'],
  type_arguments: [],
});
```

### Replay Attack Prevention

Message signing includes nonce validation:

```typescript
// SDK automatically generates nonce if not provided
const signature = await sdk.signMessage({
  message: 'Verify ownership',
  // nonce is auto-generated and validated
});

// Or provide your own
const signature = await sdk.signMessage({
  message: 'Verify ownership',
  nonce: `${Date.now()}-${Math.random()}`,
});
```

### Content Security Policy

The SDK sets CSP headers to prevent XSS attacks:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
connect-src 'self' https://*.movementlabs.xyz https://*.movementlabs.xyz;
```

---

## Configure Security

Customize security settings for your app:

```typescript
import { getMovementSDK } from '@movement-labs/miniapp-sdk';

const sdk = getMovementSDK({
  // Maximum transaction amount (in octas)
  maxTransactionAmount: '500000000', // 5 MOVE

  // Rate limiting
  rateLimitWindow: 60000,           // 1 minute
  maxRequestsPerWindow: 20,          // 20 requests per minute

  // Allowed origins (for iframe embedding)
  allowedOrigins: [
    'https://your-domain.com',
    'https://*.your-domain.com',
  ],

  // Enable Content Security Policy
  enableCSP: true,

  // Strict mode (extra validation)
  strictMode: true,
});
```

---

## Transaction Security

### Validate User Input

Always validate user input before creating transactions:

```typescript
function sendTokens(recipient: string, amount: string) {
  // ❌ BAD: No validation
  await sdk.sendTransaction({
    function: '0x1::aptos_account::transfer',
    arguments: [recipient, amount],
    type_arguments: [],
  });

  // ✅ GOOD: Validate input
  if (!recipient.match(/^0x[a-fA-F0-9]{1,64}$/)) {
    throw new Error('Invalid recipient address');
  }

  const amountNum = parseInt(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('Invalid amount');
  }

  if (amountNum > 1000000000) { // 10 MOVE
    throw new Error('Amount exceeds limit');
  }

  await sdk.sendTransaction({
    function: '0x1::aptos_account::transfer',
    arguments: [recipient, amount],
    type_arguments: [],
  });
}
```

### Confirm High-Value Transactions

Always confirm large transactions with the user:

```typescript
async function sendLargeAmount(recipient: string, amount: string) {
  const amountInMove = parseInt(amount) / 100000000;

  if (amountInMove > 10) {
    const confirmed = window.confirm(
      `Send ${amountInMove} MOVE to ${recipient.slice(0, 10)}...?`
    );

    if (!confirmed) {
      return;
    }
  }

  await sdk.sendTransaction({
    function: '0x1::aptos_account::transfer',
    arguments: [recipient, amount],
    type_arguments: [],
  });
}
```

### Use Biometric Auth for Sensitive Actions

Require biometric authentication for critical operations:

```typescript
async function withdrawFunds(amount: string) {
  // Check if biometrics are available
  const available = await sdk.biometric?.isAvailable();

  if (available) {
    const result = await sdk.biometric?.authenticate({
      promptMessage: 'Authenticate to withdraw funds',
      cancelText: 'Cancel',
    });

    if (!result.success) {
      throw new Error('Authentication failed');
    }
  }

  // Proceed with transaction
  await sdk.sendTransaction({
    function: '0x1::coin::transfer',
    arguments: [recipient, amount],
    type_arguments: ['0x1::aptos_coin::MovementCoin'],
  });
}
```

---

## Data Security

### Never Store Private Keys

**Never** store private keys, seed phrases, or sensitive data:

```typescript
// ❌ NEVER DO THIS
localStorage.setItem('privateKey', userPrivateKey);
await sdk.storage?.set('seedPhrase', seedPhrase);

// ✅ Store only non-sensitive data
await sdk.storage?.set('preferences', JSON.stringify({
  theme: 'dark',
  language: 'en',
}));
```

### Sanitize User Input

Clean user input before displaying or storing:

```typescript
function sanitizeInput(input: string): string {
  // Remove HTML tags
  return input.replace(/<[^>]*>/g, '');
}

function displayUsername(username: string) {
  const clean = sanitizeInput(username);
  document.getElementById('username').textContent = clean;
}
```

### Encrypt Sensitive Data

For sensitive data that must be stored locally:

```typescript
async function storeEncryptedData(key: string, data: any) {
  const encrypted = await encryptData(data, userPublicKey);
  await sdk.storage?.set(key, encrypted);
}

async function retrieveEncryptedData(key: string) {
  const encrypted = await sdk.storage?.get(key);
  if (!encrypted) return null;

  return await decryptData(encrypted, userPrivateKey);
}
```

---

## Network Security

### Use HTTPS Only

Always use HTTPS for API calls:

```typescript
// ❌ BAD: HTTP
const response = await fetch('http://api.example.com/data');

// ✅ GOOD: HTTPS
const response = await fetch('https://api.example.com/data');
```

### Validate API Responses

Never trust external API responses:

```typescript
async function fetchPrice(token: string) {
  const response = await fetch(`https://api.example.com/price/${token}`);
  const data = await response.json();

  // ✅ Validate response
  if (typeof data.price !== 'number' || data.price < 0) {
    throw new Error('Invalid price data');
  }

  return data.price;
}
```

---

## Error Handling

### Don't Expose Sensitive Information

Handle errors carefully to avoid leaking information:

```typescript
try {
  await sdk.sendTransaction(payload);
} catch (error) {
  // ❌ BAD: Exposes internal details
  alert(error.stack);

  // ✅ GOOD: Generic user-friendly message
  alert('Transaction failed. Please try again.');
  console.error('Transaction error:', error); // Log for debugging
}
```

---

## Audit Logging

Log security-related events for monitoring:

```typescript
function logSecurityEvent(event: {
  type: string;
  details: string;
  userId?: string;
}) {
  // Send to your backend
  fetch('/api/security-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event,
    }),
  });
}

// Log suspicious activity
if (failedAttempts > 5) {
  logSecurityEvent({
    type: 'suspicious_activity',
    details: 'Multiple failed login attempts',
    userId: address,
  });
}
```

---

## Security Checklist

Before launching your mini app:

- [ ] All user input is validated and sanitized
- [ ] High-value transactions require confirmation
- [ ] Sensitive actions use biometric authentication
- [ ] No private keys or seeds are stored
- [ ] All API calls use HTTPS
- [ ] API responses are validated
- [ ] Errors don't expose sensitive information
- [ ] Security events are logged
- [ ] Rate limiting is configured appropriately
- [ ] Transaction amount limits are set
- [ ] Content Security Policy is enabled

---

## Reporting Vulnerabilities

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security@movementlabs.xyz
3. Include detailed reproduction steps
4. We'll respond within 48 hours

---

## Additional Resources

- **[OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)** - Mobile security best practices
- **[Web3 Security](https://github.com/Consensys/smart-contract-best-practices)** - Smart contract security
- **[SDK Source Code](https://github.com/movementlabsxyz/miniapp-sdk)** - Review security implementations
