# Movement Mini Apps

Build decentralized apps that run natively in Movement wallet. Ship fast, reach millions.

<div class="hero-badges">
  <span class="badge">⚡️ Zero Install</span>
  <span class="badge">🔐 Built-in Wallet</span>
  <span class="badge">📱 Native APIs</span>
  <span class="badge">🚀 Instant Deploy</span>
</div>

---

## What are Movement Mini Apps?

Lightweight web applications that run inside the Move Everything super app. Build with **HTML, CSS, and JavaScript**—deploy in seconds, reach users instantly.

**No app stores. No installation. No friction.**

### Why Build Mini Apps?

<div class="feature-grid">

<div class="feature-card">
  <div class="feature-icon">⚡️</div>
  <h3>Ship Fast</h3>
  <p>Build with web tech. Deploy instantly. No app store reviews, no waiting.</p>
</div>

<div class="feature-card">
  <div class="feature-icon">👛</div>
  <h3>Built-in Wallet</h3>
  <p>Users are already connected. Accept payments and sign transactions seamlessly.</p>
</div>

<div class="feature-card">
  <div class="feature-icon">📱</div>
  <h3>Native Features</h3>
  <p>Access camera, biometrics, NFC, haptics, location, and more through simple APIs.</p>
</div>

<div class="feature-card">
  <div class="feature-icon">🌍</div>
  <h3>Global Reach</h3>
  <p>Instant distribution to millions of Movement wallet users worldwide.</p>
</div>

</div>

---

## Mini app SDK

<div class="sdk-features">

**Blockchain**
Send transactions, sign messages, read balances, multi-agent signing

**Device Features**
Camera, biometrics, NFC, haptics, location, QR scanner

**Platform APIs**
Notifications, storage, share, clipboard, deep linking

**Security**
Rate limiting, transaction validation, replay protection, CSP

</div>

---

## Get Started

<div class="get-started-steps">

<div class="step">
  <div class="step-number">1</div>
  <div class="step-content">
    <h3>Create Your App</h3>
    <p>Use our starter template or build from scratch</p>
    <code>npx create-movement-app@latest my-app</code>
  </div>
</div>

<div class="step">
  <div class="step-number">2</div>
  <div class="step-content">
    <h3>Build Your UI</h3>
    <p>Use React, vanilla JS, or Unity WebGL</p>
    <code>npm run dev</code>
  </div>
</div>

<div class="step">
  <div class="step-number">3</div>
  <div class="step-content">
    <h3>Test & Deploy</h3>
    <p>Test in Movement wallet, then deploy instantly</p>
    <code>npm run build</code>
  </div>
</div>

</div>

::: code-group

```typescript [React]
import { useMovementSDK } from '@movement-labs/miniapp-sdk';

export default function App() {
  const { sdk } = useMovementSDK();

  async function sendTokens() {
    const result = await sdk.sendTransaction({
      function: '0x1::aptos_account::transfer',
      arguments: [recipient, amount]
    });
    console.log('Sent!', result.hash);
  }

  return (
    <button onClick={sendTokens}>
      Send MOVE
    </button>
  );
}
```

```javascript [Vanilla JS]
const sdk = window.movementSDK;

async function sendTokens() {
  const result = await sdk.sendTransaction({
    function: '0x1::aptos_account::transfer',
    arguments: [recipient, amount]
  });
  console.log('Sent!', result.hash);
}
```

:::

---

## Resources

<div class="resource-grid">

<a href="/quick-start/" class="resource-card">
  <h3>📖 Documentation</h3>
  <p>Complete guides and API reference</p>
</a>

<a href="/commands/" class="resource-card">
  <h3>⚡️ Commands</h3>
  <p>All available SDK methods</p>
</a>

<a href="/guidelines/design" class="resource-card">
  <h3>🎨 Design Guidelines</h3>
  <p>Build beautiful, native-feeling UIs</p>
</a>

<a href="/llms.txt" class="resource-card">
  <h3>🤖 LLMs.txt</h3>
  <p>AI-optimized documentation index for LLMs and coding assistants. Includes table of contents and links to all documentation sections.</p>
</a>

<a href="/llms-full.txt" class="resource-card">
  <h3>📚 LLMs-full.txt</h3>
  <p>Complete documentation content in a single file. Contains all pages' full content for comprehensive AI understanding.</p>
</a>

</div>

---

## Community

<div class="community-links">

**[Discord](https://discord.gg/movementlabs)** · Get help and share ideas

**[GitHub](https://github.com/movementlabsxyz)** · Explore examples and contribute

**[Twitter](https://twitter.com/movementlabsxyz)** · Stay updated on new features

</div>

<style>
/* Hero Badges */
.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.5rem 0 2rem;
}

.hero-badges .badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--color-guild-green-400, #6ce2a1);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature-card {
  padding: 1.5rem;
  background: var(--color-neutrals-white-alpha-50, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--color-neutrals-white-alpha-100, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  transition: all 0.2s;
}

.feature-card:hover {
  background: var(--color-neutrals-white-alpha-100, rgba(255, 255, 255, 0.05));
  border-color: var(--color-guild-green-400, #6ce2a1);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.feature-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: var(--vp-c-text-1);
}

.feature-card p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

/* SDK Features */
.sdk-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.sdk-features > p {
  margin: 0;
  padding: 1.25rem;
  background: var(--color-neutrals-white-alpha-50, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--color-neutrals-white-alpha-100, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  font-size: 0.9375rem;
  line-height: 1.6;
}

.sdk-features strong {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: var(--vp-c-brand-1);
}

/* Get Started Steps */
.get-started-steps {
  display: grid;
  gap: 1.5rem;
  margin: 2rem 0;
}

.step {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--color-neutrals-white-alpha-50, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--color-neutrals-white-alpha-100, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  align-items: start;
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand-1);
  color: #000;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.125rem;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.step-content p {
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.9375rem;
}

.step-content code {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--color-neutrals-black-alpha-300, rgba(0, 0, 0, 0.3));
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
}

/* Resource Grid */
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin: 2rem 0;
}

.resource-card {
  display: block;
  padding: 1.5rem;
  background: var(--color-neutrals-white-alpha-50, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--color-neutrals-white-alpha-100, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
}

.resource-card:hover {
  background: var(--color-neutrals-white-alpha-100, rgba(255, 255, 255, 0.05));
  border-color: var(--color-guild-green-400, #6ce2a1);
  transform: translateY(-2px);
}

.resource-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: var(--vp-c-text-1);
}

.resource-card p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--vp-c-text-2);
}

/* Community Links */
.community-links {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--color-neutrals-white-alpha-50, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--color-neutrals-white-alpha-100, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  font-size: 1rem;
  line-height: 2;
}

.community-links strong a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
}

.community-links strong a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .hero-badges {
    justify-content: center;
  }

  .feature-grid,
  .sdk-features,
  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>
