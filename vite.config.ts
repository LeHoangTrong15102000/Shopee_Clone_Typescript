/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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
    plugins: [tailwindcss(), react(), visualizer()] as any,
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core - must be in its own chunk, loaded first
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor'
            }
            // Router
            if (id.includes('node_modules/react-router') || id.includes('node_modules/nuqs')) {
              return 'router-vendor'
            }
            // HeroUI + framer-motion (keep together, they're tightly coupled)
            if (id.includes('node_modules/@heroui/') || id.includes('node_modules/framer-motion')) {
              return 'heroui-vendor'
            }
            // Forms
            if (
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform/') ||
              id.includes('node_modules/zod')
            ) {
              return 'form-vendor'
            }
            // HTTP (exclude devtools to avoid circular deps)
            if (
              id.includes('node_modules/axios') ||
              (id.includes('node_modules/@tanstack/react-query') && !id.includes('devtools'))
            ) {
              return 'http-vendor'
            }
            // DnD
            if (id.includes('node_modules/@dnd-kit/')) {
              return 'dnd-vendor'
            }
            // i18n
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
              return 'i18n-vendor'
            }
            // Utils (small, no React dependency)
            if (
              id.includes('node_modules/classnames') ||
              id.includes('node_modules/immer') ||
              id.includes('node_modules/date-fns')
            ) {
              return 'utils-vendor'
            }
            // Let everything else (floating-ui, tippy, socket.io, dompurify, html-to-text,
            // react-toastify, react-helmet-async, devtools, etc.) go into default chunks
            // This avoids circular dependencies
          }
        }
      }
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
        testTimeout: process.env.CI ? 60000 : 60000,
        hookTimeout: process.env.CI ? 60000 : 60000,
        pool: 'forks',
        // Vitest v4: poolOptions removed — use top-level options instead
        maxWorkers: process.env.CI ? 1 : 2,
        // Increase heap memory for worker processes (integration tests need ~4GB each)
        execArgv: ['--max-old-space-size=8192'],
        include: [
          'src/**/*.test.{ts,tsx}', // Unit tests
          'test/**/*.test.{ts,tsx}' // Integration & E2E tests
        ],
        reporters: ['default', 'junit'],
        outputFile: {
          junit: './test-results/junit-report.xml'
        },
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
