# Movement Publishing Admin Dashboard

Admin dashboard for managing Movement mini app submissions and approvals.

## Features

- 🔐 **Wallet Authentication** - Connect with Aptos wallets (Petra, Martian, Pontem)
- 📱 **App Management** - View, approve, and reject app submissions
- 🔄 **Update Approval** - Review and approve app updates
- 📊 **Stats Dashboard** - Track total, pending, and approved apps
- 🎨 **Dark Mode** - Automatic dark mode support
- ⚡ **Real-time** - Live updates from blockchain

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure

Update `/src/lib/config.ts` with:

- **Registry Address** - Deployed app_registry contract address
- **Admin Addresses** - Wallet addresses authorized as admins
- **Network** - 'testnet' or 'mainnet'

```typescript
export const REGISTRY_ADDRESS = '0x...'; // Your deployed contract
export const ADMIN_ADDRESSES = [
  '0x...', // Admin wallet 1
  '0x...', // Admin wallet 2
];
export const NETWORK = 'testnet';
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Connect Wallet

1. Click "Connect Wallet"
2. Choose your Aptos wallet (Petra, Martian, or Pontem)
3. Approve the connection

### Review Apps

- **All Apps** - View all submitted apps
- **Pending** - Apps awaiting review (action required)
- **Approved** - Live apps in the app store
- **Rejected** - Apps that were rejected
- **Updates** - Pending app update requests

### Approve/Reject Apps

For pending apps:
1. Click "View Details" to review app information
2. Check the app URL, permissions, and metadata
3. Click "Approve" to publish the app
4. Or click "Reject" and provide a reason

### Approve Updates

When developers request updates:
1. Switch to "Updates" tab
2. Review the pending changes
3. Click "Approve Update" to apply changes

## Smart Contract Integration

The dashboard integrates with the `app_registry` smart contract:

### View Functions

- `get_app` - Fetch app metadata
- `get_stats` - Get registry statistics
- `has_pending_change` - Check for pending updates
- `check_is_owner` - Verify admin status

### Entry Functions (Admin Only)

- `approve_app` - Approve pending submission
- `reject_app` - Reject submission with reason
- `approve_update` - Approve pending update
- `update_stats` - Update app downloads/rating

## Development

### Project Structure

```
publishing-admin/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Dashboard page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── WalletProvider.tsx
│   │   ├── WalletButton.tsx
│   │   └── AppCard.tsx
│   ├── lib/              # Utilities
│   │   ├── config.ts     # Configuration
│   │   └── aptos.ts      # Aptos SDK integration
│   └── types/            # TypeScript types
│       └── app.ts        # App metadata types
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

### Adding New Admins

Update `ADMIN_ADDRESSES` in `src/lib/config.ts`:

```typescript
export const ADMIN_ADDRESSES = [
  '0x1234...', // Existing admin
  '0x5678...', // New admin
];
```

Or use the smart contract `add_owner` function for on-chain admin management.

### Testing

Test on testnet before mainnet deployment:

1. Deploy contract to testnet
2. Update `REGISTRY_ADDRESS` and set `NETWORK = 'testnet'`
3. Use testnet admin wallets
4. Test all approval workflows

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy

Deploy to Vercel, Netlify, or any Next.js hosting:

```bash
# Vercel
vercel

# Or build and deploy manually
npm run build
npm run start
```

### Environment Variables

For production, use environment variables instead of hardcoded values:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=mainnet
```

Update `src/lib/config.ts` to read from env:

```typescript
export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '0x...';
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
```

## Security

- ✅ Admin addresses are checked both client-side and on-chain
- ✅ All transactions require wallet signature
- ✅ Smart contract enforces owner-only functions
- ✅ No private keys or secrets in code
- ✅ HTTPS required for production

## Support

- **Documentation** - See [Publishing Docs](../mini-app-examples/builders-apps-docs/docs/publishing/)
- **Smart Contract** - See [app_registry.move](../move-contracts/sources/app_registry.move)
- **Issues** - Report on GitHub

## License

MIT
