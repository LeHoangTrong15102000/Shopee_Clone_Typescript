/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), visualizer()] as any,
  define: {
    'process.env': process.env
  },
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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],

          // UI Libraries
          'ui-vendor': ['@heroui/react', '@floating-ui/react', '@tippyjs/react', 'tippy.js'],

          // Animation
          'animation-vendor': ['framer-motion'],

          // HTTP & State Management
          'http-vendor': ['axios', '@tanstack/react-query', '@tanstack/react-query-devtools'],

          // Form & Validation
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],

          // Router & Utils
          'router-vendor': ['react-router-dom'],
          'utils-vendor': ['classnames', 'immer', 'query-string'],

          // i18n
          'i18n-vendor': ['i18next', 'react-i18next'],

          // Other utilities
          'misc-vendor': ['dompurify', 'html-to-text', 'react-helmet-async', 'react-toastify']
        }
      },
      // Tree shaking optimization
      treeshake: {
        moduleSideEffects: false
      }
    },
    chunkSizeWarningLimit: 1000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    css: true,
    pool: 'forks',
    include: [
      'src/**/*.test.{ts,tsx}', // Unit tests
      'test/**/*.test.{ts,tsx}' // Integration & E2E tests
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/stories/**']
    }
  },
  ssr: {
    noExternal: ['@tanstack/react-query']
  }
})
