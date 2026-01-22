# Commands

Commands are the primary way your mini app interacts with the Movement SDK. They enable blockchain transactions, device features, and platform capabilities.

## Available Commands

### Blockchain

<div class="command-grid">

**[View Function](/commands/view)**
Call read-only Move view functions to fetch on-chain data

**[Send Transaction](/commands/send-transaction)**
Execute blockchain transactions with user approval

**Sign Message** *(Coming Soon)*
Sign messages for authentication and verification

</div>

### Device Features

<div class="command-grid">

**[Scan QR Code](/commands/scan-qr)**
Scan wallet addresses and QR codes

**[Haptic Feedback](/commands/haptic)**
Provide tactile feedback for user actions

**Camera** *(Coming Soon)*
Capture photos and access media library

**Biometrics** *(Coming Soon)*
Authenticate with Face ID / Touch ID

**Location** *(Coming Soon)*
Access device GPS location

</div>

### Platform

<div class="command-grid">

**[Notifications](/commands/notifications)**
Send push notifications to users

**Share** *(Coming Soon)*
Open native share sheet

**Storage** *(Coming Soon)*
Save data locally on device

</div>

### Analytics

<div class="command-grid">

**[Analytics](/reference/sdk-api#analytics)**
Track events, screens, and user properties

</div>

## Usage Patterns

All commands are available through the SDK instance:

```typescript
// Get SDK instance
const sdk = window.movementSDK;

// Or use React hook
const { sdk } = useMovementSDK();

// Call command
const result = await sdk.sendTransaction({...});
```

## Response Handling

Commands return promises that resolve with results or reject with errors:

```typescript
try {
  const result = await sdk.sendTransaction({...});
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

See [Responses](/quick-start/responses) for detailed error handling patterns.

## Rate Limits

Commands are rate-limited to prevent abuse:

- **Transactions**: 300 per day per user
- **Notifications**: 50 per day per user
- **Other commands**: 1000 per hour

Rate limit errors return status code `429`.

<style>
.command-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.command-grid p {
  margin: 0;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.2s;
}

.command-grid p:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
}

.command-grid strong a {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 600;
}
</style>
