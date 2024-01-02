/* eslint-disable import/no-unresolved */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  test: {
    environment: 'jsdom' // giúp chúng ta test những API liên quan đến trình duyệt
  },
  plugins: [react(), visualizer()] as any,
  server: {
    port: 4000
  },
  css: {
    devSourcemap: true
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src')
    }
  }
})
