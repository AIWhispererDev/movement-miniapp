# View Function

Call read-only Move view functions to fetch on-chain data. View calls are gasless and do not require a connected wallet.

## Basic Usage

```typescript
const result = await sdk.view({
  function: '0x1::some_module::some_view',
  function_arguments: [],
  type_arguments: []
});
```

## Parameters

### `function` <Badge type="danger" text="required" />

Fully qualified function name: `address::module::function`

```typescript
function: '0xabc::leaderboard::get_leaderboard'
```

### `function_arguments` <Badge type="danger" text="required" />

Array of function arguments. Use strings for u64 and other large numeric types.

```typescript
function_arguments: [
  '50' // u64 as string
]
```

### `type_arguments` <Badge type="tip" text="optional" />

Generic type arguments.

```typescript
type_arguments: ['0x1::aptos_coin::AptosCoin']
```

## Return Value

Returns a `Promise<any>` with the decoded result from the Move view function:

```typescript
// Result can be:
// - A primitive (number-like string, bool, address string)
// - An object (struct with named fields)
// - An array (vector<T>) – sometimes wrapped like [[...]]
```

## Examples

### Top 50 Leaderboard

```typescript
const result = await sdk.view({
  function: '0xabc::leaderboard::get_leaderboard',
  function_arguments: ['50'],
  type_arguments: []
});

// Handle wrapped arrays
const entries = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
```

### Read a Struct

```typescript
const postRes = await sdk.view({
  function: '0xsocial::social::get_post',
  function_arguments: [owner, `${index}`],
  type_arguments: []
});

// Unwrap if needed
const post = Array.isArray(postRes) ? postRes[0] : postRes;
console.log(post.author, post.content);
```

### Read a Single Value

```typescript
const feeRes = await sdk.view({
  function: '0xabc::leaderboard::get_game_fee',
  function_arguments: [],
  type_arguments: []
});

const feeOctas = Array.isArray(feeRes) ? feeRes[0] : feeRes;
const feeMove = Number(feeOctas) / 100_000_000;
```

## Error Handling

Always wrap view calls in try-catch:

```typescript
try {
  const data = await sdk.view({
    function: '0xabc::leaderboard::get_leaderboard',
    function_arguments: ['50'],
    type_arguments: []
  });
  
  // Use data
  console.log('Leaderboard:', data);
} catch (error) {
  if (error.code === 'FUNCTION_NOT_FOUND') {
    console.error('View function does not exist');
  } else if (error.code === 'INVALID_ARGUMENTS') {
    console.error('Invalid function arguments');
  } else {
    console.error('View failed:', error.message);
  }
}
```

## Best Practices

::: tip NO WALLET REQUIRED
You can call `view()` before a user connects their wallet. Great for loading public data in splash screens.
:::

::: tip STRINGS FOR NUMBERS
Always pass large integers as strings to avoid precision loss in JS.

```typescript
// ✅ Good
function_arguments: ['100000000']

// ❌ Bad - may lose precision
function_arguments: [100000000]
```
:::

::: tip UNWRAP RESULTS
The host app may wrap results in an extra array. Handle both `result` and `[result]` shapes.

```typescript
// Safely unwrap possibly-wrapped arrays
const unwrap = (val: any) => 
  Array.isArray(val) && val.length === 1 && Array.isArray(val[0]) 
    ? val[0] 
    : val;

const entries = unwrap(result);
```
:::

::: tip CAMEL CASE COMPAT
Some hosts also accept `functionArguments` and `typeArguments` (camelCase). Prefer snake_case for consistency.
:::

## Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `FUNCTION_NOT_FOUND` | View function does not exist | Check function name and module address |
| `INVALID_ARGUMENTS` | Arguments don't match function signature | Verify argument types and count |
| `NETWORK_ERROR` | Connection issue | Retry with exponential backoff |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait before retrying |

## Related

- [Send Transaction](./send-transaction.md) – write functions that modify state
- [SDK API Reference](../reference/sdk-api.md) – complete API documentation
