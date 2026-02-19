import { Component, ErrorInfo, ReactNode } from 'react'
import path from 'src/constant/path'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  // Khi mà có lỗi gì thì nó sẽ nhảy vào đây
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error('Uncaught error: ', error, errorInfo)
  }

  // UI dự phòng khi mà cái App chúng ta nó bị lỗi
  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <main className='flex h-screen w-full flex-col items-center justify-center bg-black/5'>
          <h1 className='text-6xl sm:text-9xl font-extrabold tracking-widest text-black/90'>500</h1>
          <div className='absolute rotate-12 rounded bg-orange px-2 text-sm text-white'>Error!</div>
          {/* Hiển thị chi tiết lỗi trong development mode */}
          {import.meta.env.DEV && this.state.error && (
            <div className='mt-4 max-w-2xl rounded bg-red-50 p-4 text-left'>
              <p className='text-sm font-bold text-red-700'>{this.state.error.message}</p>
              <pre className='mt-2 max-h-40 overflow-auto text-xs text-red-600 whitespace-pre-wrap'>
                {this.state.error.stack}
              </pre>
            </div>
          )}
          <button className='mt-5'>
            <a
              href={path.home} // cho redirect về Home
              className='active:text-orange-500 group relative inline-block text-sm font-medium text-orange focus:outline-none focus:ring'
            >
              <span className='absolute inset-0 translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] transition-transform group-hover:translate-y-0 group-hover:translate-x-0' />
              <span className='relative block border border-current bg-orange px-8 py-3'>
                <span className='text-white'>Go Home</span>
              </span>
            </a>
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
