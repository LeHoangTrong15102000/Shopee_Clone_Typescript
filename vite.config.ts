/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import os from 'os'

// Workaround cho Windows path length issues
const isWindows = os.platform() === 'win32'
const customCacheDir = isWindows ? path.join(os.tmpdir(), 'vite-cache-shopee') : 'node_modules/.vite'

// Tách riêng config cho test và production
export default defineConfig(({ mode }) => {
  const isTest = mode === 'test'

  const baseConfig = {
    plugins: [react(), visualizer()] as any,
    // Base URL cho production deployment
    base: '/',
    server: {
      port: 4000,
      host: true,
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..']
      }
    },
    preview: {
      port: 4173,
      host: true
    },
    // Tối ưu cho Windows - sử dụng temp directory
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        // Tăng buffer size cho Windows
        target: 'es2020'
      }
    },
    css: {
      devSourcemap: true
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src')
      }
    },
    // Cấu hình cache để tránh conflict trên Windows - sử dụng system temp
    cacheDir: customCacheDir,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild' as const,
      rollupOptions: {
        output: {
          // Use function-based manualChunks to ensure proper dependency ordering
          // This prevents the "Cannot read properties of undefined (reading 'createContext')" error
          // by ensuring React is always bundled with libraries that depend on it
          manualChunks(id: string) {
            // React core + libraries that directly depend on React.createContext
            // framer-motion MUST be bundled with react to avoid loading order issues
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/framer-motion/')
            ) {
              return 'react-vendor'
            }

            // UI Libraries (these also depend on React but load after react-vendor)
            if (
              id.includes('node_modules/@heroui/') ||
              id.includes('node_modules/@floating-ui/react') ||
              id.includes('node_modules/@tippyjs/react') ||
              id.includes('node_modules/tippy.js')
            ) {
              return 'ui-vendor'
            }

            // HTTP & State Management
            if (
              id.includes('node_modules/axios/') ||
              id.includes('node_modules/@tanstack/react-query')
            ) {
              return 'http-vendor'
            }

            // Form & Validation
            if (
              id.includes('node_modules/react-hook-form/') ||
              id.includes('node_modules/@hookform/resolvers') ||
              id.includes('node_modules/yup/')
            ) {
              return 'form-vendor'
            }

            // Router
            if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
              return 'router-vendor'
            }

            // Utilities (no React dependency)
            if (
              id.includes('node_modules/classnames/') ||
              id.includes('node_modules/immer/') ||
              id.includes('node_modules/query-string/')
            ) {
              return 'utils-vendor'
            }

            // i18n
            if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
              return 'i18n-vendor'
            }

            // Other utilities
            if (
              id.includes('node_modules/dompurify/') ||
              id.includes('node_modules/html-to-text/') ||
              id.includes('node_modules/react-helmet-async/') ||
              id.includes('node_modules/react-toastify/')
            ) {
              return 'misc-vendor'
            }
          }
        },
        // Tree shaking optimization - giữ side effects cho CSS và các module quan trọng
        treeshake: {
          moduleSideEffects: true
        }
      },
      chunkSizeWarningLimit: 1000
    },
    ssr: {
      noExternal: ['@tanstack/react-query']
    }
  }

  // CHỈ thêm test config khi đang trong test mode
  if (isTest) {
    return {
      ...baseConfig,
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
      }
    }
  }

  // Production build - KHÔNG có test config
  return baseConfig
})
