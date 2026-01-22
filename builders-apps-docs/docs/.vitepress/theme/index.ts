import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';

// Movement Design System styles
import 'movement-design-system/theme';
import './fonts.css';

import './custom.css';
import AIBuilder from './components/AIBuilder.vue';
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('AIBuilder', AIBuilder);
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons);
  }
} satisfies Theme;
