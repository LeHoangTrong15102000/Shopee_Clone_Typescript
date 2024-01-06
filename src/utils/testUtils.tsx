import { screen, waitFor, render, type waitForOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from 'src/App'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppProvider, getInitialAppContext } from 'src/contexts/app.context'
import { expect } from 'vitest'

// Viết các function chỉ dành cho việc test
export const delay = (time: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })

// Cái tham số thứ 2 mặc định sẽ cho nó là một cái object rỗng, và destructuring thằng `time` ra nó như này { time = 1000 } =  {}

// Hàm này dùng để debug bằng cách dùng screen.debug(cho nó hết trước một khoảng thời gian)
export const logScreen = async (
  body: HTMLElement = document.body.parentElement as HTMLElement,
  options?: waitForOptions
) => {
  const { timeout = 1000 } = options || {} // Nếu nó là undefined thì lấy `{}`
  await waitFor(
    async () => {
      // Cho no expect() trước một khoảng thời gian để dễ debug không cần phụ thuộc vào waitFor và expect() bên file test
      expect(await delay(timeout - 100)).toBe(true)
    },
    { ...options, timeout }
  )
  screen.debug(body, 99999999)
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      },
      mutations: {
        retry: false
      }
    },
    // Để khi có lỗi nó không show ra trên terminal
    logger: {
      log: console.log,
      warn: console.warn,
      // no more errors on the console - không có còn lỗi trên `terminal`
      error: () => null
    }
  })
  const Provider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return Provider
}

const Provider = createWrapper()

// Tạo lại thằng renderWithRouter để chạy trong môi trường NodeJS
export const renderWithRouter = ({ route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  const defaultValueAppContext = getInitialAppContext()
  return {
    user: userEvent.setup(),
    ...render(
      <Provider>
        <AppProvider defaultValue={defaultValueAppContext}>
          <App />
        </AppProvider>
      </Provider>,
      { wrapper: BrowserRouter }
    )
  }
}

// export const renderWithRouter = ({ route = '/' } = {}) => {
//   window.history.pushState({}, 'Test page', route)
//   return { user: userEvent.setup(), ...render(<App />, { wrapper: BrowserRouter }) }
// }
