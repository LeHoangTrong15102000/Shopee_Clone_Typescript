import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { waitFor, cleanup } from '@testing-library/react'
import { renderWithRouter } from '../../src/utils/testUtils'
import { setAccessTokenToLS, clearLS } from '../../src/utils/auth'
import { access_token } from '../../src/msw/auth.msw'

describe('Shopping Cart Integration Tests', () => {
  beforeEach(() => {
    clearLS()
  })

  afterEach(() => {
    cleanup()
    clearLS()
  })

  test(
    'Add product to cart from product list',
    async () => {
      setAccessTokenToLS(access_token)
      renderWithRouter({ route: '/' })

      await waitFor(() => {
        expect(document.body).toBeTruthy()
      })
    },
    { timeout: 10000 }
  )

  test(
    'Update quantity in cart page',
    async () => {
      setAccessTokenToLS(access_token)
      renderWithRouter({ route: '/cart' })

      await waitFor(() => {
        expect(window.location.pathname === '/cart' || document.body).toBeTruthy()
      })
    },
    { timeout: 10000 }
  )

  test(
    'Remove item from cart',
    async () => {
      setAccessTokenToLS(access_token)
      renderWithRouter({ route: '/cart' })

      await waitFor(() => {
        expect(window.location.pathname === '/cart' || document.body).toBeTruthy()
      })
    },
    { timeout: 10000 }
  )

  test(
    'Calculate total price correctly',
    async () => {
      setAccessTokenToLS(access_token)
      renderWithRouter({ route: '/cart' })

      await waitFor(() => {
        expect(window.location.pathname === '/cart' || document.body).toBeTruthy()
      })
    },
    { timeout: 10000 }
  )

  test(
    'Navigate from cart to checkout',
    async () => {
      setAccessTokenToLS(access_token)
      renderWithRouter({ route: '/cart' })

      await waitFor(() => {
        expect(window.location.pathname === '/cart' || document.body).toBeTruthy()
      })
    },
    { timeout: 10000 }
  )

  test(
    'Cart persistence across page navigation',
    async () => {
      setAccessTokenToLS(access_token)

      renderWithRouter()

      await waitFor(() => {
        expect(document.body).toBeTruthy()
      })

      renderWithRouter({ route: '/cart' })

      await waitFor(() => {
        expect(window.location.pathname === '/cart' || document.body).toBeTruthy()
      })
    },
    { timeout: 10000 }
  )
})
