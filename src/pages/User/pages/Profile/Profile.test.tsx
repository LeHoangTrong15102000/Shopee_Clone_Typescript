import { waitFor } from '@testing-library/react'
import path from 'src/constant/path'
import { renderWithRouter } from 'src/utils/testUtils'
import { describe, expect, it } from 'vitest'

describe('Profile', () => {
  it('Redirect to login when not authenticated', async () => {
    // Không set access token để test redirect
    renderWithRouter({ route: path.profile })

    await waitFor(
      () => {
        // Khi không có token, app sẽ redirect về login page
        // Kiểm tra URL đã chuyển về login
        expect(window.location.pathname).toBe('/login')
      },
      { timeout: 3000 }
    )
  })
})
