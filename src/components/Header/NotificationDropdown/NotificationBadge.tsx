import React from 'react'

interface Props {
  count: number
  className?: string
}

const NotificationBadge = ({ count, className = '' }: Props) => {
  if (count <= 0) return null

  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#ee4d2d] text-white text-xs 
        rounded-full flex items-center justify-center px-1 border-2 border-white font-medium ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default NotificationBadge
