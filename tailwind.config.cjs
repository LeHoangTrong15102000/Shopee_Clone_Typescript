// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require('tailwindcss/plugin')

// disable nó ở đây để có thể biết được gì mà không có gì mà phải hông

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    container: false // xóa cái container ra khỏi tailwind
  },
  theme: {
    extend: {
      colors: {
        orange: '#ee4d2d',
        white: '#ffffff'
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
  ]
}
