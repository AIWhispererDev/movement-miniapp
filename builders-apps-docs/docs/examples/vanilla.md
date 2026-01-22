# Vanilla JavaScript

Build Movement Mini Apps with pure JavaScript - no framework needed.

## Prerequisites

- Basic HTML, CSS, and JavaScript knowledge
- Text editor (VS Code, Sublime, etc.)
- Local development server

## Quick Start

### 1. Create Project Structure

```bash
mkdir my-miniapp
cd my-miniapp
```

Create these files:

```
my-miniapp/
  ├── index.html
  ├── style.css
  └── app.js
```

### 2. Basic HTML Setup

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Movement Mini App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Movement Mini App</h1>

        <div id="wallet-info" class="card">
            <div id="connecting">
                <p>Connecting to wallet...</p>
            </div>

            <div id="connected" style="display: none;">
                <p>Connected Wallet:</p>
                <p id="wallet-address" class="address"></p>
                <button id="send-btn" class="btn">Send Transaction</button>
            </div>

            <div id="not-connected" style="display: none;">
                <p>⚠️ This app must run inside Movement Everything</p>
            </div>
        </div>

        <div id="status" class="status"></div>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

### 3. Add Styling

`style.css`:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 600px;
    margin: 0 auto;
}

h1 {
    color: white;
    text-align: center;
    margin-bottom: 30px;
    font-size: 2rem;
}

.card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.address {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    word-break: break-all;
    background: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
    margin: 12px 0;
}

.btn {
    width: 100%;
    padding: 14px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn:hover {
    background: #5568d3;
}

.btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.status {
    background: white;
    border-radius: 16px;
    padding: 16px;
    font-size: 14px;
    display: none;
}

.status.show {
    display: block;
}

.status.success {
    background: #d4edda;
    color: #155724;
}

.status.error {
    background: #f8d7da;
    color: #721c24;
}
```

### 4. Implement SDK Integration

`app.js`:

```javascript
// Check if Movement SDK is available
function checkSDK() {
    return typeof window.movementSDK !== 'undefined';
}

// Show/hide UI elements
function showElement(id) {
    document.getElementById(id).style.display = 'block';
}

function hideElement(id) {
    document.getElementById(id).style.display = 'none';
}

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status show ${type}`;

    setTimeout(() => {
        statusEl.classList.remove('show');
    }, 5000);
}

// Initialize the app
async function init() {
    if (!checkSDK()) {
        hideElement('connecting');
        showElement('not-connected');
        return;
    }

    const sdk = window.movementSDK;

    // Check if already connected
    if (sdk.isConnected) {
        onWalletConnected(sdk.address);
    } else {
        // Try to connect
        try {
            const account = await sdk.connect();
            onWalletConnected(account.address);
        } catch (error) {
            console.error('Connection failed:', error);
            showStatus('Failed to connect wallet', 'error');
        }
    }
}

// Handle successful wallet connection
function onWalletConnected(address) {
    hideElement('connecting');
    hideElement('not-connected');
    showElement('connected');

    document.getElementById('wallet-address').textContent = address;

    // Setup button click handler
    document.getElementById('send-btn').addEventListener('click', sendTransaction);

    showStatus('Wallet connected successfully!', 'success');
}

// Send a transaction
async function sendTransaction() {
    const sdk = window.movementSDK;
    const btn = document.getElementById('send-btn');

    if (!sdk || !sdk.isConnected) {
        showStatus('Wallet not connected', 'error');
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = 'Sending...';

        // Example: Transfer 0.01 MOVE
        const result = await sdk.sendTransaction({
            function: '0x1::aptos_account::transfer',
            arguments: [
                '0xRECIPIENT_ADDRESS', // Replace with actual address
                '1000000' // 0.01 MOVE
            ],
            type_arguments: []
        });

        showStatus(`Transaction sent! Hash: ${result.hash}`, 'success');
    } catch (error) {
        console.error('Transaction error:', error);
        showStatus(`Transaction failed: ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send Transaction';
    }
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', init);
```

## Advanced Example: Token Balance Checker

```javascript
async function getBalance() {
    const sdk = window.movementSDK;

    if (!sdk || !sdk.isConnected) {
        return null;
    }

    try {
        // Get APT coin balance
        const response = await fetch(
            `https://fullnode.mainnet.movementlabs.xyz/v1/accounts/${sdk.address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::MovementCoin>`
        );

        const data = await response.json();
        const balance = parseInt(data.data.coin.value) / 100000000; // Convert from Octas

        return balance;
    } catch (error) {
        console.error('Failed to fetch balance:', error);
        return null;
    }
}

// Display balance
async function displayBalance() {
    const balance = await getBalance();

    if (balance !== null) {
        const balanceEl = document.getElementById('balance');
        balanceEl.textContent = `${balance.toFixed(4)} APT`;
    }
}
```

## Example: Simple Game with Rewards

```html
<!DOCTYPE html>
<html>
<head>
    <title>Coin Clicker</title>
    <style>
        .game {
            text-align: center;
            padding: 40px;
        }
        .coin {
            font-size: 120px;
            cursor: pointer;
            user-select: none;
        }
        .score {
            font-size: 32px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="game">
        <h1>Coin Clicker</h1>
        <p class="score">Score: <span id="score">0</span></p>
        <div class="coin" id="coin">🪙</div>
        <button id="claim-btn" style="display:none;">Claim Reward</button>
    </div>

    <script>
        let score = 0;
        const coinEl = document.getElementById('coin');
        const scoreEl = document.getElementById('score');
        const claimBtn = document.getElementById('claim-btn');

        coinEl.addEventListener('click', () => {
            score++;
            scoreEl.textContent = score;

            // Animate coin
            coinEl.style.transform = 'scale(1.2)';
            setTimeout(() => {
                coinEl.style.transform = 'scale(1)';
            }, 100);

            // Show claim button at score 100
            if (score === 100) {
                claimBtn.style.display = 'block';
            }
        });

        claimBtn.addEventListener('click', async () => {
            if (window.movementSDK && window.movementSDK.isConnected) {
                try {
                    await window.movementSDK.sendTransaction({
                        function: '0x1::aptos_account::transfer',
                        arguments: [
                            window.movementSDK.address,
                            '10000000' // 0.1 MOVE reward
                        ],
                        type_arguments: []
                    });
                    alert('Reward claimed! 0.1 MOVE sent to your wallet');
                    score = 0;
                    scoreEl.textContent = '0';
                    claimBtn.style.display = 'none';
                } catch (error) {
                    alert('Failed to claim reward: ' + error.message);
                }
            }
        });
    </script>
</body>
</html>
```

## Development

### Run Locally

Use any local server:

```bash
# Python
python3 -m http.server 3000

# Node.js
npx serve .

# PHP
php -S localhost:3000
```

### Test in Movement App

1. Open Movement Everything
2. Settings → Developer Mode → ON
3. Mini App Testing section
4. Enter `http://localhost:3000`
5. Click "Test App"

## Deployment

### Build

No build step needed! Just upload your files.

### Deploy

#### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M gh-pages
git remote add origin https://github.com/username/repo.git
git push -u origin gh-pages
```

#### Netlify
```bash
# Drag and drop your folder to netlify.com
# Or use CLI:
netlify deploy --prod
```

#### Vercel
```bash
vercel deploy
```

## Tips

1. **Keep it simple**: Vanilla JS apps load faster
2. **Mobile first**: Design for touch interactions
3. **Test offline**: Handle network errors gracefully
4. **Progressive enhancement**: Work without SDK, enhance when available

## Next Steps

- Explore the [SDK API Reference](/reference/sdk-api)
- Check out [example projects](https://github.com/movementlabsxyz/miniapp-examples)
- Join [Movement Discord](https://discord.gg/movement)
