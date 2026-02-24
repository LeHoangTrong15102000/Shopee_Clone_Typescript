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
  shipping: {
    label: 'Đang giao',
    color: { light: 'text-teal-600', dark: 'text-teal-400' },
    bgColor: { light: 'bg-teal-50', dark: 'bg-teal-900/30' },
    borderColor: { light: 'border-teal-200', dark: 'border-teal-700/50' },
    icon: '➤',
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

// Carrier code to display name mapping (backend uses codes, UI shows names)
export const CARRIER_DISPLAY_NAMES: Record<string, string> = {
  'ghn': 'Giao Hàng Nhanh',
  'ghtk': 'Giao Hàng Tiết Kiệm',
  'viettel_post': 'Viettel Post',
  'j&t': 'J&T Express',
  'other': 'Khác'
}

export const getCarrierDisplayName = (carrierCode: string): string =>
  CARRIER_DISPLAY_NAMES[carrierCode] ?? carrierCode

