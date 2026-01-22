# Haptic Feedback

Provide tactile feedback to enhance user experience with physical sensations.

## Basic Usage

```typescript
await sdk.haptic({ type: 'impact', style: 'medium' });
```

## Parameters

### `type` <Badge type="danger" text="required" />

Type of haptic feedback:

- `'impact'` - Physical collision (button press, tap)
- `'notification'` - Alerts and results (success, warning, error)
- `'selection'` - UI selection changed (picker, toggle)

### `style` <Badge type="tip" text="optional" />

Intensity of feedback (for `impact` and `selection` types):

- `'light'` - Subtle feedback
- `'medium'` - Standard feedback (default)
- `'heavy'` - Strong feedback

For `notification` type:
- `'success'` - Positive outcome
- `'warning'` - Cautionary
- `'error'` - Negative outcome

## Examples

### Button Press

```typescript
function SubmitButton({ onClick }) {
  async function handleClick() {
    await sdk.haptic({ type: 'impact', style: 'medium' });
    onClick();
  }

  return <button onClick={handleClick}>Submit</button>;
}
```

### Transaction Result

```typescript
try {
  const result = await sdk.sendTransaction({...});

  // Success haptic
  await sdk.haptic({ type: 'notification', style: 'success' });

} catch (error) {
  // Error haptic
  await sdk.haptic({ type: 'notification', style: 'error' });
}
```

### Toggle Switch

```typescript
function Toggle({ checked, onChange }) {
  async function handleToggle() {
    await sdk.haptic({ type: 'selection' });
    onChange(!checked);
  }

  return (
    <button onClick={handleToggle} className={checked ? 'on' : 'off'}>
      {checked ? 'On' : 'Off'}
    </button>
  );
}
```

### Picker Selection

```typescript
function TokenPicker({ tokens, onSelect }) {
  async function handleSelect(token) {
    await sdk.haptic({ type: 'selection' });
    onSelect(token);
  }

  return (
    <div>
      {tokens.map(token => (
        <button key={token.id} onClick={() => handleSelect(token)}>
          {token.name}
        </button>
      ))}
    </div>
  );
}
```

### Long Press

```typescript
function DeleteButton({ onDelete }) {
  async function handleLongPress() {
    await sdk.haptic({ type: 'impact', style: 'heavy' });

    const confirmed = await sdk.showConfirm(
      'Are you sure you want to delete this?'
    );

    if (confirmed) {
      onDelete();
      await sdk.haptic({ type: 'notification', style: 'success' });
    }
  }

  return (
    <button onLongPress={handleLongPress}>
      Hold to Delete
    </button>
  );
}
```

## Haptic Patterns

### Common Patterns

```typescript
// Button tap
sdk.haptic({ type: 'impact', style: 'light' });

// Important action
sdk.haptic({ type: 'impact', style: 'medium' });

// Delete/destructive action
sdk.haptic({ type: 'impact', style: 'heavy' });

// Success
sdk.haptic({ type: 'notification', style: 'success' });

// Warning
sdk.haptic({ type: 'notification', style: 'warning' });

// Error
sdk.haptic({ type: 'notification', style: 'error' });

// Picker/dropdown selection
sdk.haptic({ type: 'selection' });
```

### Transaction Flow

```typescript
async function sendTokens() {
  // Button press
  await sdk.haptic({ type: 'impact', style: 'medium' });

  try {
    // Sending...
    const result = await sdk.sendTransaction({...});

    // Success
    await sdk.haptic({ type: 'notification', style: 'success' });
    await sdk.notify({
      title: 'Success!',
      body: 'Transaction confirmed'
    });
  } catch (error) {
    // Error
    await sdk.haptic({ type: 'notification', style: 'error' });
  }
}
```

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| iOS | ✅ Full | Taptic Engine |
| Android | ✅ Full | Vibration API |

## Best Practices

::: tip USE SPARINGLY
Don't overuse haptics - they should enhance, not distract.

```typescript
// ✅ Good - meaningful actions
button.onClick = () => {
  sdk.haptic({ type: 'impact', style: 'light' });
  navigate();
};

// ❌ Bad - every UI change
div.onMouseEnter = () => {
  sdk.haptic({ type: 'impact' }); // Too much!
};
```
:::

::: tip MATCH INTENSITY
Match haptic intensity to action importance:

```typescript
// Light - minor actions
sdk.haptic({ type: 'impact', style: 'light' }); // Tap button

// Medium - standard actions
sdk.haptic({ type: 'impact', style: 'medium' }); // Submit form

// Heavy - important/destructive actions
sdk.haptic({ type: 'impact', style: 'heavy' }); // Delete item
```
:::

::: tip COMBINE WITH VISUAL FEEDBACK
Haptics should complement, not replace, visual feedback:

```typescript
async function handleSubmit() {
  setLoading(true); // Visual feedback
  await sdk.haptic({ type: 'impact' }); // Haptic feedback

  const result = await submit();

  if (result.success) {
    setSuccess(true); // Visual
    await sdk.haptic({ type: 'notification', style: 'success' }); // Haptic
  }
}
```
:::

::: warning ACCESSIBILITY
Some users may have haptics disabled. Never rely solely on haptics for critical feedback.
:::

## Error Handling

Haptics may fail silently if unsupported:

```typescript
try {
  await sdk.haptic({ type: 'impact' });
} catch (error) {
  // Haptic failed - continue anyway
  console.log('Haptic unavailable');
}
```

## Related

- [Notifications](/commands/notifications) - Alert users
- [Scan QR Code](/commands/scan-qr) - Scan with haptic feedback
