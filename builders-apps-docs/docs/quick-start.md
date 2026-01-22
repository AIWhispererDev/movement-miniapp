# Quick Start

Build your first mini app in 5 minutes.

## What You'll Build

A simple app that connects to the user's wallet and sends a transaction.

## Prerequisites

- Node.js 18+
- Basic HTML/JavaScript knowledge

---

## Step 1: Create Your Project

```bash
mkdir my-mini-app
cd my-mini-app
npm init -y
```

## Step 2: Create Your HTML

Create `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Mini App</title>
    <style>
        body {
            font-family: system-ui;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
        }
        button {
            background: #6366f1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
        }
        button:hover { background: #4f46e5; }
        #status { margin-top: 20px; }
    </style>
</head>
<body>
    <h1>My Mini App</h1>
    <div id="wallet"></div>
    <button onclick="sendReward()">Send 0.01 MOVE</button>
    <div id="status"></div>

    <script>
        // Check if SDK is available
        if (typeof window.movementSDK === 'undefined') {
            document.getElementById('wallet').innerHTML =
                '⚠️ Open this app inside Move Everything';
        } else {
            const sdk = window.movementSDK;

            // Show wallet address
            document.getElementById('wallet').innerHTML =
                `Connected: ${sdk.address}`;

            // Send transaction
            window.sendReward = async function() {
                try {
                    const result = await sdk.sendTransaction({
                        function: '0x1::aptos_account::transfer',
                        arguments: [sdk.address, '1000000'], // 0.01 MOVE
                        type_arguments: [],
                    });

                    document.getElementById('status').innerHTML =
                        `✅ Transaction sent!<br>Hash: ${result.hash}`;
                } catch (error) {
                    document.getElementById('status').innerHTML =
                        `❌ Error: ${error.message}`;
                }
            };
        }
    </script>
</body>
</html>
```

## Step 3: Test Locally

```bash
npx serve .
```

Open `http://localhost:3000`

## Step 4: Test in Move Everything

1. Open the **Move Everything** app
2. Go to **Settings** → Enable **Developer Mode**
3. In the **Mini App Testing** section:
   - Enter: `http://localhost:3000`
   - Click **Test App**

Your mini app will open with the wallet already connected!

---

## What Just Happened?

1. **Auto-connected** - No wallet connection flow needed
2. **`window.movementSDK`** - Available globally in Move Everything
3. **`sendTransaction`** - Prompts user approval and submits to blockchain

---

## Next Steps

### Want to use React?

```bash
npx create-next-app@latest my-app
cd my-app
npm install @movement-labs/miniapp-sdk
```

See the [Next.js Guide](/examples/nextjs) →

### Explore SDK Features

- **Camera** - Capture photos
- **Biometrics** - FaceID/TouchID auth
- **Storage** - Save data locally
- **Notifications** - Push notifications
- **Location** - GPS access

See [SDK Overview](/sdk/overview) →

### Deploy Your App

Once tested, deploy to:
- Vercel: `vercel deploy`
- Netlify: `netlify deploy`
- GitHub Pages: Push to `gh-pages` branch

Then submit your app URL for review!

---

## Troubleshooting

**SDK not found?**
- Make sure you're testing inside the Move Everything app
- Developer Mode must be enabled in Settings

**Transaction fails?**
- Check wallet has sufficient balance
- Verify the transaction function format
- See [Security Guide](/guides/security) for common issues

---

## Examples

Check out these example apps:

- **Coming Soon** - RPG Battle Game
- **Coming Soon** - Token Swap Interface
- **Coming Soon** - NFT Gallery

Browse code on [GitHub](https://github.com/movementlabsxyz/miniapp-examples)
