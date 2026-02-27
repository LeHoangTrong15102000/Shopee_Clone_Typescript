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
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            // HeroUI phụ thuộc framer-motion — giữ chung chunk để tránh circular dependency
            // floating-ui và tippy tách riêng vì chỉ dùng cho Popover/Tooltip
            // HeroUI phụ thuộc framer-motion — giữ chung chunk để tránh circular dependency
            'heroui-vendor': ['@heroui/react', 'framer-motion'],
            'floating-vendor': ['@floating-ui/react', '@tippyjs/react', 'tippy.js'],
            'http-vendor': ['axios', '@tanstack/react-query'],
            'devtools-vendor': ['@tanstack/react-query-devtools'],
            'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/modifiers', '@dnd-kit/sortable', '@dnd-kit/utilities'],
            'socket-vendor': ['socket.io-client'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'router-vendor': ['react-router-dom', 'nuqs'],
            'utils-vendor': ['classnames', 'immer', 'date-fns'],
            'i18n-vendor': ['i18next', 'react-i18next'],
            'sanitize-vendor': ['dompurify', 'html-to-text'],
            'misc-vendor': ['react-helmet-async', 'react-toastify']
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
        pool: 'forks',
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
