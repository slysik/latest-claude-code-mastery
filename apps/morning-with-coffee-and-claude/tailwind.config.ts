import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        anthropic: {
          dark: '#141413',
          light: '#faf9f5',
          'mid-gray': '#b0aea5',
          'light-gray': '#e8e6dc',
          orange: '#d97757',
          blue: '#6a9bcc',
          green: '#788c5d',
        },
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body: ['var(--font-lora)', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        h1: ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        h2: ['1.5rem', { lineHeight: '1.35', fontWeight: '500' }],
        h3: ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        xs: ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}

export default config
