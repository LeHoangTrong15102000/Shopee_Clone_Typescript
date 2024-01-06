// / <reference types="vitest" />

import '@testing-library/jest-dom'

import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import { setupServer } from 'msw/node'
import { HttpResponse, http, rest } from 'msw'
import config from './src/constant/config'
import HTTP_STATUS_CODE from './src/constant/httpStatusCode.enum'
import matchers from '@testing-library/jest-dom/matchers'

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

expect.extend(matchers)

const loginRes = {
  message: 'Đăng nhập thành công',
  data: {
    access_token:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTA1VDE2OjA2OjM5Ljc4NVoiLCJpYXQiOjE3MDQ0NzA3OTksImV4cCI6MTcwNTQ3MDc5OH0.10E5lHBSckB8quToAsCrd-_q2JjaKcb2bLshLoFgKa8',
    expires: 999999,
    refresh_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTA1VDE2OjA2OjM5Ljc4NVoiLCJpYXQiOjE3MDQ0NzA3OTksImV4cCI6MTc5MDg3MDc5OX0.Df6Y1NheO7px2v4ZMStDXkfEcxqMEXLO98G85Apo4b8',
    expires_refresh_token: 86400000,
    user: {
      _id: '63e0f0386d7c620340850e6e',
      roles: ['User'],
      email: 'langtupro0456@gmail.com',
      createdAt: '2023-02-06T12:19:04.582Z',
      updatedAt: '2024-01-02T04:56:13.929Z',
      __v: 0,
      address: '126/13 đường 17 khu phố 5 phường Linh Trung Tp Thủ Đức',
      date_of_birth: '1990-04-27T17:00:00.000Z',
      name: 'Lê Hoàng Trọng 1',
      phone: '0773094710',
      avatar: '77d9909d-3161-4195-a67c-db4585f80e4b.jpg'
    }
  }
}

export const restHandlers = [
  rest.post(`${config.baseUrl}login`),
  (req, res, ctx) => {
    return res(ctx.status(HTTP_STATUS_CODE.Ok), ctx.json(loginRes))
  }
]

const server = setupServer(...restHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
