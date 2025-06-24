// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require('tailwindcss/plugin')

// disable nó ở đây để có thể biết được gì mà không có gì mà phải hông

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  // purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    container: false // xóa cái container ra khỏi tailwind
  },
  theme: {
    extend: {
      colors: {
        orange: '#ee4d2d',
        white: '#ffffff'
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
        }
      },
      animation: {
        loader: 'loader 0.6s infinite alternate',
        'slide-top': 'slide-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'slide-top-sm': 'slide-top-sm 0.1s linear both',
        'slide-right': 'slide-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'bell-shake': 'bell-shake 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards'
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
    require('@tailwindcss/line-clamp')
  ],
  variants: {
    extends: {}
  }
}
