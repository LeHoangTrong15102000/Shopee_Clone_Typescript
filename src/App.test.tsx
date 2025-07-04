// Test App
import { describe, expect, test } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import path from './constant/path'
import { logScreen, renderWithRouter } from './utils/testUtils'

describe('App', () => {
  test('App render và chuyển trang', async () => {
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
    // Verify vào đúng trang chủ
    await waitFor(() => {
      expect(document.querySelector('title')?.textContent).toBe('Trang chủ | Shopee Clone')
    })

    // Verify chuyển sang trang Login
    await user.click(screen.getByText(/Đăng nhập/i))
    await waitFor(() => {
      // Chúng ta mong đợi khi nó vào được trang Login thì sẽ có cái text này xuất hiện "Bạn mới biết đến Shopee?"
      expect(screen.queryByText('Bạn mới biết đến Shopee?')).toBeInTheDocument()
      // Phải có  thì testCase mới pass qua được
      expect(document.querySelector('title')?.textContent).toBe('Đăng nhập | Shopee Clone')
    })

    // screen.debug(document.body.parentElement as HTMLElement, 99999999)
  })

  test('Về trang not found', async () => {
    const badRoute = '/some/bad/route'
    // render(
    //   <MemoryRouter initialEntries={[badRoute]}>
    //     <App />
    //   </MemoryRouter>
    // )
    renderWithRouter({ route: badRoute })
    await waitFor(() => {
      expect(screen.getByText(/page not found/i)).toBeInTheDocument()
      // expect()
    })
    // await logScreen()

    // Còn muốn log screen nhanh thì ->  `screen.debug()` thôi -> Do thằng này trả kết quả nhanh quá nên đôi khi những thằng khác không `render` ra kịp (đôi khi timeout cũng chưa chạy hết)
    // Còn khi muốn `await` một tí để debug cái `terminal` thì dùng hàm `logScreen`
    // screen.debug(document.body.parentElement as HTMLElement, 99999999)
  })

  test('Render trang Register', async () => {
    // window.history.pushState({}, 'Test page', path.register)
    // const registerRoute = path.register
    // render(<App />, { wrapper: BrowserRouter })
    // render(
    //   <MemoryRouter initialEntries={[registerRoute]}>
    //     <App />
    //   </MemoryRouter>
    // )
    renderWithRouter({ route: path.register })
    await waitFor(() => {
      expect(screen.getByText(/Bạn đã có tài khoản?/i)).toBeInTheDocument()
    })

    // await logScreen()
  })
})
