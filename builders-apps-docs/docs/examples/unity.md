# Unity WebGL

Build blockchain games with Unity and deploy them as Movement Mini Apps.

## Prerequisites

- Unity 2021.3 LTS or newer
- Basic knowledge of Unity and C#
- Unity WebGL build support installed

## Setup

### 1. Create Unity Project

1. Open Unity Hub
2. Create new 3D or 2D project
3. Name it `MyMovementGame`

### 2. Install Movement SDK

Download the Movement Unity SDK:
- [MovementSDK.cs](https://github.com/movementlabsxyz/unity-sdk/blob/main/MovementSDK.cs)
- [MovementBridge.jslib](https://github.com/movementlabsxyz/unity-sdk/blob/main/MovementBridge.jslib)

Place files in your project:
```
Assets/
  Scripts/
    MovementSDK.cs
  Plugins/
    WebGL/
      MovementBridge.jslib
```

### 3. Configure WebGL Build Settings

1. **File → Build Settings**
2. Select **WebGL** platform
3. Click **Switch Platform**
4. **Player Settings**:
   - Disable **WebGL 2.0** (use WebGL 1.0 for better compatibility)
   - Set **Compression Format** to **Disabled** for testing
   - Enable **Run in Background**

## SDK Integration

### Basic Setup

Create `GameManager.cs`:

```csharp
using UnityEngine;
using UnityEngine.UI;

public class GameManager : MonoBehaviour
{
    public Text walletAddressText;
    public Text statusText;
    public Button connectButton;

    private void Start()
    {
        // Initialize Movement SDK
        MovementSDK.Instance.OnWalletConnected += HandleWalletConnected;
        MovementSDK.Instance.OnTransactionComplete += HandleTransaction;

        // Auto-connect if in Movement app
        if (MovementSDK.Instance.IsInMovementApp())
        {
            MovementSDK.Instance.Connect();
        }
    }

    private void HandleWalletConnected(string address)
    {
        walletAddressText.text = $"Wallet: {address}";
        statusText.text = "Connected!";
    }

    private void HandleTransaction(string hash)
    {
        statusText.text = $"Transaction sent: {hash}";
    }

    public void OnConnectClicked()
    {
        MovementSDK.Instance.Connect();
    }

    public void OnSendRewardClicked()
    {
        // Send 1 MOVE token as reward
        MovementSDK.Instance.SubmitTransaction(
            "0x1::aptos_account::transfer",
            new string[] { "0xRECEIVER_ADDRESS", "100000000" }, // 1 MOVE
            new string[] { }
        );
    }
}
```

### Movement SDK API

#### Connect Wallet

```csharp
MovementSDK.Instance.Connect();
```

#### Check Connection

```csharp
if (MovementSDK.Instance.IsConnected)
{
    string address = MovementSDK.Instance.WalletAddress;
    Debug.Log($"Connected: {address}");
}
```

#### Submit Transaction

```csharp
MovementSDK.Instance.SubmitTransaction(
    function: "0x1::coin::transfer",
    arguments: new string[] { recipientAddress, amount },
    typeArguments: new string[] { "0x1::aptos_coin::MovementCoin" }
);
```

#### Sign Message

```csharp
MovementSDK.Instance.SignMessage("Game High Score: 1000");
```

## Example: Racing Game with Rewards

```csharp
using UnityEngine;

public class RacingGame : MonoBehaviour
{
    public int currentScore = 0;
    public int highScore = 0;

    private bool hasClaimedReward = false;

    private void Start()
    {
        MovementSDK.Instance.OnWalletConnected += OnWalletReady;
    }

    private void OnWalletReady(string address)
    {
        Debug.Log($"Player wallet: {address}");
        LoadPlayerData();
    }

    public void OnRaceComplete(int score)
    {
        currentScore = score;

        if (score > highScore)
        {
            highScore = score;
            SaveHighScore();

            // Reward player for new high score
            if (!hasClaimedReward)
            {
                ClaimReward();
            }
        }
    }

    private void SaveHighScore()
    {
        // Sign high score on-chain for verification
        string message = $"HighScore:{highScore}:Timestamp:{System.DateTime.UtcNow}";
        MovementSDK.Instance.SignMessage(message);
    }

    private void ClaimReward()
    {
        // Send reward transaction (0.1 MOVE)
        MovementSDK.Instance.SubmitTransaction(
            "0x1::aptos_account::transfer",
            new string[] {
                MovementSDK.Instance.WalletAddress,
                "10000000" // 0.1 MOVE
            },
            new string[] { }
        );

        hasClaimedReward = true;
    }

    private void LoadPlayerData()
    {
        // Load player's previous high score from PlayerPrefs or blockchain
        highScore = PlayerPrefs.GetInt("HighScore", 0);
    }
}
```

## Building and Testing

### Build for WebGL

1. **File → Build Settings**
2. Click **Build**
3. Choose output folder: `Build/WebGL`
4. Wait for build to complete

### Test Locally

Option 1: Use Unity's built-in server (after build completes, click "Build and Run")

Option 2: Use a local server:
```bash
cd Build/WebGL
npx serve .
```

### Test in Movement Everything App

1. Open Movement Everything
2. Settings → Developer Mode → ON
3. Mini App Testing section
4. Enter your local URL (e.g., `http://localhost:3000`)
5. Click "Test App"

## Deployment

### Optimize Build

Before deploying:

1. **Player Settings → Publishing Settings**:
   - Enable **Brotli** compression
   - Set **Code Optimization** to **Runtime Speed**
   - Disable **Development Build**

2. **Build Settings**:
   - Uncheck **Development Build**
   - Check **Enable Exceptions** to **None**

### Deploy to Hosting

#### Vercel
```bash
cd Build/WebGL
vercel deploy
```

#### Netlify
```bash
cd Build/WebGL
netlify deploy --prod
```

#### GitHub Pages
```bash
# Push Build/WebGL contents to gh-pages branch
```

## Performance Tips

1. **Optimize Assets**:
   - Compress textures
   - Use asset bundles for large games
   - Reduce polygon count on models

2. **WebGL Settings**:
   - Keep builds under 50MB when possible
   - Use texture compression
   - Enable GPU instancing

3. **Mobile Optimization**:
   - Target 30-60 FPS
   - Test on mobile browsers
   - Minimize particle effects

## Example Projects

- [Movement Racer](https://github.com/movementlabsxyz/unity-racer) - Racing game with leaderboards
- [Coin Collector](https://github.com/movementlabsxyz/unity-coin-collector) - Simple arcade game

## Troubleshooting

**Build fails**: Ensure WebGL build support is installed in Unity Hub

**SDK not detected**: Check that MovementBridge.jslib is in `Assets/Plugins/WebGL/`

**Transactions fail**: Verify wallet is connected before calling SDK methods

## Next Steps

- Read the [Unity SDK API Reference](/reference/sdk-api)
- Join [Movement Discord](https://discord.gg/movement) for help
- Share your game in the community!
