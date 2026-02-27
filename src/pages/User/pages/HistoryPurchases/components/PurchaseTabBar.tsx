import classNames from 'classnames'
import { purchasesStatus } from 'src/constant/purchase'

interface PurchaseTabBarProps {
  status: number
  onStatusChange: (status: number) => void
}

const purchaseTabs = [
  { status: purchasesStatus.all, name: 'Tất cả' },
  { status: purchasesStatus.waitForConfirmation, name: 'Chờ xác nhận' },
  { status: purchasesStatus.waitForGetting, name: 'Chờ lấy hàng' },
  { status: purchasesStatus.inProgress, name: 'Đang giao hàng' },
  { status: purchasesStatus.delivered, name: 'Hoàn thành' },
  { status: purchasesStatus.cancelled, name: 'Đã hủy' }
]

const PurchaseTabBar = ({ status, onStatusChange }: PurchaseTabBarProps) => {
  return (
    <div className='sticky top-0 z-20 flex items-center overflow-x-auto rounded-t-sm bg-white dark:bg-slate-800 shadow-sm scrollbar-hide'>
      {purchaseTabs.map((tab) => (
        <button
          key={tab.status}
          onClick={() => onStatusChange(tab.status)}
          className={classNames(
            'flex items-center justify-center whitespace-nowrap bg-white dark:bg-slate-800 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-center transition-all hover:text-orange dark:hover:text-orange-400 min-w-[5rem] sm:min-w-0 sm:flex-1',
            {
              'border-b-2 border-b-orange text-orange dark:border-b-orange-400 dark:text-orange-400 font-medium':
                status === tab.status,
              'border-b-2 border-b-gray-200 dark:border-b-slate-600 text-gray-900 dark:text-gray-100':
                status !== tab.status
            }
          )}
        >
          {tab.name}
        </button>
      ))}
    </div>
  )
}

export default PurchaseTabBar
