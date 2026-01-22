import type { Config } from 'tailwindcss'

/**
 * Movement Design System Colors
 * Synced with React Native app design tokens
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Movement Brand Colors
        'guild-green': {
          50: '#f2fff8',
          100: '#ccffe3',
          200: '#a7ffce',
          300: '#81ffba', // Primary brand color
          400: '#6ce2a1',
          500: '#58c589',
          600: '#47a872',
          700: '#368a5c',
          800: '#286d47',
          900: '#1b5033',
          950: '#0d2818',
        },
        'byzantine-blue': {
          50: '#c2ceff',
          100: '#859dff',
          200: '#5c7cff',
          300: '#335cff',
          400: '#0337ff',
          500: '#002cd6',
          600: '#0024ad',
          700: '#001b85',
          800: '#00135c',
          900: '#000c3d',
        },
        'protocol-pink': {
          50: '#fff1fc',
          100: '#ffc9f3',
          200: '#ffa0eb',
          300: '#ff77e2',
          400: '#eb66cf',
          500: '#ce52b4',
          600: '#b14199',
          700: '#94317f',
          800: '#762365',
          900: '#59184b',
        },
        'oracle-orange': {
          50: '#ffefec',
          100: '#ffcdc2',
          200: '#ffab97',
          300: '#ff886d',
          400: '#FF6642',
          500: '#ea5330',
          600: '#c83e1e',
          700: '#a62c10',
          800: '#841d05',
          900: '#621300',
        },
        'moveus-marigold': {
          50: '#fffbeb',
          100: '#fff2bd',
          200: '#ffea90',
          300: '#ffe162',
          400: '#ffd935',
          500: '#ddba22',
          600: '#bb9b13',
          700: '#997e08',
          800: '#776100',
          900: '#554500',
        },
        // Movement Legacy Colors (yellow/cyan theme)
        'movement-gold': '#FFD700',
        'movement-cyan': '#00E5CC',
        'movement-navy': '#0B1426',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config
