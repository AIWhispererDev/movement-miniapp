# Testing the App Registry Contract

## Running Tests

The contract includes comprehensive test coverage for all new functionality.

### Prerequisites

1. Install Movement CLI
2. Navigate to the contracts directory

```bash
cd /Users/vinaypallegar/Desktop/Websites/Mobile/MoveEverything/move-contracts
```

### Run All Tests

```bash
movement move test
```

### Run Specific Test

```bash
# Test getting all active apps
movement move test --filter test_get_all_active_apps

# Test category filtering
movement move test --filter test_get_apps_by_category

# Test pagination
movement move test --filter test_get_active_apps_paginated

# Test developer apps
movement move test --filter test_get_developer_apps

# Test removal updates
movement move test --filter test_remove_app_updates_approved_list
```

### Test Coverage

✅ **test_get_all_active_apps**
- Submits 3 apps
- Approves them incrementally
- Verifies correct count at each step

✅ **test_get_apps_by_category**
- Submits apps in different categories (game, defi)
- Approves all
- Verifies category filtering returns correct apps

✅ **test_get_active_apps_paginated**
- Creates 5 approved apps
- Tests pagination with different offsets and limits
- Tests edge cases (beyond range)

✅ **test_get_developer_apps**
- Tests empty state
- Tests with pending app
- Tests with approved app
- Verifies correct developer address

✅ **test_remove_app_updates_approved_list**
- Approves 2 apps
- Removes 1
- Verifies approved list updated correctly

## Expected Output

When all tests pass, you should see:

```
Running Move unit tests
[ PASS    ] 0x1::app_registry_tests::test_get_all_active_apps
[ PASS    ] 0x1::app_registry_tests::test_get_apps_by_category
[ PASS    ] 0x1::app_registry_tests::test_get_active_apps_paginated
[ PASS    ] 0x1::app_registry_tests::test_get_developer_apps
[ PASS    ] 0x1::app_registry_tests::test_remove_app_updates_approved_list
Test result: OK. Total tests: 5; passed: 5; failed: 0
```

## Manual Testing on Testnet

After deploying to testnet, test the view functions manually:

### 1. Submit Test Apps

```bash
# Submit game app
movement move run \
  --function-id '0x...::app_registry::submit_app' \
  --args \
    address:0x... \
    string:"Test Game" \
    string:"A test game app" \
    string:"🎮" \
    string:"https://testgame.com" \
    string:"Test Dev" \
    string:"game" \
    'vector<string>:["wallet.read"]'

# Submit DeFi app
movement move run \
  --function-id '0x...::app_registry::submit_app' \
  --args \
    address:0x... \
    string:"Test DeFi" \
    string:"A test DeFi app" \
    string:"💰" \
    string:"https://testdefi.com" \
    string:"Test Dev" \
    string:"defi" \
    'vector<string>:["wallet.read","wallet.sign"]'
```

### 2. Approve Apps (as owner)

```bash
movement move run \
  --function-id '0x...::app_registry::approve_app' \
  --args \
    address:0x... \
    address:<developer_address>
```

### 3. Query Active Apps

```bash
# Get all active apps
movement move view \
  --function-id '0x...::app_registry::get_all_active_apps' \
  --args address:0x...

# Get games
movement move view \
  --function-id '0x...::app_registry::get_apps_by_category' \
  --args address:0x... string:"game"

# Get DeFi apps
movement move view \
  --function-id '0x...::app_registry::get_apps_by_category' \
  --args address:0x... string:"defi"

# Get paginated (first 5)
movement move view \
  --function-id '0x...::app_registry::get_active_apps_paginated' \
  --args address:0x... u64:0 u64:5

# Get developer's apps
movement move view \
  --function-id '0x...::app_registry::get_developer_apps' \
  --args address:0x... address:<developer_address>
```

## Testing the Publisher Page

### 1. Start Docs Dev Server

```bash
cd mini-app-examples/builders-apps-docs
npm install  # If not already done
npm run dev
```

### 2. Update Registry Address

Edit `docs/publishing/publisher.md` and update:

```javascript
const REGISTRY_ADDRESS = ref('0x...') // Your deployed testnet address
const TEST_MODE = ref(true) // Keep as true for testnet
```

### 3. Test Publisher Interface

1. Navigate to `http://localhost:5173/publishing/publisher`
2. Click "Connect Wallet" (make sure you have a testnet wallet with some MOVE tokens)
3. Test each tab:
   - **Submit App**: Fill out form and submit
   - **My Apps**: Should show your submitted apps
   - **Browse Apps**: Should show all active apps

### 4. Verify Transactions

Check that transactions appear on the testnet explorer:
- https://explorer.movementnetwork.xyz/testnet

## Troubleshooting

### Tests Fail

- Make sure you're in the correct directory
- Run `movement move clean` and try again
- Check that all dependencies are installed

### Publisher Page Not Working

- Check browser console for errors
- Verify `REGISTRY_ADDRESS` is correct
- Make sure wallet is connected to correct network (testnet/mainnet)
- Check that contract is deployed at the specified address

### View Function Returns Empty

- Verify contract is initialized
- Check that apps have been submitted and approved
- Ensure you're querying the correct registry address

## Performance Notes

- `get_all_active_apps()` - O(n) where n = number of approved apps
- `get_apps_by_category()` - O(n) where n = number of approved apps
- `get_active_apps_paginated()` - O(limit) - efficient for large registries
- `get_developer_apps()` - O(1) - very fast

For production, use pagination when displaying many apps to avoid gas limits.

## Next Steps

1. Run tests locally: `movement move test`
2. Deploy to testnet
3. Test view functions on testnet
4. Test publisher page with testnet
5. Deploy to mainnet
6. Update publisher page with mainnet address
