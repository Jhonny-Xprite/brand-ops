/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--surface-canvas) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface-default) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
          subtle: 'rgb(var(--surface-subtle) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'rgb(var(--text-default) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          inverse: 'rgb(var(--text-inverse) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border-default) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },
        action: {
          primary: 'rgb(var(--action-primary) / <alpha-value>)',
          'primary-hover': 'rgb(var(--action-primary-hover) / <alpha-value>)',
          secondary: 'rgb(var(--action-secondary) / <alpha-value>)',
          'secondary-hover': 'rgb(var(--action-secondary-hover) / <alpha-value>)',
        },
        status: {
          success: 'rgb(var(--status-success) / <alpha-value>)',
          warning: 'rgb(var(--status-warning) / <alpha-value>)',
          error: 'rgb(var(--status-error) / <alpha-value>)',
          info: 'rgb(var(--status-info) / <alpha-value>)',
        },
      },
      spacing: {
        'space-1': '0.25rem',
        'space-2': '0.5rem',
        'space-3': '0.75rem',
        'space-4': '1rem',
        'space-6': '1.5rem',
        'space-8': '2rem',
        'space-12': '3rem',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
}

export default config
