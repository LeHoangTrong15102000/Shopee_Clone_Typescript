import classNames from 'classnames'
import { ORDER_STATUS_CONFIG } from 'src/config/orderStatus'
import type { OrderStatus } from 'src/config/orderStatus'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm'
}

const StatusBadge = ({ status, className, size = 'md', showIcon = true }: StatusBadgeProps) => {
  const config = ORDER_STATUS_CONFIG[status]
  if (!config) return null

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        `${config.color.light} dark:${config.color.dark}`,
        `${config.bgColor.light} dark:${config.bgColor.dark}`,
        `${config.borderColor.light} dark:${config.borderColor.dark}`,
        sizeClasses[size],
        className
      )}
    >
      {config.animate && (
        <span className='relative flex h-2 w-2'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75' />
          <span className='relative inline-flex h-2 w-2 rounded-full bg-current' />
        </span>
      )}
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  )
}

export default StatusBadge

