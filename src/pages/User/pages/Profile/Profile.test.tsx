import { waitFor } from '@testing-library/react'
import path from 'src/constant/path'
import { access_token } from 'src/msw/auth.msw'
import { setAccessTokenToLS } from 'src/utils/auth'
import { renderWithRouter } from 'src/utils/testUtils'
import { describe, expect, it } from 'vitest'

describe('Profile', () => {
  it('Redirect to login when not authenticated', async () => {
    // Không set access token để test redirect
    const { container } = renderWithRouter({ route: path.profile })

    await waitFor(
      () => {
        // Khi không có token, app sẽ redirect về login page
        // Test xem có login form không
        const loginTitle = document.querySelector('title')?.textContent
        expect(loginTitle).toBe('Đăng nhập | Shopee Clone')

        // Hoặc kiểm tra URL đã chuyển về login
        expect(window.location.pathname).toBe('/login')
      },
      { timeout: 3000 }
    )
  })
})
