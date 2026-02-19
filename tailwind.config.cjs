// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require('tailwindcss/plugin')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { heroui } = require('@heroui/react')

/**
 * Elevation System:
 * Level 0: No shadow (flat elements)
 * Level 1: shadow-sm (cards, list items)
 * Level 2: shadow-md (dropdowns, popovers)
 * Level 3: shadow-lg (modals, drawers)
 * Level 4: shadow-xl (critical overlays)
 *
 * Border Radius System:
 * Buttons/Inputs: rounded (0.25rem)
 * Cards: rounded-lg (0.5rem)
 * Modals/Drawers: rounded-xl (0.75rem)
 */

// disable nó ở đây để có thể biết được gì mà không có gì mà phải hông

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  mode: 'jit',
  // purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  corePlugins: {
    container: false // xóa cái container ra khỏi tailwind
  },
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#ee4d2d',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ee4d2d',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407'
        },
        white: '#ffffff',
        // Dark mode colors
        'dark-bg': '#1a1a2e',
        'dark-surface': '#16213e',
        'dark-text': '#e4e4e7',
        'dark-text-secondary': '#a1a1aa',
        // Semantic tokens from CSS variables
        input: {
          bg: 'rgb(var(--color-input-bg) / <alpha-value>)',
          border: 'rgb(var(--color-input-border) / <alpha-value>)',
          text: 'rgb(var(--color-input-text) / <alpha-value>)',
          placeholder: 'rgb(var(--color-input-placeholder) / <alpha-value>)'
        },
        modal: {
          bg: 'rgb(var(--color-modal-bg) / <alpha-value>)',
          overlay: 'rgb(var(--color-modal-overlay) / <alpha-value>)',
          border: 'rgb(var(--color-modal-border) / <alpha-value>)'
        },
        card: {
          bg: 'rgb(var(--color-card-bg) / <alpha-value>)',
          border: 'rgb(var(--color-card-border) / <alpha-value>)',
          hover: 'rgb(var(--color-card-hover) / <alpha-value>)'
        },
        tooltip: {
          bg: 'rgb(var(--color-tooltip-bg) / <alpha-value>)',
          text: 'rgb(var(--color-tooltip-text) / <alpha-value>)'
        },
        badge: {
          bg: 'rgb(var(--color-badge-bg) / <alpha-value>)',
          text: 'rgb(var(--color-badge-text) / <alpha-value>)'
        }
      },

      keyframes: {
        loader: {
          to: {
            opacity: 0.1,
            transform: 'translate3d(0, -1rem, 0)'
          }
        },
        'slide-top': {
          '0%': {
            '-webkit-transform': 'translateY(20px)s',
            transform: 'translateY(20px)'
          },
          '100%': {
            ' -webkit-transform': 'translateY(0px)',
            transform: 'translateY(0px)'
          }
        },
        'slide-top-sm': {
          '0%': {
            '-webkit-transform': 'translateY(6px)s',
            transform: 'translateY(6px)'
          },
          '100%': {
            ' -webkit-transform': 'translateY(0px)',
            transform: 'translateY(0px)'
          }
        },

        'slide-right': {
          '0%': {
            '-webkit-transform': 'translateX(-1000px)',
            transform: 'translateX(-1000px)'
          },
          '100%': {
            '-webkit-transform': 'translateX(0px)',
            transform: 'translateX(0px)'
          }
        },
        'bell-shake': {
          '0%, 50%, 100%': {
            transform: 'rotate(0deg)'
          },
          '10%, 30%': {
            transform: 'rotate(-10deg)'
          },
          '20%, 40%': {
            transform: 'rotate(10deg)'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      animation: {
        loader: 'loader 0.6s infinite alternate',
        'slide-top': 'slide-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'slide-top-sm': 'slide-top-sm 0.1s linear both',
        'slide-right': 'slide-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'bell-shake': 'bell-shake 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards'
      }
    }
  },
  plugins: [
    // tạo ra 1 cái container mới
    plugin(function ({ addComponents, theme }) {
      addComponents({
        '.container': {
          maxHeight: theme('columns.8xl'),
          maxWidth: theme('columns.7xl'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4')
        }
      })
    }),
    // Utility class để ẩn scrollbar
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }),
    // @tailwindcss/line-clamp đã được tích hợp mặc định từ Tailwind CSS v3.3+
    heroui()
  ],
  variants: {
    extends: {}
  }
}
