import { useState, useMemo, useCallback, memo } from 'react'
import { addDays, format } from 'date-fns'
import { vi } from 'date-fns/locale'
import classNames from 'classnames'
import { formatCurrency } from 'src/utils/utils'

export interface ShippingOption {
  id: string
  name: string
  price: number
  estimated_days: { min: number; max: number }
  icon?: string
}

interface ShippingEstimateProps {
  productLocation: string
  selectedAddress?: string
  onAddressChange?: (address: string) => void
  onShippingSelect?: (option: ShippingOption) => void
  className?: string
}

const defaultShippingOptions: ShippingOption[] = [
  { id: 'instant', name: 'Hỏa tốc', price: 45000, estimated_days: { min: 0, max: 1 } },
  { id: 'express', name: 'Giao hàng nhanh', price: 25000, estimated_days: { min: 1, max: 2 } },
  { id: 'standard', name: 'Giao hàng tiết kiệm', price: 15000, estimated_days: { min: 3, max: 5 } }
]

const formatDeliveryDate = (daysFromNow: number): string => {
  const date = addDays(new Date(), daysFromNow)
  return format(date, 'dd/MM', { locale: vi })
}

const getDeliveryDateRange = (estimated_days: { min: number; max: number }): string => {
  const minDate = formatDeliveryDate(estimated_days.min)
  const maxDate = formatDeliveryDate(estimated_days.max)

  if (estimated_days.min === estimated_days.max) {
    return `Nhận hàng vào ${minDate}`
  }
  return `Nhận hàng từ ${minDate} - ${maxDate}`
}

function ShippingEstimate({
  productLocation,
  selectedAddress = '',
  onAddressChange,
  onShippingSelect,
  className
}: ShippingEstimateProps) {
  const [address, setAddress] = useState(selectedAddress)
  const [selectedOptionId, setSelectedOptionId] = useState<string>(defaultShippingOptions[0].id)
  const [isEditingAddress, setIsEditingAddress] = useState(false)

  const selectedOption = useMemo(
    () => defaultShippingOptions.find((opt) => opt.id === selectedOptionId),
    [selectedOptionId]
  )

  const handleAddressChange = useCallback(
    (newAddress: string) => {
      setAddress(newAddress)
      onAddressChange?.(newAddress)
    },
    [onAddressChange]
  )

  const handleShippingSelect = useCallback(
    (option: ShippingOption) => {
      setSelectedOptionId(option.id)
      onShippingSelect?.(option)
    },
    [onShippingSelect]
  )

  return (
    <div className={classNames('rounded-sm bg-gray-50 p-3 sm:p-4 dark:bg-slate-900', className)}>
      {/* Header */}
      <div className='mb-3 flex items-center gap-2'>
        <svg className='h-5 w-5 text-[#ee4d2d]' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
          <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' />
        </svg>
        <span className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300'>Vận chuyển</span>
      </div>

      {/* Product Location */}
      <div className='mb-3 flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
        <span>Từ:</span>
        <span className='font-medium'>{productLocation}</span>
      </div>

      {/* Delivery Address */}
      <div className='mb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-xs sm:text-sm'>
            <label htmlFor='delivery-address' className='text-gray-600 dark:text-gray-400'>
              Đến:
            </label>
            {isEditingAddress ? (
              <input
                id='delivery-address'
                type='text'
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onBlur={() => setIsEditingAddress(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingAddress(false)}
                className='rounded border border-gray-300 px-2 py-1.5 text-xs sm:text-sm focus:border-[#ee4d2d] focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200'
                placeholder='Nhập địa chỉ giao hàng'
                aria-label='Địa chỉ giao hàng'
                autoFocus
              />
            ) : (
              <span className='font-medium'>{address || 'Chưa có địa chỉ'}</span>
            )}
          </div>
          <button
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            className='text-sm text-[#ee4d2d] hover:underline'
            aria-expanded={isEditingAddress}
          >
            {isEditingAddress ? 'Xong' : 'Thay đổi'}
          </button>
        </div>
      </div>

      {/* Shipping Options */}
      <div className='space-y-2'>
        <span id='shipping-options-label' className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300'>
          Phương thức vận chuyển:
        </span>
        <div role='radiogroup' aria-labelledby='shipping-options-label' className='space-y-2'>
          {defaultShippingOptions.map((option) => {
            const deliveryDateId = `delivery-date-${option.id}`
            const isSelected = selectedOptionId === option.id
            return (
              <label
                key={option.id}
                className={classNames(
                  'flex cursor-pointer items-center justify-between rounded-md border p-2 sm:p-3 transition-all',
                  isSelected ? 'border-[#ee4d2d] bg-[#fff5f5] dark:bg-[#ee4d2d]/10' : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
                )}
              >
                <div className='flex items-center gap-3'>
                  <input
                    type='radio'
                    name='shipping-option'
                    checked={isSelected}
                    onChange={() => handleShippingSelect(option)}
                    className='h-4 w-4 accent-[#ee4d2d]'
                    aria-checked={isSelected}
                    aria-describedby={deliveryDateId}
                  />
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200'>{option.name}</span>
                      {option.id === 'instant' && (
                        <span className='rounded bg-[#ee4d2d] px-1.5 py-0.5 text-xs text-white'>Nhanh nhất</span>
                      )}
                    </div>
                    <span id={deliveryDateId} className='text-xs text-gray-500 dark:text-gray-400'>
                      {getDeliveryDateRange(option.estimated_days)}
                    </span>
                  </div>
                </div>
                <span className='text-xs sm:text-sm font-medium text-[#ee4d2d]'>₫{formatCurrency(option.price)}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedOption && (
        <div className='mt-4 border-t border-gray-200 pt-3 dark:border-slate-700' aria-live='polite'>
          <div className='flex items-center justify-between text-xs sm:text-sm'>
            <span className='text-gray-600 dark:text-gray-400'>Phí vận chuyển:</span>
            <span className='font-medium text-[#ee4d2d]'>₫{formatCurrency(selectedOption.price)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(ShippingEstimate)

