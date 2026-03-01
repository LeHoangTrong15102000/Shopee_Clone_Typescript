import { useState, useMemo, useCallback, memo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import priceHistoryApi from 'src/apis/priceHistory.api'
import { formatCurrency, formatDate } from 'src/utils/utils'
import { PriceHistory, PricePoint } from 'src/types/priceHistory.type'

interface PriceHistoryChartProps {
  productId: string
  currentPrice: number
  className?: string
}

type TimeRange = 7 | 30 | 90

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 7, label: '7 ngày' },
  { value: 30, label: '30 ngày' },
  { value: 90, label: '90 ngày' }
]

const TREND_CONFIG = {
  up: { color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/30', icon: '↑', label: 'Tăng' },
  down: { color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/30', icon: '↓', label: 'Giảm' },
  stable: {
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-slate-700',
    icon: '→',
    label: 'Ổn định'
  }
}

const CHART_DESCRIPTION_ID = 'price-history-chart-description'

const PriceHistoryChart = memo(({ productId, currentPrice, className = '' }: PriceHistoryChartProps) => {
  const [selectedDays, setSelectedDays] = useState<TimeRange>(30)
  const [targetPrice, setTargetPrice] = useState('')
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null)
  const [showAlertForm, setShowAlertForm] = useState(false)

  const queryClient = useQueryClient()

  const { data: priceHistoryData, isLoading } = useQuery({
    queryKey: ['price-history', productId, selectedDays],
    queryFn: () => priceHistoryApi.getPriceHistory(productId, { days: selectedDays })
  })

  const createAlertMutation = useMutation({
    mutationFn: priceHistoryApi.createPriceAlert,
    onSuccess: () => {
      toast.success('Đã tạo thông báo giảm giá thành công!')
      setTargetPrice('')
      setShowAlertForm(false)
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo thông báo')
    }
  })

  const priceHistory: PriceHistory | undefined = priceHistoryData?.data.data

  const chartData = useMemo(() => {
    if (!priceHistory?.price_points?.length) return null

    const points = priceHistory.price_points
    const prices = points.map((p) => p.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    const chartWidth = 100
    const chartHeight = 100
    const padding = 10

    const pathPoints = points.map((point, index) => {
      const x = padding + (index / (points.length - 1 || 1)) * (chartWidth - 2 * padding)
      const y = chartHeight - padding - ((point.price - minPrice) / priceRange) * (chartHeight - 2 * padding)
      return { x, y, ...point }
    })

    const pathD = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    const areaD = `${pathD} L ${pathPoints[pathPoints.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

    return { pathPoints, pathD, areaD, minPrice, maxPrice }
  }, [priceHistory])

  const discountFromHighest = useMemo(() => {
    if (!priceHistory) return 0
    return Math.round(((priceHistory.highest_price - currentPrice) / priceHistory.highest_price) * 100)
  }, [priceHistory, currentPrice])

  const handleCreateAlert = useCallback(() => {
    const price = Number(targetPrice)
    if (!price || price <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ')
      return
    }
    if (price >= currentPrice) {
      toast.error('Giá mục tiêu phải thấp hơn giá hiện tại')
      return
    }
    createAlertMutation.mutate({ product_id: productId, target_price: price })
  }, [targetPrice, currentPrice, createAlertMutation, productId])

  const handlePointMouseEnter = useCallback((point: PricePoint) => {
    setHoveredPoint(point)
  }, [])

  const handlePointMouseLeave = useCallback(() => {
    setHoveredPoint(null)
  }, [])

  const handleCancelAlert = useCallback(() => {
    setShowAlertForm(false)
    setTargetPrice('')
  }, [])

  const trendConfig = priceHistory ? TREND_CONFIG[priceHistory.price_trend] : TREND_CONFIG.stable

  if (isLoading) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-800 ${className}`}
      >
        <div className='animate-pulse'>
          <div className='mb-4 h-6 w-32 rounded-sm bg-gray-200 dark:bg-slate-700'></div>
          <div className='h-40 rounded-sm bg-gray-200 dark:bg-slate-700'></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-200'>Lịch sử giá</h3>
        <div className='flex gap-1' role='group' aria-label='Chọn khoảng thời gian'>
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedDays(option.value)}
              aria-label={`Xem lịch sử giá ${option.label}`}
              aria-pressed={selectedDays === option.value}
              className={`rounded px-2 py-1 text-xs transition-colors sm:px-3 sm:text-sm ${
                selectedDays === option.value
                  ? 'bg-orange text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {priceHistory && (
        <>
          <div className='mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
            <PriceStatCard label='Giá hiện tại' value={currentPrice} highlight />
            <PriceStatCard label='Giá thấp nhất' value={priceHistory.lowest_price} />
            <PriceStatCard label='Giá cao nhất' value={priceHistory.highest_price} />
            <PriceStatCard label='Giá trung bình' value={priceHistory.average_price} />
          </div>

          <div className='mb-4 flex items-center gap-4'>
            <div className={`flex items-center gap-1 rounded-full px-3 py-1 ${trendConfig.bgColor}`}>
              <span className={`text-lg ${trendConfig.color}`}>{trendConfig.icon}</span>
              <span className={`text-sm font-medium ${trendConfig.color}`}>{trendConfig.label}</span>
            </div>
            {discountFromHighest > 0 && (
              <div className='rounded-full bg-green-50 px-3 py-1 dark:bg-green-900/30'>
                <span className='text-sm font-medium text-green-600 dark:text-green-400'>
                  Giảm {discountFromHighest}% so với giá cao nhất
                </span>
              </div>
            )}
          </div>

          {chartData && (
            <div className='relative mb-4'>
              <p id={CHART_DESCRIPTION_ID} className='sr-only'>
                Biểu đồ lịch sử giá trong {selectedDays} ngày qua. Giá thấp nhất: {formatCurrency(chartData.minPrice)}₫,
                giá cao nhất: {formatCurrency(chartData.maxPrice)}₫
              </p>
              <svg
                viewBox='0 0 100 100'
                className='h-28 w-full sm:h-40'
                preserveAspectRatio='none'
                role='img'
                aria-label={`Biểu đồ lịch sử giá sản phẩm trong ${selectedDays} ngày`}
                aria-describedby={CHART_DESCRIPTION_ID}
              >
                <defs>
                  <linearGradient id='priceGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                    <stop offset='0%' stopColor='rgb(249, 115, 22)' stopOpacity='0.3' />
                    <stop offset='100%' stopColor='rgb(249, 115, 22)' stopOpacity='0.05' />
                  </linearGradient>
                </defs>

                <path d={chartData.areaD} fill='url(#priceGradient)' />
                <path d={chartData.pathD} fill='none' stroke='rgb(249, 115, 22)' strokeWidth='1.5' />

                {chartData.pathPoints.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint?.date === point.date ? 4 : 2}
                    fill='white'
                    stroke='rgb(249, 115, 22)'
                    strokeWidth='1.5'
                    className='cursor-pointer'
                    style={{ transition: 'r 0.2s ease-in-out' }}
                    onMouseEnter={() => handlePointMouseEnter(point)}
                    onMouseLeave={handlePointMouseLeave}
                    role='button'
                    tabIndex={0}
                    aria-label={`Giá ${formatCurrency(point.price)}₫ vào ngày ${formatDate(point.date)}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handlePointMouseEnter(point)
                      }
                    }}
                    onBlur={handlePointMouseLeave}
                  />
                ))}
              </svg>

              {hoveredPoint && (
                <div
                  className='pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 rounded-sm bg-gray-800 px-3 py-2 text-sm text-white shadow-lg'
                  role='tooltip'
                  aria-live='polite'
                >
                  <div className='font-medium'>{formatCurrency(hoveredPoint.price)}₫</div>
                  <div className='text-xs text-gray-300'>{formatDate(hoveredPoint.date)}</div>
                </div>
              )}

              <div className='mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400'>
                <span>{formatCurrency(chartData.minPrice)}₫</span>
                <span>{formatCurrency(chartData.maxPrice)}₫</span>
              </div>
            </div>
          )}

          <div className='border-t border-gray-100 pt-4 dark:border-slate-700'>
            {!showAlertForm ? (
              <button
                onClick={() => setShowAlertForm(true)}
                aria-label='Mở form tạo thông báo khi giảm giá'
                className='flex w-full items-center justify-center gap-2 rounded-lg border border-orange bg-orange/5 py-2 text-orange transition-colors hover:bg-orange/10'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                  />
                </svg>
                <span className='font-medium'>Thông báo khi giảm giá</span>
              </button>
            ) : (
              <div className='space-y-3' role='form' aria-label='Form tạo thông báo giảm giá'>
                <div className='flex items-center gap-2'>
                  <label htmlFor='target-price-input' className='sr-only'>
                    Giá mục tiêu
                  </label>
                  <input
                    id='target-price-input'
                    type='number'
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder='Nhập giá mục tiêu'
                    aria-describedby='target-price-description'
                    className='flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange focus:outline-hidden dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100'
                  />
                  <span className='text-sm text-gray-500 dark:text-gray-400' aria-hidden='true'>
                    ₫
                  </span>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={handleCreateAlert}
                    disabled={createAlertMutation.isPending}
                    aria-label={createAlertMutation.isPending ? 'Đang tạo thông báo' : 'Tạo thông báo giảm giá'}
                    aria-busy={createAlertMutation.isPending}
                    className='flex-1 rounded-lg bg-orange py-2 text-sm font-medium text-white transition-colors hover:bg-orange/90 disabled:opacity-50'
                  >
                    {createAlertMutation.isPending ? 'Đang tạo...' : 'Tạo thông báo'}
                  </button>
                  <button
                    onClick={handleCancelAlert}
                    aria-label='Hủy tạo thông báo'
                    className='rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
                  >
                    Hủy
                  </button>
                </div>
                <p id='target-price-description' className='text-xs text-gray-500 dark:text-gray-400'>
                  Bạn sẽ nhận được thông báo khi giá giảm xuống dưới{' '}
                  {targetPrice ? formatCurrency(Number(targetPrice)) : '...'} ₫
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {!priceHistory && !isLoading && (
        <div className='py-8 text-center text-gray-500 dark:text-gray-400'>Chưa có dữ liệu lịch sử giá</div>
      )}
    </div>
  )
})

PriceHistoryChart.displayName = 'PriceHistoryChart'

interface PriceStatCardProps {
  label: string
  value: number
  highlight?: boolean
}

const PriceStatCard = memo(({ label, value, highlight = false }: PriceStatCardProps) => (
  <div className={`rounded-lg p-2 sm:p-3 ${highlight ? 'bg-orange/10' : 'bg-gray-50 dark:bg-slate-700'}`}>
    <div className='text-xs text-gray-500 dark:text-gray-400'>{label}</div>
    <div className={`text-sm font-semibold ${highlight ? 'text-orange' : 'text-gray-800 dark:text-gray-200'}`}>
      {formatCurrency(value)}₫
    </div>
  </div>
))

PriceStatCard.displayName = 'PriceStatCard'

export default PriceHistoryChart
