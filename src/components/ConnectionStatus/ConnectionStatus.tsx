import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import useSocket from 'src/hooks/useSocket'

export default function ConnectionStatus() {
  const { isAuthenticated } = useContext(AppContext)
  const { connectionStatus, connect } = useSocket()

  if (!isAuthenticated) {
    return null
  }

  if (connectionStatus === 'connected') {
    return null
  }

  if (connectionStatus === 'connecting') {
    return (
      <div className='fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-yellow-100 py-2 text-sm text-yellow-800'>
        <span className='relative flex h-3 w-3'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75'></span>
          <span className='relative inline-flex h-3 w-3 rounded-full bg-yellow-500'></span>
        </span>
        <span>Đang kết nối...</span>
      </div>
    )
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className='fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-red-100 py-2 text-sm text-red-800'>
        <span className='relative flex h-3 w-3'>
          <span className='relative inline-flex h-3 w-3 rounded-full bg-red-500'></span>
        </span>
        <span>Mất kết nối</span>
        <button
          onClick={() => connect()}
          className='ml-2 rounded bg-red-500 px-3 py-1 text-xs text-white transition-colors hover:bg-red-600'
        >
          Kết nối lại
        </button>
      </div>
    )
  }

  if (connectionStatus === 'error') {
    return (
      <div className='fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-red-100 py-2 text-sm text-red-800'>
        <span className='relative flex h-3 w-3'>
          <span className='relative inline-flex h-3 w-3 rounded-full bg-red-500'></span>
        </span>
        <span>Lỗi kết nối</span>
        <button
          onClick={() => connect()}
          className='ml-2 rounded bg-red-500 px-3 py-1 text-xs text-white transition-colors hover:bg-red-600'
        >
          Thử lại
        </button>
      </div>
    )
  }

  return null
}

