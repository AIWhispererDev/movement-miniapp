# Design Guidelines

Build beautiful, intuitive mini apps that feel native to Movement wallet using the Movement Design System.

## Design Principles

### 1. Mobile-First

Design for mobile screens from the start. Most users will never see your app on desktop.

```css
/* ✅ Good - Mobile-first approach */
.card {
  padding: 1rem;
  font-size: 16px;
}

@media (min-width: 768px) {
  .card {
    padding: 2rem;
    font-size: 18px;
  }
}

/* ❌ Bad - Desktop-first */
.card {
  padding: 2rem;
  font-size: 18px;
}

@media (max-width: 768px) {
  .card {
    padding: 1rem; /* Often forgotten */
  }
}
```

### 2. Thumb-Friendly

Design for one-handed use. Place important actions within thumb reach.

<div class="thumb-zone-diagram">
  <div class="phone-mockup">
    <div class="zone easy">Easy to reach</div>
    <div class="zone okay">Okay to reach</div>
    <div class="zone hard">Hard to reach</div>
  </div>
</div>

**Guidelines:**
- Primary actions in bottom third
- Minimum touch target: 44x44px
- Spacing between targets: 8px minimum

### 3. Fast & Responsive

Users expect instant feedback. Optimize for performance.

- **First load:** < 3 seconds
- **Subsequent loads:** < 1 second (cached)
- **Animations:** 60 FPS
- **Touch response:** < 100ms

### 4. Consistent with Movement

Match Movement wallet's design language for familiar UX. Use the Movement Design System components for consistency.

## Movement Design System

The Movement Design System provides a complete set of components, tokens, and patterns for building consistent mini apps.

### Getting Started

Install the design system:

```bash
npm install movement-design-system
# or
pnpm add movement-design-system
```

Import styles in your app:

```css
@import "movement-design-system/component-styles";
@import "movement-design-system/theme";
```

### Documentation

::: tip Design System Docs
Browse the complete [Movement Design System documentation](https://movement-design-system-docs-git-shadcn-movement-labs.vercel.app/) for:
- All available components (Card, Button, Badge, etc.)
- Component variants and props
- Interactive examples
- Theme customization
:::

**Note:** The design system docs require login to view.

### Available Components

The design system includes:
- **Layout**: Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription
- **Buttons**: Button (with variants: default, outline, ghost, link)
- **Forms**: Input, Textarea, Select, Checkbox, Radio
- **Feedback**: Badge, Alert, Toast
- **Navigation**: Tabs, Accordion
- **Display**: Avatar, Separator
- **Icons**: Comprehensive icon library

See the [design system docs](https://movement-design-system-docs-git-shadcn-movement-labs.vercel.app/) for complete component documentation.

## Color Palette

The Movement Design System provides all color tokens. Import the theme to access them:

```css
@import "movement-design-system/theme";

/* Primary brand color */
--movement-primary: #00D4AA;

/* Semantic colors */
--success: #00D4AA;
--warning: #FFB020;
--error: #FF4444;
--info: #3B82F6;
```

For complete color documentation, see the [design system theme docs](https://movement-design-system-docs-git-shadcn-movement-labs.vercel.app/?path=/story/movement-design-system-theme--colors).

## Typography

### Font Stack

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'Roboto', 'Helvetica', 'Arial', sans-serif;
}
```

### Font Sizes

```css
/* Scale */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
```

### Usage

```css
/* Body text */
body {
  font-size: var(--text-base);
  line-height: 1.5;
}

/* Headings */
h1 { font-size: var(--text-3xl); font-weight: 700; }
h2 { font-size: var(--text-2xl); font-weight: 600; }
h3 { font-size: var(--text-xl); font-weight: 600; }

/* Labels */
.label {
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Captions */
.caption {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
```

## Spacing

Use consistent spacing based on 4px grid:

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
```

### Layout Example

```tsx
<div className="card">
  <h2 className="mb-4">Send MOVE</h2>

  <div className="mb-6">
    <label className="mb-2">Recipient</label>
    <input className="p-4" />
  </div>

  <button className="py-4 px-6">Send</button>
</div>
```

## Components

Use the Movement Design System components instead of building custom ones. This ensures consistency and reduces maintenance.

### Using Design System Components

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from 'movement-design-system';

// Button with variants
<Button>Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Card components
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>

// Badge
<Badge type="success">Success</Badge>
<Badge type="warning">Warning</Badge>
```

### Component Documentation

For complete component documentation, including:
- All available props and variants
- Usage examples
- Interactive playgrounds
- Accessibility guidelines

See the [Movement Design System component docs](https://movement-design-system-docs-git-shadcn-movement-labs.vercel.app/?path=/story/movement-design-system-card--grid-layout-dots).

## Layout Patterns

### Full-Screen Card

```tsx
<div className="min-h-screen bg-[#0A0F1E] p-4">
  <div className="max-w-md mx-auto py-6">
    <div className="card">
      <h1 className="text-2xl font-bold mb-6">Send MOVE</h1>
      {/* Content */}
    </div>
  </div>
</div>
```

### List Items

```tsx
<div className="space-y-3">
  {items.map(item => (
    <div key={item.id} className="card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={item.icon} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-semibold">{item.title}</p>
          <p className="text-sm text-secondary">{item.subtitle}</p>
        </div>
      </div>
      <span className="text-primary font-bold">{item.value}</span>
    </div>
  ))}
</div>
```

### Bottom Sheet

```tsx
<div className="fixed inset-0 bg-black/60 flex items-end">
  <div className="bg-secondary w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
    <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />
    <h2 className="text-xl font-bold mb-4">Select Token</h2>
    {/* Content */}
  </div>
</div>
```

## Icons & Images

### Icon Size

```css
/* Icons */
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 24px; height: 24px; }
.icon-lg { width: 32px; height: 32px; }
.icon-xl { width: 48px; height: 48px; }

/* Token logos */
.token-icon { width: 40px; height: 40px; border-radius: 50%; }
```

### Image Optimization

```tsx
// Next.js Image
import Image from 'next/image';

<Image
  src="/token-logo.png"
  width={40}
  height={40}
  alt="MOVE"
  className="rounded-full"
/>

// Regular img
<img
  src="/token-logo.png"
  width="40"
  height="40"
  alt="MOVE"
  loading="lazy"
  className="rounded-full"
/>
```

## Animations

### Micro-interactions

```css
/* Hover lift */
.lift:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}

/* Press down */
.press:active {
  transform: scale(0.98);
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Skeleton loading */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

## Dark Mode

Movement wallet uses dark mode. Design for it from the start:

```css
/* Always use semantic colors */
:root {
  color-scheme: dark;
  --bg: #0A0F1E;
  --text: #FFFFFF;
}

/* Don't hardcode black/white */
.card {
  background: var(--bg-secondary); /* ✅ Good */
  background: #1A1F2E;             /* ❌ Bad */
}
```

## Accessibility

### Touch Targets

Minimum 44x44px for interactive elements:

```css
button, a, input[type="checkbox"] {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

### Contrast

Ensure sufficient contrast (WCAG AA):

```css
/* ✅ Good contrast */
.text-on-dark {
  color: #FFFFFF; /* 21:1 contrast on #0A0F1E */
}

/* ❌ Poor contrast */
.text-on-dark {
  color: #666666; /* 2.5:1 - fails WCAG */
}
```

### Focus States

Always show focus indicators:

```css
button:focus-visible {
  outline: 2px solid var(--movement-primary);
  outline-offset: 2px;
}
```

## Loading States

### Skeleton Screens

```tsx
function TokenSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-tertiary rounded skeleton w-24" />
        <div className="h-3 bg-tertiary rounded skeleton w-16" />
      </div>
      <div className="h-6 bg-tertiary rounded skeleton w-20" />
    </div>
  );
}
```

### Spinners

```tsx
function Spinner() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
  );
}
```

## Error States

Show clear, actionable error messages:

```tsx
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="card border-error bg-error/10 p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="font-semibold text-error">Transaction Failed</p>
          <p className="text-sm text-secondary mt-1">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="btn-ghost mt-3">
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Best Practices

::: tip CONSISTENCY
Use consistent spacing, colors, and patterns throughout your app.
:::

::: tip FEEDBACK
Provide immediate feedback for all user actions (haptics, animations, messages).
:::

::: tip PERFORMANCE
Optimize images, lazy-load content, minimize bundle size.
:::

::: warning AVOID
- Don't use pure black (#000) - use dark gray
- Don't animate expensive properties (use `transform` and `opacity`)
- Don't hide errors - show helpful messages
:::

## Resources

- **[Movement Design System Docs](https://movement-design-system-docs-git-shadcn-movement-labs.vercel.app/)** - Complete component library and documentation
- **[Design System GitHub](https://github.com/movementlabsxyz/movement-design-system)** - Source code and issues

## Examples

Check out these real mini apps that use the Movement Design System:

- **[Scaffold App](/examples/scaffold)** - Complete SDK reference implementation with design system components
- **[Social App](/examples/social)** - Social features with on-chain interactions

These examples demonstrate:
- Proper use of design system components (Card, Button, Badge)
- Consistent styling and theming
- Mobile-first responsive layouts
- Best practices for mini app design

<style>
.thumb-zone-diagram {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
}

.phone-mockup {
  width: 300px;
  height: 600px;
  border: 3px solid var(--vp-c-divider);
  border-radius: 40px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--vp-c-bg-soft);
}

.zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.zone.easy {
  background: rgba(0, 212, 170, 0.2);
  border: 2px solid rgba(0, 212, 170, 0.5);
  color: #00D4AA;
}

.zone.okay {
  background: rgba(255, 176, 32, 0.2);
  border: 2px solid rgba(255, 176, 32, 0.5);
  color: #FFB020;
}

.zone.hard {
  background: rgba(255, 68, 68, 0.2);
  border: 2px solid rgba(255, 68, 68, 0.5);
  color: #FF4444;
}
</style>
