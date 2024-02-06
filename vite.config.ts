/* eslint-disable import/no-unresolved */
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
  test: {
    // globals: true,
    environment: 'jsdom', // giúp chúng ta test những API liên quan đến trình duyệt
    setupFiles: path.resolve(__dirname, './vitest.setup.js')
    // setupFiles: ['./vitest.setup.js'],
    // dangerouslyIgnoreUnhandledErrors: true
    // coverageReporters: ['html', 'json', ['lcov', { projectRoot: __dirname }], 'text'],
    // reporters: 'verbose',
    // root: './tests/',
    // coverage: {
    //   enabled: true,
    //   include: ['**/src/**'],
    //   provider: 'v8'
    // }
    // reporters: [
    //   ['text', { projectRoot: '../../' }],
    //   ['json', { file: 'renamed-report.json' }]
    // ],
    // coverage: {
    //   // enabled: true,
    //   // provider: 'istanbul',
    //   clean: true,
    //   all: false, // should be true.
    //   reporter: ['html', 'json', 'lcov', 'text'],
    //   exclude: ['**/*.test.*']
    // },
    // include: ['src/**/*.test.{ts,mts}'],
    // exclude: ['content/**', 'fixtures/**', 'bin.mjs', '_snapshots_'],
    // root: path.join(__dirname, '../..'),
    // typecheck: {}
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
  }
})
