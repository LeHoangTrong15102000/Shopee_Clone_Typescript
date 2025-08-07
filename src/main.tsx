import React from 'react'
import ReactDOM from 'react-dom/client'
import App from 'src/App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './contexts/app.context'
import 'src/i18n/i18n'
import { HelmetProvider } from 'react-helmet-async'
import ErrorBoundary from './components/ErrorBoundary'

// Khi mà thằng này dùng như context thì chúng ta có thể dùng hook để lấy ra được thằng này
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // để không gọi lại APi mỗi lần focusWindow
      retry: 0 // Không cho nó retry lại, khi mà gọi Api sai thì báo lỗi 1 lần
    }
  }
})

// Thay vì export cái queryClient tại đây để sử dụng ở các component thì chúng ta có thể sử dụng hook useQueryClient để lấy ra cái queryClient

// Production error logging
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('error', (event) => {
    console.error('Production Error:', event.error)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
  })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <HelmetProvider>
            <ErrorBoundary>
              <App />
              {/* CHỈ render ReactQueryDevtools trong development */}
              {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
            </ErrorBoundary>
          </HelmetProvider>
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
