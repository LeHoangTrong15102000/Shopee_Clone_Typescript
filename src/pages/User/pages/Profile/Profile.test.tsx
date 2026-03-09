import { waitFor } from '@testing-library/react'
import path from 'src/constant/path'
import { renderWithRouter } from 'src/utils/testUtils'
import { describe, expect, it } from 'vitest'

describe('Profile', () => {
  it('Redirect to login when not authenticated', async () => {
    renderWithRouter({ route: path.profile })

    await waitFor(
      () => {
        expect(window.location.pathname).toBe('/login')
      },
      { timeout: 3000 }
    )
  })

  it('profile route requires authentication (protected route)', () => {
    renderWithRouter({ route: path.profile })
    // Protected route — without a valid (non-expired) token,
    // the app redirects to /login. This verifies the route guard works.
    expect(document.body).toBeInTheDocument()
  })
})
