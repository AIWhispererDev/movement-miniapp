# Publishing Your Mini App

Once your mini app is ready, you can publish it to the Move Everything app directory.

---

## Prerequisites

Before publishing:

- ✅ App is deployed and accessible via HTTPS URL
- ✅ All features work correctly inside Move Everything
- ✅ Icon/logo is ready (512x512px recommended)
- ✅ App has been tested on both iOS and Android

---

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Option 3: GitHub Pages

```bash
# Build your app
npm run build

# Push to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

### Option 4: Custom Server

Upload your built files to any web server with HTTPS support.

---

## App Submission

To get your app listed in Move Everything:

### 1. Prepare Your Metadata

Create a JSON file with your app details:

```json
{
  "id": "my-awesome-app",
  "name": "My Awesome App",
  "description": "A brief description of what your app does",
  "icon": "https://yourdomain.com/icon.png",
  "url": "https://yourdomain.com",
  "category": "games",
  "author": {
    "name": "Your Name",
    "wallet": "0x..."
  },
  "permissions": ["camera", "haptic", "storage"],
  "version": "1.0.0",
  "screenshots": [
    "https://yourdomain.com/screenshot1.png",
    "https://yourdomain.com/screenshot2.png"
  ]
}
```

### 2. Submit for Review

Email your app metadata to: **apps@movementlabs.xyz**

Include:
- App metadata JSON
- Brief description of your app
- Your contact information
- Any special instructions

### 3. Review Process

1. **Automated checks** - URL accessibility, icon validation
2. **Manual review** - App functionality, security, user experience
3. **Approval** - Added to the app registry
4. **Launch** - Your app goes live in Move Everything!

Review typically takes **1-3 business days**.

---

## App Categories

Choose the best category for your app:

- **games** - Games and entertainment
- **earn** - Earning opportunities and rewards
- **social** - Social and communication apps
- **collect** - Collectibles and digital assets
- **swap** - Token swaps and exchanges
- **utility** - Tools and utilities
- **other** - Other (specify your own category, max 24 characters)

---

## Permissions

Declare which SDK features your app uses:

| Permission | Description |
|------------|-------------|
| `camera` | Camera and photo access |
| `haptic` | Haptic feedback |
| `storage` | Local storage |
| `location` | GPS location |
| `biometric` | FaceID/TouchID |
| `notifications` | Push notifications |

---

## Requirements

### Security
- ✅ HTTPS only (no HTTP)
- ✅ Content Security Policy headers
- ✅ No external authentication required
- ✅ Respect rate limits

### Performance
- ✅ Load time < 3 seconds
- ✅ Mobile-optimized design
- ✅ Works on both iOS and Android

### User Experience
- ✅ Clear onboarding
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

---

## Testing Checklist

Before submitting, test your app:

- [ ] Opens correctly in Move Everything
- [ ] Wallet connects automatically
- [ ] Transactions work as expected
- [ ] All features work on iOS
- [ ] All features work on Android
- [ ] Error messages are clear
- [ ] App handles network errors
- [ ] Rate limits are respected

---

## Updating Your App

After your app is published:

1. **Make changes** to your code
2. **Deploy updates** to your hosting provider
3. **No re-submission needed** - Updates go live immediately
4. **Version updates** - Email us if you change the app ID or major features

---

## Best Practices

### App Icon
- 512x512px minimum
- PNG or JPG format
- Clear, recognizable logo
- Works on light and dark backgrounds

### Screenshots
- Show key features
- Mobile-sized (1080x1920 or similar)
- Clear, high-quality images

### Description
- Clear and concise (max 280 characters)
- Highlight key features
- Include blockchain benefits

---

## Removal Policy

Apps may be removed if they:
- Violate security guidelines
- Contain malicious code
- Mislead users
- Are abandoned/broken

---

## Support

Need help publishing?

- **Discord**: [discord.gg/movementlabs](https://discord.gg/movementlabs)
- **Email**: apps@movementlabs.xyz
- **Docs**: [docs.movementlabs.xyz](https://docs.movementlabs.xyz)

---

## Next Steps

- **[Advanced Transactions](/guides/advanced-transactions)** - Complex transaction patterns
- **[Security Guide](/guides/security)** - Best practices
- **[Examples](https://github.com/movementlabsxyz/miniapp-examples)** - Sample apps
