/// <reference types="vitest" />

import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import { setupServer } from 'msw/node'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { http, HttpResponse } from 'msw'

import authRequests from './src/msw/auth.msw'
import productRequests from './src/msw/product.msw'
import userRequests from './src/msw/user.msw'

// import { afterAll, afterEach, beforeAll, expect } from 'vitest'
// import { setupServer } from 'msw/node'
// import authRequests from './src/msw/auth.msw'
// import productRequests from './src/msw/product.msw'
// import userRequests from './src/msw/user.msw'
// import matchers from '@testing-library/jest-dom/matchers'
// expect.extend(matchers)

// const server = setupServer(...authRequests, ...productRequests, ...userRequests)

// // Start server before all tests
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// //  Close server after all tests
// afterAll(() => server.close())

// // Reset handlers after each test `important for test isolation`
// afterEach(() => server.resetHandlers())

// Simple localStorage mock implementation
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value?.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Setup localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Setup sessionStorage mock
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true
})

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
})

// Additional mock APIs for categories and other endpoints
const additionalMocks = [
  http.get('https://api-ecom.duthanhduoc.com/categories', () => {
    return HttpResponse.json({
      message: 'Lấy categories thành công',
      data: [
        { _id: '1', name: 'Điện thoại' },
        { _id: '2', name: 'Laptop' }
      ]
    })
  }),
  http.options('https://api-ecom.duthanhduoc.com/categories', () => {
    return new HttpResponse(null, { status: 200 })
  })
]

const server = setupServer(...authRequests, ...productRequests, ...userRequests, ...additionalMocks)

// Start server before all tests với warn thay vì error
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  server.resetHandlers()
  cleanup()
  // Clear localStorage after each test
  localStorage.clear()
})
