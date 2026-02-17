import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        
        // Text colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        
        // Border colors
        'border-primary': 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        
        // Accent colors
        'accent-primary': 'var(--color-accent-primary)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-light': 'var(--color-accent-light)',
        
        // Card
        'card-bg': 'var(--color-card-bg)',
        'card-border': 'var(--color-card-border)',
        'card-hover-bg': 'var(--color-card-hover-bg)',
      },
      backgroundColor: {
        'card-bg': 'var(--color-card-bg)',
        'card-hover-bg': 'var(--color-card-hover-bg)',
      },
      textColor: {
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'accent-primary': 'var(--color-accent-primary)',
      },
      borderColor: {
        'card-border': 'var(--color-card-border)',
      },
    },
  },
  plugins: [],
};

export default config;
