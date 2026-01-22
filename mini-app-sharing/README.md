# Mini-App Sharing

A universal sharing service for Move Everything mini-apps. This service allows users to share content from any mini-app to social media platforms (Twitter/X, Facebook, etc.) with beautiful preview cards.

## How It Works

1. **User clicks "Share"** in a mini-app
2. **Mini-app generates share URL** with encoded data
3. **User shares the URL** on social media
4. **Platforms fetch the page** and display a preview card with OG image

## For Mini-App Developers

### Quick Start

Add a share button to your mini-app that generates a share URL pointing to this service:

```typescript
const handleShare = (content: YourContent) => {
  // 1. Create share data object
  const shareData = {
    type: 'your-content-type', // e.g., 'post', 'score', 'pnl', 'achievement'
    content: content.text, // Main text to display
    image_url: content.imageUrl || '', // Optional: pre-generated image URL
    metadata: { // Optional: additional data
      // Any custom fields your app needs
    },
  };

  // 2. Encode data as base64 JSON
  const encodedData = btoa(JSON.stringify(shareData));

  // 3. Generate share URL
  const baseUrl = 'https://mini-app-sharing.vercel.app';
  const shareUrl = `${baseUrl}/app/${yourAppId}/share?data=${encodedData}`;

  // 4. Copy to clipboard or show to user
  navigator.clipboard.writeText(shareUrl);
};
```

### Share Data Schema

The share data object follows this structure:

```typescript
interface ShareData {
  type: string;           // Required: Content type (e.g., 'post', 'score', 'pnl')
  content: string;         // Required: Main text content to display
  image_url?: string;      // Optional: URL of pre-generated image (if provided, OG image uses this)
  metadata?: {             // Optional: Additional metadata
    [key: string]: any;    // Any custom fields your app needs
  };
}
```

### Examples

#### Social App - Post Sharing

```typescript
const shareData = {
  type: 'post',
  content: 'Hello blockchain!',
  image_url: '', // Empty if no image uploaded
  metadata: {
    author: '0xabc123...',
    reactions: 5,
    timestamp: 1234567890,
  },
};
```

#### Game App - High Score Sharing

```typescript
const shareData = {
  type: 'score',
  content: 'High Score: 1,234!',
  image_url: '', // Or URL to game screenshot if you generated one
  metadata: {
    username: 'player123',
    level: 10,
    score: 1234,
    gameMode: 'hard',
  },
};
```

#### Trading App - PnL Sharing

```typescript
const shareData = {
  type: 'pnl',
  content: 'Trade Result: +$500',
  image_url: 'https://...', // URL to chart screenshot
  metadata: {
    trade_type: 'long',
    profit: 500,
    percentage: '+25%',
    timestamp: '2024-01-01',
  },
};
```

### Share URL Format

```
https://mini-app-sharing.vercel.app/app/[appId]/share?data=[base64-encoded-json]
```

**Parameters:**
- `appId`: Your mini-app ID (e.g., 'social', 'blackjack', 'trading')
- `data`: Base64-encoded JSON string of your `ShareData` object

### OG Image Generation

The sharing service automatically generates Open Graph (OG) images for social media previews:

1. **If `image_url` is provided**: Uses your provided image
2. **If `image_url` is empty**: Dynamically generates an image from your data
   - Includes gradient background
   - Displays your content text
   - Shows metadata (author, score, etc.)
   - Includes "Move Everything" branding

**OG Image Size:** 1200x630px (standard for Twitter/X, Facebook, LinkedIn)

### Implementation Checklist

- [ ] Add share button to your mini-app UI
- [ ] Implement `handleShare` function that:
  - [ ] Collects content data
  - [ ] Creates `ShareData` object with required fields
  - [ ] Encodes data as base64 JSON
  - [ ] Generates share URL
  - [ ] Copies to clipboard or shows share dialog
- [ ] Test share URL generation
- [ ] Test OG image generation (visit `/api/og/share?data=...`)
- [ ] Deploy and test with Twitter Card Validator

### Testing

#### Test Share URL Locally

1. Generate share URL in your mini-app
2. Visit the URL in your browser: `https://mini-app-sharing.vercel.app/app/[appId]/share?data=...`
3. Verify the share page displays correctly

#### Test OG Image

1. Visit the OG image API directly:
   ```
   https://mini-app-sharing.vercel.app/api/og/share?data=[your-encoded-data]
   ```
2. Should return a PNG image (1200x630px)

#### Test Twitter Preview

1. Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Paste your share URL
3. Preview how it will appear on Twitter/X

### Content Types

The `type` field determines how the OG image is styled. Current supported types:

- `post`: Social media post styling (purple/magenta gradient)
- `score`: Game/achievement styling (similar styling)
- `pnl`: Trading/financial styling
- Any other type: Generic shared content styling

You can use any `type` value - the service will generate appropriate styling.

### Best Practices

1. **Keep content concise**: OG images truncate long text (max ~3 lines)
2. **Provide image_url when possible**: For complex visuals (charts, screenshots), generate and upload images
3. **Include relevant metadata**: Helps with SEO and displays in share page
4. **Test preview cards**: Use Twitter Card Validator before launch
5. **Use meaningful types**: Choose descriptive `type` values for future styling enhancements

### FAQ

**Q: Do I need to store images anywhere?**
A: Only if you want custom visuals. The service generates OG images automatically from text content.

**Q: Can I customize the OG image styling?**
A: Currently, styling is automatic based on `type`. For full control, provide your own `image_url`.

**Q: What's the maximum size for share data?**
A: Share data is base64-encoded in the URL. Keep it reasonable (< 2KB) to avoid URL length limits.

**Q: Does sharing require blockchain/transactions?**
A: No! Sharing is purely frontend - no wallet connection or transactions needed.

**Q: Can I use this for non-blockchain content?**
A: Yes! This service works for any mini-app, blockchain or not.

### Support

For issues or questions:
- Check the example implementation in `mini-app-social`
- Review the OG image generator code: `src/app/api/og/share/route.tsx`
- Test with the share page: `src/app/app/[appId]/share/page.tsx`

## Development

### Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Deploy

Deploy to Vercel for automatic Edge Function support:

```bash
vercel
```

The OG image API requires Edge Runtime (automatically supported on Vercel).
