import { useState, useEffect } from 'react'

interface Props {
  endTime?: Date
  className?: string
}

const FlashSaleTimer = ({ endTime, className = '' }: Props) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    if (!endTime) {
      // Nếu không có endTime, tạo thời gian giả (2 giờ 15 phút 30 giây)
      setTimeLeft({ hours: 2, minutes: 15, seconds: 30 })
      return
    }

    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  return (
    <div className={`flex items-center space-x-2 text-white bg-[#ee4d2d] px-3 py-1 rounded ${className}`}>
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
          clipRule='evenodd'
        />
      </svg>
      <span className='text-sm font-medium'>Kết thúc trong</span>
      <div className='flex items-center space-x-1'>
        <span className='bg-white text-[#ee4d2d] px-1 rounded text-sm font-bold min-w-[1.5rem] text-center'>
          {formatNumber(timeLeft.hours)}
        </span>
        <span className='text-sm'>:</span>
        <span className='bg-white text-[#ee4d2d] px-1 rounded text-sm font-bold min-w-[1.5rem] text-center'>
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className='text-sm'>:</span>
        <span className='bg-white text-[#ee4d2d] px-1 rounded text-sm font-bold min-w-[1.5rem] text-center'>
          {formatNumber(timeLeft.seconds)}
        </span>
      </div>
    </div>
  )
}

export default FlashSaleTimer
