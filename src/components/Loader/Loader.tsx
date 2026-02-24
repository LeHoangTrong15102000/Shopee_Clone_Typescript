const Loader = () => {
  return (
    <div className='flex min-h-[50vh] items-center justify-center bg-white dark:bg-slate-900'>
      <div className='h-8 w-8 md:h-12 md:w-12 animate-spin rounded-full border-t-2 md:border-t-4 border-solid border-[#ee4d2d] dark:border-orange-400'></div>
    </div>
  )
}

export default Loader

// const Loader = () => {
//   return (
//     <div className='flex justify-center'>
//       <span className='circle animate-loader'></span>
//       <span className='circle animation-delay-200 animate-loader'></span>
//       <span className='circle animation-delay-400 animate-loader'></span>
//     </div>
//   )
// }

// export default Loader
