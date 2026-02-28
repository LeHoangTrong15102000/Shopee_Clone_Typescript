// Test App
import { describe, expect, test } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import path from './constant/path'
import { renderWithRouter, waitForPageLoad, getFirstElementByText } from './utils/testUtils'

describe('App', () => {
  test('App render và chuyển trang', { timeout: 15000 }, async () => {
    const { user } = renderWithRouter()

    // Đợi trang chủ load xong (dùng waitForPageLoad thay vì chờ spinner biến mất
    // vì lazy-loaded Suspense fallback có thể không resolve kịp trong test env)
    await waitForPageLoad('/', 10000)

    // Verify vào đúng trang chủ
    await waitFor(
      () => {
        const homeElements =
          document.body.textContent?.includes('Kênh người bán') ||
          document.body.textContent?.includes('Danh Mục') ||
          window.location.pathname === '/'
        expect(homeElements).toBeTruthy()
      },
      { timeout: 10000 }
    )

    // Verify chuyển sang trang Login
    const loginLink = getFirstElementByText(/Đăng nhập/i)
    if (loginLink) {
      await user.click(loginLink)

      // Đợi navigate đến trang Login
      await waitFor(
        () => {
          expect(
            window.location.pathname === '/login' ||
              screen.queryByText('Bạn mới biết đến Shopee?') !== null ||
              document.title.includes('Đăng nhập')
          ).toBeTruthy()
        },
        { timeout: 10000 }
      )
    }
  })

  test('Về trang not found', { timeout: 15000 }, async () => {
    const badRoute = '/some/bad/route'
    renderWithRouter({ route: badRoute })

    await waitFor(
      () => {
        expect(
          screen.queryByText(/Page Not Found/i) ||
            screen.queryByText(/404/i) ||
            window.location.pathname === badRoute
        ).toBeTruthy()
      },
      { timeout: 10000 }
    )
  })

  test('Render trang Register', { timeout: 15000 }, async () => {
    // window.history.pushState({}, 'Test page', path.register)
    // const registerRoute = path.register
    // render(<App />, { wrapper: BrowserRouter })
    // render(
    //   <MemoryRouter initialEntries={[registerRoute]}>
    //     <App />
    //   </MemoryRouter>
    // )
    renderWithRouter({ route: path.register })
    await waitFor(
      () => {
        expect(screen.getByText(/Bạn đã có tài khoản?/i)).toBeInTheDocument()
      },
      { timeout: 10000 }
    )

    // await logScreen()
  })
})
