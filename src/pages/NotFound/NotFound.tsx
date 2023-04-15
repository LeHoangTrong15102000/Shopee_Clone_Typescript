import { Link } from 'react-router-dom'
import path from 'src/constant/path'

const NotFound = () => {
  return (
    <main className='flex h-screen w-full flex-col items-center justify-center bg-black/5'>
      <h1 className='text-9xl font-extrabold tracking-widest text-black/90'>404</h1>
      <div className='absolute rotate-12 rounded bg-[#ee4d2d] px-2 text-sm text-white'>Page Not Found</div>
      <button className='mt-5'>
        <Link
          to={path.home} // cho redirect về Home
          className='active:text-orange-500 group relative inline-block text-sm font-medium text-[#ee4d2d] focus:outline-none focus:ring'
        >
          <span className='absolute inset-0 translate-x-0.5 translate-y-0.5 bg-[#FF6A3D] transition-transform group-hover:translate-y-0 group-hover:translate-x-0' />
          <span className='relative block border border-current bg-[#ee4d2d] px-8 py-3'>
            <span className='text-white'>Go Home</span>
          </span>
        </Link>
      </button>
    </main>
  )
}

export default NotFound
