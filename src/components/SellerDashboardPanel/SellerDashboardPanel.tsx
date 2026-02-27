import classNames from 'classnames'
import { Link } from 'react-router-dom'
import useSellerDashboard from 'src/hooks/useSellerDashboard'

interface SellerDashboardPanelProps {
  className?: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function SellerDashboardPanel({ className }: SellerDashboardPanelProps) {
  const { metrics, orderNotifications, qaNotifications, isActive } = useSellerDashboard()
  if (!isActive) {
    return null
  }

  return (
    <div className={classNames('rounded-lg bg-white dark:bg-slate-800 shadow p-4', className)}>
      <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4'>📊 Bảng điều khiển người bán</h3>

      {/* Metrics Cards */}
      <div className='grid grid-cols-2 gap-3 mb-4'>
        <div className='rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3 text-center'>
          <p className='text-2xl font-bold text-[#ee4d2d]'>{metrics.today_orders}</p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>Đơn hàng hôm nay</p>
        </div>
        <div className='rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center'>
          <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
            {formatCurrency(metrics.today_revenue)}
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>Doanh thu hôm nay</p>
        </div>
        <div className='rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-center'>
          <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>{metrics.pending_orders}</p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>Đơn chờ xử lý</p>
        </div>
        <div className='rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-center'>
          <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{metrics.pending_qa}</p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>Câu hỏi chờ trả lời</p>
        </div>
      </div>

      {/* Order Notifications */}
      {orderNotifications.length > 0 && (
        <div className='mb-3'>
          <h4 className='text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'>🔔 Đơn hàng mới</h4>
          <div className='space-y-1 max-h-40 overflow-y-auto'>
            {orderNotifications.slice(0, 10).map((notif, index) => (
              <div
                key={`${notif.order_id}-${index}`}
                className='flex items-center gap-2 rounded bg-gray-50 dark:bg-slate-700 px-2 py-1.5 text-xs'
              >
                <span>📦</span>
                <div className='flex-1 min-w-0'>
                  <p className='text-gray-700 dark:text-gray-200 truncate'>{notif.product_names.join(', ')}</p>
                  <p className='text-gray-400 dark:text-gray-500'>{formatCurrency(notif.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Q&A Notifications */}
      {qaNotifications.length > 0 && (
        <div>
          <h4 className='text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'>❓ Câu hỏi mới</h4>
          <div className='space-y-1 max-h-40 overflow-y-auto'>
            {qaNotifications.slice(0, 10).map((notif, index) => (
              <div
                key={`${notif.product_name}-${index}`}
                className='flex items-center gap-2 rounded bg-gray-50 dark:bg-slate-700 px-2 py-1.5 text-xs'
              >
                <span>💬</span>
                <div className='flex-1 min-w-0'>
                  <p className='text-gray-700 dark:text-gray-200 truncate'>
                    {notif.user_name}: {notif.question_preview}
                  </p>
                  <Link
                    to={`/${notif.product_name.replace(/\s+/g, '-')}-i-${notif.product_id}`}
                    className='text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline truncate block'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {notif.product_name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
