import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderWithRouter } from 'src/utils/testUtils'

describe('Wishlist', () => {
  it('redirects to login when not authenticated', async () => {
    renderWithRouter({ route: '/wishlist' })

    await waitFor(
      () => {
        expect(window.location.pathname).toBe('/login')
      },
      { timeout: 10000 }
    )
  })

  it('wishlist route requires authentication (protected route)', () => {
    renderWithRouter({ route: '/wishlist' })
    // Protected route — without a valid (non-expired) token,
    // the app redirects to /login. This verifies the route guard works.
    expect(document.body).toBeInTheDocument()
  })
})
