import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aagaj: {
          pink: '#FF2D8D',
          purple: '#9C27FF',
          border: '#F2F2F2',
          text: '#111827',
          subtext: '#6B7280',
          bgLight: '#FAF9FF',
        },
        // Brand colors using CSS variables
        brand: {
          primary: 'var(--brand-primary)',
          light: 'var(--brand-primary-light)',
          dark: 'var(--brand-primary-dark)',
          // Legacy support
          red: 'var(--brand-red)',
          pink: 'var(--brand-pink)',
        },
        // Success colors (Green)
        success: {
          50: 'var(--success-50)',
          100: 'var(--success-100)',
          200: 'var(--success-200)',
          300: 'var(--success-300)',
          400: 'var(--success-400)',
          500: 'var(--success-500)',
          600: 'var(--success-600)',
          700: 'var(--success-700)',
          800: 'var(--success-800)',
          900: 'var(--success-900)',
        },
        // Warning colors (Yellow)
        warning: {
          50: 'var(--warning-50)',
          100: 'var(--warning-100)',
          200: 'var(--warning-200)',
          300: 'var(--warning-300)',
          400: 'var(--warning-400)',
          500: 'var(--warning-500)',
          600: 'var(--warning-600)',
          700: 'var(--warning-700)',
          800: 'var(--warning-800)',
          900: 'var(--warning-900)',
        },
        // Danger colors (Red)
        danger: {
          50: 'var(--danger-50)',
          100: 'var(--danger-100)',
          200: 'var(--danger-200)',
          300: 'var(--danger-300)',
          400: 'var(--danger-400)',
          500: 'var(--danger-500)',
          600: 'var(--danger-600)',
          700: 'var(--danger-700)',
          800: 'var(--danger-800)',
          900: 'var(--danger-900)',
        },
        // Info colors (Blue)
        info: {
          50: 'var(--info-50)',
          100: 'var(--info-100)',
          200: 'var(--info-200)',
          300: 'var(--info-300)',
          400: 'var(--info-400)',
          500: 'var(--info-500)',
          600: 'var(--info-600)',
          700: 'var(--info-700)',
          800: 'var(--info-800)',
          900: 'var(--info-900)',
        },
        // Progress colors (Orange)
        progress: {
          50: 'var(--progress-50)',
          100: 'var(--progress-100)',
          200: 'var(--progress-200)',
          300: 'var(--progress-300)',
          400: 'var(--progress-400)',
          500: 'var(--progress-500)',
          600: 'var(--progress-600)',
          700: 'var(--progress-700)',
          800: 'var(--progress-800)',
          900: 'var(--progress-900)',
        },
      },
      backgroundColor: {
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'tertiary': 'var(--bg-tertiary)',
        'dark': 'var(--bg-dark)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'tertiary': 'var(--text-tertiary)',
        'light': 'var(--text-light)',
        'brand': 'var(--text-brand)',
      },
      borderColor: {
        'light': 'var(--border-light)',
        'medium': 'var(--border-medium)',
        'dark': 'var(--border-dark)',
        'brand': 'var(--border-brand)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 30s) linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
