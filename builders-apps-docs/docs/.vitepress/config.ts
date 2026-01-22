import { defineConfig } from 'vitepress'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: 'Movement Mini Apps',
  description: 'Build blockchain apps that run natively in Movement wallet',
  base: '/',
  appearance: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#81ffba' }],
  ],

  markdown: {
    container: {
      tipLabel: 'Tip',
      warningLabel: 'Warning',
      dangerLabel: 'Danger',
      infoLabel: 'Info',
      detailsLabel: 'Details'
    },
    config(md) {
      md.use(copyOrDownloadAsMarkdownButtons)
    }
  },

  vite: {
    plugins: [
      llmstxt({
        title: 'Movement Mini Apps Documentation',
        customLLMsTxtTemplate: `# Movement Mini Apps Documentation

> AI-Optimized Documentation for Movement Mini Apps SDK
> Official SDK for building blockchain mini apps that run inside Movement wallet

{toc}

---

This documentation is optimized for LLMs and AI coding assistants. For human-readable format, visit the full documentation website.`
      })
    ],
    build: {
      target: 'esnext'
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  },

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Docs', link: '/quick-start/' },
      { text: 'Commands', link: '/commands/' },
      { text: 'Publishing', link: '/publishing/' },
      { text: 'Guidelines', link: '/guidelines/design' },
      // { text: 'AI Builder', link: '/ai-builder' },
      { text: 'GitHub', link: 'https://github.com/movementlabsxyz' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What are Mini Apps?', link: '/' },
          { text: 'Quick Start', link: '/quick-start/' },
        ]
      },
      {
        text: 'Quick Start',
        collapsed: false,
        items: [
          { text: 'Installing', link: '/quick-start/installing' },
          { text: 'Commands', link: '/quick-start/commands' },
          { text: 'Responses', link: '/quick-start/responses' },
          { text: 'Testing', link: '/quick-start/testing' },
        ]
      },
      {
        text: 'Commands',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/commands/' },
          { text: 'View Function', link: '/commands/view' },
          { text: 'Send Transaction', link: '/commands/send-transaction' },
          { text: 'Scan QR Code', link: '/commands/scan-qr' },
          { text: 'Haptic Feedback', link: '/commands/haptic' },
          { text: 'Notifications', link: '/commands/notifications' },
        ]
      },
      {
        text: 'Examples',
        collapsed: false,
        items: [
          { text: 'Next.js / React', link: '/examples/nextjs' },
          { text: 'Vanilla JavaScript', link: '/examples/vanilla' },
          { text: 'Starter App', link: '/examples/starter' },
          { text: 'Scaffold App', link: '/examples/scaffold' },
          { text: 'Social App', link: '/examples/social' },
          // { text: 'Unity', link: '/examples/unity' },
        ]
      },
      {
        text: 'Guidelines',
        collapsed: false,
        items: [
          { text: 'Design Guidelines', link: '/guidelines/design' },
        ]
      },
      {
        text: 'Technical Reference',
        collapsed: false,
        items: [
          { text: 'SDK API Reference', link: '/reference/sdk-api' },
        ]
      },
      {
        text: 'Publishing',
        collapsed: false,
        items: [
          { text: 'Publishing Guide', link: '/publishing/' },
          { text: '🚀 Publish App', link: '/publishing/publisher' },
        ]
      },
    ],

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/movementlabsxyz' },
      { icon: 'twitter', link: 'https://twitter.com/moveindustries' },
      { icon: 'discord', link: 'https://discord.gg/movementlabs' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Movement Labs'
    },

    editLink: {
      pattern: 'https://github.com/movementlabsxyz/miniapp-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
