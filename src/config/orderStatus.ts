/**
 * Centralized order status configuration
 * Single source of truth for all order status labels, colors, icons, and animation flags
 */

export type { OrderStatus } from 'src/types/orderTracking.type'
import type { OrderStatus } from 'src/types/orderTracking.type'

export interface OrderStatusConfig {
  label: string
  color: {
    light: string
    dark: string
  }
  bgColor: {
    light: string
    dark: string
  }
  borderColor: {
    light: string
    dark: string
  }
  icon: string
  animate?: boolean
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  pending: {
    label: 'Chờ xác nhận',
    color: { light: 'text-amber-700', dark: 'text-amber-300' },
    bgColor: { light: 'bg-amber-50', dark: 'bg-amber-900/30' },
    borderColor: { light: 'border-amber-200', dark: 'border-amber-700/50' },
    icon: '⏳',
    animate: true
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: { light: 'text-blue-700', dark: 'text-blue-300' },
    bgColor: { light: 'bg-blue-50', dark: 'bg-blue-900/30' },
    borderColor: { light: 'border-blue-200', dark: 'border-blue-700/50' },
    icon: '✓'
  },
  processing: {
    label: 'Đang xử lý',
    color: { light: 'text-blue-700', dark: 'text-blue-300' },
    bgColor: { light: 'bg-blue-50', dark: 'bg-blue-900/30' },
    borderColor: { light: 'border-blue-200', dark: 'border-blue-700/50' },
    icon: '⟳',
    animate: true
  },
  shipped: {
    label: 'Đã giao cho ĐVVC',
    color: { light: 'text-orange-700', dark: 'text-orange-300' },
    bgColor: { light: 'bg-orange-50', dark: 'bg-orange-900/30' },
    borderColor: { light: 'border-orange-200', dark: 'border-orange-700/50' },
    icon: '↗'
  },
  in_transit: {
    label: 'Đang vận chuyển',
    color: { light: 'text-blue-600', dark: 'text-blue-400' },
    bgColor: { light: 'bg-blue-50', dark: 'bg-blue-900/30' },
    borderColor: { light: 'border-blue-200', dark: 'border-blue-700/50' },
    icon: '➤',
    animate: true
  },
  out_for_delivery: {
    label: 'Đang giao hàng',
    color: { light: 'text-orange-600', dark: 'text-orange-400' },
    bgColor: { light: 'bg-orange-50', dark: 'bg-orange-900/30' },
    borderColor: { light: 'border-orange-200', dark: 'border-orange-700/50' },
    icon: '⚡',
    animate: true
  },
  delivered: {
    label: 'Đã giao',
    color: { light: 'text-green-700', dark: 'text-green-300' },
    bgColor: { light: 'bg-green-50', dark: 'bg-green-900/30' },
    borderColor: { light: 'border-green-200', dark: 'border-green-700/50' },
    icon: '✓'
  },
  cancelled: {
    label: 'Đã hủy',
    color: { light: 'text-red-700', dark: 'text-red-300' },
    bgColor: { light: 'bg-red-50', dark: 'bg-red-900/30' },
    borderColor: { light: 'border-red-200', dark: 'border-red-700/50' },
    icon: '✕'
  },
  returned: {
    label: 'Đã trả hàng',
    color: { light: 'text-gray-700', dark: 'text-gray-300' },
    bgColor: { light: 'bg-gray-50', dark: 'bg-gray-900/30' },
    borderColor: { light: 'border-gray-200', dark: 'border-gray-700/50' },
    icon: '↩'
  }
}

export const getStatusLabel = (status: OrderStatus): string =>
  ORDER_STATUS_CONFIG[status]?.label ?? status

export const getStatusClasses = (status: OrderStatus): string => {
  const config = ORDER_STATUS_CONFIG[status]
  if (!config) return ''
  return `${config.color.light} dark:${config.color.dark} ${config.bgColor.light} dark:${config.bgColor.dark} ${config.borderColor.light} dark:${config.borderColor.dark}`
}

