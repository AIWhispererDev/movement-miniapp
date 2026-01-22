# Scan QR Code

Open the device camera to scan QR codes, typically for wallet addresses.

## Basic Usage

```typescript
const scannedAddress = await sdk.scanQRCode();
console.log('Scanned:', scannedAddress);
```

## Return Value

Returns a `Promise<string>` containing the scanned QR code data.

## Example

### Scan Recipient Address

```typescript
async function handleScanRecipient() {
  try {
    const address = await sdk.scanQRCode();

    // Validate address format
    if (!address.startsWith('0x')) {
      throw new Error('Invalid address scanned');
    }

    setRecipientAddress(address);

    await sdk.haptic({ type: 'impact', style: 'light' });
  } catch (error) {
    if (error.message !== 'QR code scan cancelled') {
      console.error('Scan failed:', error);
      showError('Failed to scan QR code');
    }
  }
}
```

### React Component

```tsx
import { useState } from 'react';
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

function RecipientInput() {
  const { sdk } = useMovementSDK();
  const [address, setAddress] = useState('');

  async function handleScan() {
    try {
      const scanned = await sdk.scanQRCode();
      setAddress(scanned);
    } catch (error) {
      if (error.message !== 'QR code scan cancelled') {
        alert('Failed to scan QR code');
      }
    }
  }

  return (
    <div className="space-y-2">
      <label>Recipient Address</label>
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x..."
          className="input pr-12"
        />
        <button
          onClick={handleScan}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
        >
          📷
        </button>
      </div>
    </div>
  );
}
```

## Error Handling

```typescript
try {
  const address = await sdk.scanQRCode();
} catch (error) {
  switch (error.code) {
    case 'PERMISSION_DENIED':
      showError('Camera permission denied');
      break;

    case 'USER_CANCELLED':
      // User cancelled scan - don't show error
      console.log('Scan cancelled');
      break;

    case 'NOT_SUPPORTED':
      showError('QR scanning not supported on this device');
      break;

    default:
      showError('Failed to scan QR code');
  }
}
```

## Use Cases

- Scanning wallet addresses for transfers
- Scanning payment request QR codes
- Scanning deep links to other mini apps
- Scanning authentication codes

## Best Practices

::: tip VALIDATION
Always validate scanned data:

```typescript
const scanned = await sdk.scanQRCode();

if (!isValidAddress(scanned)) {
  throw new Error('Invalid address format');
}
```
:::

::: tip FEEDBACK
Provide haptic feedback on successful scan:

```typescript
const address = await sdk.scanQRCode();
await sdk.haptic({ type: 'notification', style: 'success' });
```
:::

::: warning PERMISSIONS
Scanner may fail if camera permission is denied. Handle gracefully.
:::

## Related

- [Haptic Feedback](/commands/haptic) - Provide tactile feedback
- Camera *(Coming Soon)* - Capture photos
