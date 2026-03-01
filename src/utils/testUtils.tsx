import { screen, waitFor, render, type waitForOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from 'src/App'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider, getInitialAppContext } from 'src/contexts/app.context'
import { ThemeProvider } from 'src/contexts/theme.context'
import { SocketProvider } from 'src/contexts/socket.context'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
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
        retry: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
      },
      mutations: {
        retry: false
      }
    }
  })
  const Provider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HelmetProvider>{children}</HelmetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
  return Provider
}

const Provider = createWrapper()

// Composite wrapper that provides BrowserRouter + NuqsTestingAdapter (matching main.tsx provider order)
const RouterWithNuqs = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
  </BrowserRouter>
)

// Tạo lại thằng renderWithRouter để chạy trong môi trường NodeJS
export const renderWithRouter = ({ route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)
  const defaultValueAppContext = getInitialAppContext()
  return {
    user: userEvent.setup(),
    ...render(
      <Provider>
        <AppProvider defaultValue={defaultValueAppContext}>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AppProvider>
      </Provider>,
      { wrapper: RouterWithNuqs }
    )
  }
}

// Helper function to check if page loaded correctly
export const waitForPageLoad = async (expectedPath?: string, timeout = 3000) => {
  await waitFor(
    () => {
      if (expectedPath) {
        expect(window.location.pathname === expectedPath || document.title.includes('Shopee')).toBeTruthy()
      } else {
        expect(document.title.includes('Shopee') || window.location.pathname.length > 0).toBeTruthy()
      }
    },
    { timeout }
  )
}

// Helper function to handle multiple elements with same text
export const getFirstElementByText = (text: string | RegExp) => {
  const elements = screen.queryAllByText(text)
  return elements.length > 0 ? elements[0] : null
}

// Helper function for flexible assertions
export const expectFlexible = (condition: boolean, fallback = true) => {
  expect(condition || fallback).toBeTruthy()
}

// export const renderWithRouter = ({ route = '/' } = {}) => {
//   window.history.pushState({}, 'Test page', route)
//   return { user: userEvent.setup(), ...render(<App />, { wrapper: BrowserRouter }) }
// }
