# Testing

Test your mini app locally before deploying to production.

## Overview

Testing mini apps requires running them inside the Movement wallet app, since the SDK is only available in that environment. This guide covers local testing, tunneling, and debugging.

## Quick Setup

1. **Start your dev server**
2. **Expose it to your network**
3. **Open in Movement app**

Let's go through each step:

## 1. Start Development Server

Start your local development server:

::: code-group

```bash [Next.js]
npm run dev
# Running on http://localhost:3000
```

```bash [Vanilla]
npx serve .
# Running on http://localhost:3000
```

```bash [Unity]
# Build for WebGL in Unity
# Then serve the build folder:
npx serve ./build
```

:::

## 2. Enable Developer Mode

In the Movement app:

1. Open **Settings**
2. Scroll to **Developer Options**
3. Toggle **Developer Mode** ON
4. You'll see **Mini App Testing** section appear

## 3. Access Your App

You have three options to access your local app from your phone:

### Option A: Network URL (Same WiFi)

If your phone and computer are on the **same WiFi network**:

1. Find your computer's local IP:

::: code-group

```bash [macOS/Linux]
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for something like: 192.168.1.x
```

```bash [Windows]
ipconfig
# Look for IPv4 Address under your WiFi adapter
```

:::

2. In Movement app → **Mini App Testing**, enter:
   ```
   http://192.168.1.x:3000
   ```

3. Tap **Launch App**

### Option B: Tunneling (Recommended)

Use a tunnel service to expose your local server to the internet:

#### ngrok (Most Popular)

```bash
# Install
npm install -g ngrok

# Create tunnel
ngrok http 3000
```

You'll get a URL like:
```
https://abc123.ngrok.io
```

Enter this in Movement app → **Mini App Testing** → **Launch App**

::: tip NGROK ADVANTAGES
- Works from anywhere (no WiFi required)
- HTTPS by default (secure)
- Free tier available
- Persistent URLs with paid plan
:::

#### Cloudflare Tunnel (Free, No Signup)

```bash
# Install
npm install -g cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

#### LocalTunnel (Simple Alternative)

```bash
npx localtunnel --port 3000
```

### Option C: QR Code

Generate a QR code for quick access:

```bash
# Install qrcode-terminal
npm install -g qrcode-terminal

# Generate QR code
qrcode-terminal "http://192.168.1.x:3000"
```

Scan the QR code with your phone's camera, then open in Movement app.

### Option D: Staging Deployment

Deploy to a staging environment for persistent HTTPS URLs:

#### Vercel (Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or deploy with production build
vercel --prod
```

You'll get a URL like:
```
https://your-app.vercel.app
```

Enter this in Movement app → **Mini App Testing** → **Launch App**

::: tip STAGING ADVANTAGES
- ✅ Permanent HTTPS URL (no expiration)
- ✅ Works from anywhere
- ✅ Share with team members
- ✅ Production-like environment
- ✅ Free tier available
- ✅ Automatic deployments on git push
- ✅ Preview deployments for PRs
:::

#### Other Options

- **Netlify**: `npm install -g netlify-cli && netlify deploy`
- **Railway**: Connect GitHub repo for auto-deploy
- **Render**: Connect GitHub repo for auto-deploy

All provide free HTTPS staging URLs perfect for testing.

## Testing Workflow

### Basic Workflow

1. **Make changes** to your code
2. **Save** - dev server auto-reloads
3. **Refresh** mini app in Movement wallet
   - Pull down to refresh
   - Or tap the reload button

### Advanced Workflow

Use hot module replacement for instant updates:

```javascript
// vite.config.js or next.config.js
export default {
  server: {
    hmr: {
      host: '192.168.1.x', // Your local IP
      port: 3000
    }
  }
}
```

Now changes appear instantly without manual refresh!

## Debugging

### Browser DevTools (Desktop)

For Next.js apps, you can debug in desktop browser first:

```bash
npm run dev
# Open http://localhost:3000 in Chrome
```

Use Chrome DevTools to:
- Inspect console logs
- Debug JavaScript
- Test UI responsive modes
- Profile performance

::: warning SDK NOT AVAILABLE
`window.movementSDK` will be `undefined` in desktop browser. Use SDK detection:

```typescript
if (!window.movementSDK) {
  // Mock SDK for desktop testing
  window.movementSDK = {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    isInstalled: () => true,
    sendTransaction: async (payload) => {
      console.log('Mock transaction:', payload);
      return { hash: '0x123...', success: true };
    }
  };
}
```
:::

### Mobile DevTools (Eruda)

Add Eruda for mobile debugging:

```html
<!-- Add to your HTML head -->
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

Now shake your device or tap the Eruda icon to open mobile DevTools!

Features:
- ✅ Console logs
- ✅ Network requests
- ✅ Local storage inspection
- ✅ DOM inspector
- ✅ Source code viewer

### React DevTools

For React apps, add React DevTools:

```bash
npm install --save-dev @react-devtools/core

# Start standalone DevTools
npx react-devtools
```

Then in your app:

```javascript
// Only in development
if (process.env.NODE_ENV === 'development') {
  import('@react-devtools/core').then(({ connectToDevTools }) => {
    connectToDevTools();
  });
}
```

### Console Logging

Add detailed logs for debugging:

```typescript
// Development logging utility
const log = {
  info: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[INFO]', new Date().toISOString(), ...args);
    }
  },

  error: (...args) => {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  },

  transaction: (payload) => {
    console.log('[TX]', {
      function: payload.function,
      args: payload.arguments,
      timestamp: new Date().toISOString()
    });
  }
};

// Usage
log.info('App initialized');
log.transaction(txPayload);
```

## Testing Checklist

Before deploying, verify:

### Functionality
- [ ] App loads without errors
- [ ] SDK is detected correctly
- [ ] Wallet connection works
- [ ] Transactions can be sent
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] Success feedback is clear

### Performance
- [ ] Loads in < 3 seconds
- [ ] No console errors
- [ ] Images are optimized
- [ ] No memory leaks
- [ ] Smooth animations

### Compatibility
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Portrait mode works
- [ ] Landscape mode works (if applicable)
- [ ] Dark mode supported
- [ ] All screen sizes (iPhone SE to iPad)

### User Experience
- [ ] Clear error messages
- [ ] Intuitive navigation
- [ ] Responsive touch targets (min 44x44px)
- [ ] Appropriate haptic feedback
- [ ] Proper loading indicators

## Common Issues

### SDK is undefined

**Problem:** `window.movementSDK` is undefined

**Solutions:**
- ✅ Ensure you're testing in Movement app
- ✅ Check Developer Mode is enabled
- ✅ Try refreshing the mini app
- ✅ Check console for errors

### Can't connect from phone

**Problem:** Can't access `http://192.168.1.x:3000`

**Solutions:**
- ✅ Ensure phone and computer on same WiFi
- ✅ Check firewall isn't blocking port 3000
- ✅ Use `0.0.0.0` instead of `localhost`:
  ```bash
  npm run dev -- --host 0.0.0.0
  ```
- ✅ Try tunneling instead (ngrok)

### App not refreshing

**Problem:** Changes don't appear after refresh

**Solutions:**
- ✅ Hard refresh: Pull down and release
- ✅ Clear cache in Settings → Developer → Clear Cache
- ✅ Restart dev server
- ✅ Check HMR configuration

### Slow loading

**Problem:** App takes >5 seconds to load

**Solutions:**
- ✅ Optimize images (use Next.js Image)
- ✅ Enable code splitting
- ✅ Reduce bundle size
- ✅ Use production build for testing:
  ```bash
  npm run build
  npm run start
  ```

### Transactions failing

**Problem:** All transactions fail in testing

**Solutions:**
- ✅ Check you're on testnet, not mainnet
- ✅ Ensure wallet has testnet MOVE
- ✅ Verify transaction payload format
- ✅ Check console for specific error codes

## Environment Configuration

### Development vs Production

Use environment variables:

```bash
# .env.local (development)
NEXT_PUBLIC_MOVEMENT_NETWORK=testnet
NEXT_PUBLIC_API_URL=https://testnet-api.movement.xyz
NEXT_PUBLIC_DEBUG=true

# .env.production
NEXT_PUBLIC_MOVEMENT_NETWORK=mainnet
NEXT_PUBLIC_API_URL=https://api.movement.xyz
NEXT_PUBLIC_DEBUG=false
```

Access in code:

```typescript
const network = process.env.NEXT_PUBLIC_MOVEMENT_NETWORK;
const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';

if (isDebug) {
  console.log('Debug mode enabled');
}
```

### Testing on Testnet

Always test on testnet first:

```typescript
const sdk = window.movementSDK;

// Check network
if (sdk.network === 'mainnet') {
  console.warn('⚠️ Running on MAINNET');
} else {
  console.log('✅ Running on testnet');
}

// Get testnet MOVE
// Visit: https://faucet.movement.xyz
```

## Automated Testing

### Unit Tests (Jest)

```typescript
// hooks/__tests__/useMovementSDK.test.ts
import { renderHook } from '@testing-library/react';
import { useMovementSDK } from '../useMovementSDK';

// Mock SDK
global.window.movementSDK = {
  isInstalled: () => true,
  address: '0x123...',
  sendTransaction: jest.fn()
};

test('should return SDK instance', () => {
  const { result } = renderHook(() => useMovementSDK());
  expect(result.current.sdk).toBeDefined();
  expect(result.current.isConnected).toBe(true);
});
```

### Integration Tests (Playwright)

```typescript
// tests/app.spec.ts
import { test, expect } from '@playwright/test';

test('should connect wallet', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const address = await page.locator('[data-testid="wallet-address"]');
  await expect(address).toBeVisible();
  await expect(address).toContainText('0x');
});
```

## Next Steps

- **[Responses →](/quick-start/responses)** - Handle test results
- **[Design Guidelines →](/guidelines/design)** - Polish your UI
- **Publishing** *(Coming Soon)* - Deploy your app

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Create tunnel | `ngrok http 3000` |
| Deploy to staging | `vercel` |
| Find local IP | `ifconfig \| grep "inet "` |
| Generate QR code | `qrcode-terminal "http://..."` |
| Mobile DevTools | Add Eruda script tag |
| Check SDK | `window.movementSDK.isInstalled()` |
