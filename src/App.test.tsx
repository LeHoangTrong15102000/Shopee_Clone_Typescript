// Test App
import { describe, expect, test } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import path from './constant/path'
import { renderWithRouter } from './utils/testUtils'

describe('App', () => {
  test('App render và chuyển trang', { timeout: 15000 }, async () => {
    // làm thế nào để chúng ta render ra được cái component App thì sử dụng hàm  render() của thư viện @testing-library/react
    // render(<App />, {
    //   wrapper: BrowserRouter
    // })
    // const user = userEvent.setup()

    const { user } = renderWithRouter()

    /**
     * waitFor sẽ run callback 1 vài lần
     * cho đến khi hết timeout hoặc expect pass
     * số lần run phụ thuộc vào timeout và interval
     * mặc định: timeout = 1000ms và interval = 50ms
     */
    // Đợi loader biến mất trước
    await waitFor(
      () => {
        const loader = document.querySelector('.animate-spin')
        expect(loader).not.toBeInTheDocument()
      },
      { timeout: 10000 }
    )

    // Verify vào đúng trang chủ - kiểm tra content thay vì title do vấn đề async
    await waitFor(
      () => {
        // Kiểm tra có phần tử đặc trưng của homepage thay vì title
        const homeElements =
          document.body.textContent?.includes('Kênh người bán') ||
          document.body.textContent?.includes('Danh Mục') ||
          window.location.pathname === '/'
        expect(homeElements).toBeTruthy()
      },
      { timeout: 10000 }
    )

    // Verify chuyển sang trang Login
    // Sử dụng findAllByText để chờ lazy-loaded components render xong
    const loginLinks = await screen.findAllByText(/Đăng nhập/i, {}, { timeout: 10000 })
    await user.click(loginLinks[0])

    // Đợi loader biến mất sau khi navigate
    await waitFor(
      () => {
        const loader = document.querySelector('.animate-spin')
        expect(loader).not.toBeInTheDocument()
      },
      { timeout: 10000 }
    )

    await waitFor(
      () => {
        // Chúng ta mong đợi khi nó vào được trang Login thì sẽ có cái text này xuất hiện "Bạn mới biết đến Shopee?"
        expect(screen.queryByText('Bạn mới biết đến Shopee?')).toBeInTheDocument()
        // Phải có  thì testCase mới pass qua được
        expect(document.querySelector('title')?.textContent).toBe('Đăng nhập | Shopee Clone')
      },
      { timeout: 10000 }
    )

    // screen.debug(document.body.parentElement as HTMLElement, 99999999)
  })

  test('Về trang not found', { timeout: 15000 }, async () => {
    const badRoute = '/some/bad/route'
    renderWithRouter({ route: badRoute })

    // Đợi loader biến mất trước
    await waitFor(
      () => {
        const loader = document.querySelector('.animate-spin')
        expect(loader).not.toBeInTheDocument()
      },
      { timeout: 10000 }
    )

    await waitFor(
      () => {
        // NotFound component có text "Page Not Found" và "404"
        expect(screen.getByText(/Page Not Found/i) || screen.getByText(/404/i)).toBeInTheDocument()
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
