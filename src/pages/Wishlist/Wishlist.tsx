import { useMemo, Fragment, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import wishlistApi from 'src/apis/wishlist.api'
import productApi from 'src/apis/product.api'
import purchaseApi from 'src/apis/purchases.api'
import { formatCurrency, formatNumberToSocialStyle, generateNameId } from 'src/utils/utils'
import ProductRating from 'src/components/ProductRating'
import WishlistPriceAlert from 'src/components/WishlistPriceAlert'
import ImageWithFallback from 'src/components/ImageWithFallback'
import path from 'src/constant/path'
import { purchasesStatus } from 'src/constant/purchase'
import { Product } from 'src/types/product.type'

// Mock categories for visual enhancement
const mockCategories = ['Điện tử', 'Thời trang', 'Gia dụng', 'Làm đẹp', 'Thể thao', 'Sách', 'Đồ chơi', 'Phụ kiện']

// SVG Icon components (Heroicons outline style)
const IconHeart = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' />
  </svg>
)
const IconCurrencyDollar = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
  </svg>
)
const IconTag = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M6 6h.008v.008H6V6z' />
  </svg>
)
const IconChartBar = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' />
  </svg>
)
const IconBell = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' />
  </svg>
)
const IconTarget = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 21a9 9 0 100-18 9 9 0 000 18z' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 15a3 3 0 100-6 3 3 0 000 6z' />
  </svg>
)
const IconFolder = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z' />
  </svg>
)
const IconCube = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9' />
  </svg>
)
const IconShoppingCart = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-5.98.572l-.003.048m5.983-.62h9.338a2.25 2.25 0 002.227-1.932l.857-6A2.25 2.25 0 0017.668 4.5H7.5m0 9.75v-9.75' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M7.5 18.75a.75.75 0 100-1.5.75.75 0 000 1.5zm9 0a.75.75 0 100-1.5.75.75 0 000 1.5z' />
  </svg>
)
const IconLightning = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' />
  </svg>
)
const IconStar = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' />
  </svg>
)
const IconTrendingUp = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941' />
  </svg>
)
const IconTrendingDown = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181' />
  </svg>
)
const IconClock = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' />
  </svg>
)
const IconFire = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z' />
  </svg>
)
const IconSparkles = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z' />
  </svg>
)
const IconTrophy = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721' />
  </svg>
)
const IconClipboard = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z' />
  </svg>
)
const IconMagnifyingGlass = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' />
  </svg>
)
const IconShoppingBag = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' />
  </svg>
)

// Category icon components mapping
const categoryIconComponents: Record<string, React.FC<{ className?: string }>> = {
  'Thời trang nam': IconShoppingBag,
  'Thời trang nữ': IconSparkles,
  'Điện tử': IconLightning,
  'Phụ kiện': IconCube,
  'Gia dụng': IconFolder,
  'Làm đẹp': IconStar,
  'Thể thao': IconTrophy,
  'Sách': IconClipboard,
  'Đồ chơi': IconHeart
}

// Sort options
const sortOptions = [
  { id: 'newest', label: 'Mới nhất', Icon: IconClock },
  { id: 'price-asc', label: 'Giá thấp → cao', Icon: IconTrendingUp },
  { id: 'price-desc', label: 'Giá cao → thấp', Icon: IconTrendingDown },
  { id: 'discount', label: 'Giảm giá nhiều', Icon: IconFire },
  { id: 'bestseller', label: 'Bán chạy', Icon: IconStar }
]

// Filter pills data
const filterPills = [
  { id: 'all', label: 'Tất cả', Icon: IconClipboard },
  { id: 'sale', label: 'Giảm giá sốc', Icon: IconFire },
  { id: 'bestseller', label: 'Bán chạy', Icon: IconStar },
  { id: 'new', label: 'Mới thêm', Icon: IconSparkles },
  { id: 'lowprice', label: 'Giá thấp', Icon: IconCurrencyDollar },
  { id: 'highrating', label: 'Đánh giá cao', Icon: IconTrophy }
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function Wishlist() {
  const queryClient = useQueryClient()
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSort, setActiveSort] = useState('newest')
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  // Fetch real products from API
  const { data: productsData } = useQuery({
    queryKey: ['products', { limit: 30, sort_by: 'sold' }],
    queryFn: () => productApi.getProducts({ limit: 30, sort_by: 'sold' as const })
  })

  // Fetch wishlist data (mock fallback since API not deployed)
  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getWishlist({ page: 1, limit: 50 })
  })

  // Merge: create wishlist items from real products or API wishlist
  const allWishlistItems = useMemo(() => {
    const apiWishlistItems = wishlistData?.data.data.wishlist ?? []
    const realProducts = productsData?.data.data.products ?? []

    // If we have real wishlist items with valid product data, use them
    if (apiWishlistItems.length > 0 && apiWishlistItems[0].product?.image) {
      return apiWishlistItems
    }

    // Otherwise, create mock wishlist entries from real products
    if (realProducts.length > 0) {
      return realProducts.slice(0, 28).map((product, index) => ({
        _id: `wishlist-${product._id}`,
        user: 'current-user',
        product,
        addedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
        mockCategory: mockCategories[index % mockCategories.length]
      }))
    }

    return apiWishlistItems
  }, [wishlistData, productsData])

  // Filter & Sort logic
  const wishlistItems = useMemo(() => {
    let items = [...allWishlistItems]

    // Apply filter
    if (activeFilter === 'sale') {
      items = items.filter((i) => i.product.price_before_discount > i.product.price)
    } else if (activeFilter === 'bestseller') {
      items = items.filter((i) => i.product.sold >= 2000)
    } else if (activeFilter === 'new') {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
      items = items.filter((i) => new Date(i.addedAt).getTime() > threeDaysAgo)
    } else if (activeFilter === 'lowprice') {
      items = items.filter((i) => i.product.price < 300000)
    } else if (activeFilter === 'highrating') {
      items = items.filter((i) => i.product.rating >= 4.5)
    }

    // Apply sort
    if (activeSort === 'price-asc') items.sort((a, b) => a.product.price - b.product.price)
    else if (activeSort === 'price-desc') items.sort((a, b) => b.product.price - a.product.price)
    else if (activeSort === 'discount') {
      items.sort((a, b) => {
        const dA = a.product.price_before_discount - a.product.price
        const dB = b.product.price_before_discount - b.product.price
        return dB - dA
      })
    } else if (activeSort === 'bestseller') items.sort((a, b) => b.product.sold - a.product.sold)
    else items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())

    return items
  }, [allWishlistItems, activeFilter, activeSort])

  // Extract product IDs for real-time price monitoring
  const productIds = useMemo(() => allWishlistItems.map((item) => item.product._id), [allWishlistItems])

  // Stats
  const totalValue = useMemo(
    () => allWishlistItems.reduce((sum, item) => sum + item.product.price, 0),
    [allWishlistItems]
  )
  const totalSavings = useMemo(
    () => allWishlistItems.reduce((sum, item) => sum + (item.product.price_before_discount - item.product.price), 0),
    [allWishlistItems]
  )

  // Insights
  const insights = useMemo(() => {
    if (allWishlistItems.length === 0) return null
    const catCount: Record<string, number> = {}
    let totalDiscount = 0
    let discountItems = 0
    allWishlistItems.forEach((item) => {
      const cat = item.product.category?.name || (item as { mockCategory?: string }).mockCategory || 'Khác'
      catCount[cat] = (catCount[cat] || 0) + 1
      if (item.product.price_before_discount > item.product.price) {
        totalDiscount += Math.round(
          ((item.product.price_before_discount - item.product.price) / item.product.price_before_discount) * 100
        )
        discountItems++
      }
    })
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]
    return {
      topCategory: topCat ? topCat[0] : 'N/A',
      topCategoryCount: topCat ? topCat[1] : 0,
      avgDiscount: discountItems > 0 ? Math.round(totalDiscount / discountItems) : 0,
      priceDropCount: allWishlistItems.filter(
        (i) =>
          i.product.price_before_discount > i.product.price &&
          Math.round(
            ((i.product.price_before_discount - i.product.price) / i.product.price_before_discount) * 100
          ) >= 30
      ).length
    }
  }, [allWishlistItems])

  // Badge helpers
  const isRecentlyAdded = (addedAt: string) => {
    return Date.now() - new Date(addedAt).getTime() < 3 * 24 * 60 * 60 * 1000
  }
  const isTrending = (product: Product) => product.sold >= 3000 && product.rating >= 4.5
  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { label: 'Hết hàng', color: 'bg-red-500' }
    if (product.quantity <= 20) return { label: 'Sắp hết', color: 'bg-amber-500' }
    return null
  }
  const getDiscountPercent = (product: Product) => {
    if (product.price_before_discount <= product.price) return 0
    return Math.round(((product.price_before_discount - product.price) / product.price_before_discount) * 100)
  }

  // Mutations
  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Đã xóa khỏi danh sách yêu thích')
    }
  })

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => purchaseApi.addToCart({ product_id: productId, buy_count: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
      toast.success('Đã thêm vào giỏ hàng')
    }
  })

  const getProductLink = (product: Product) =>
    `${path.home}${generateNameId({ name: product.name, id: product._id })}`

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className='border-b-4 border-b-[#ee4d2d] bg-neutral-100 dark:bg-slate-900 py-16'>
        <div className='container'>
          {/* Skeleton Stats Header */}
          <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex items-center gap-4 rounded-lg bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-slate-900/50'>
                <div className='h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700' />
                <div className='flex-1'>
                  <div className='h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-slate-700 mb-2' />
                  <div className='h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-slate-600' />
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton Filter Pills */}
          <div className='mb-6 flex gap-2 overflow-x-auto pb-2'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-8 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0' />
            ))}
          </div>
          {/* Skeleton Product Grid */}
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {[...Array(10)].map((_, i) => (
              <div key={i} className='overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/50'>
                <div className='aspect-square w-full animate-pulse bg-gray-200 dark:bg-slate-700' />
                <div className='p-3'>
                  <div className='h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-slate-700 mb-2' />
                  <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-slate-700 mb-3' />
                  <div className='h-5 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-slate-600 mb-2' />
                  <div className='h-8 w-full animate-pulse rounded bg-gray-200 dark:bg-slate-700' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='border-b-4 border-b-[#ee4d2d] bg-neutral-100 dark:bg-slate-900 py-16'>
      <Helmet>
        <title>Sản phẩm yêu thích | Shopee Clone</title>
        <meta name='description' content='Danh sách sản phẩm yêu thích của bạn' />
      </Helmet>

      <div className='container'>
        {allWishlistItems.length > 0 ? (
          <Fragment>
            {/* Real-time price monitoring */}
            <WishlistPriceAlert productIds={productIds} />

            {/* Stats Header - 4 Cards */}
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4'
            >
              <motion.div variants={itemVariants} className='flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700'>
                <div className='flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm shadow-orange-500/30'><IconHeart className='h-5 w-5' /></div>
                <div>
                  <div className='text-xl font-bold text-gray-800 dark:text-gray-100'>{allWishlistItems.length}</div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>Yêu thích</div>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className='flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700'>
                <div className='flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm shadow-blue-500/30'><IconCurrencyDollar className='h-5 w-5' /></div>
                <div>
                  <div className='text-xl font-bold text-gray-800 dark:text-gray-100'>₫{formatCurrency(totalValue)}</div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>Tổng giá trị</div>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className='flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700'>
                <div className='flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm shadow-emerald-500/30'><IconTag className='h-5 w-5' /></div>
                <div>
                  <div className='text-xl font-bold text-emerald-500 dark:text-emerald-400'>₫{formatCurrency(totalSavings)}</div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>Tiết kiệm</div>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className='flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700'>
                <div className='flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-sm shadow-violet-500/30'><IconChartBar className='h-5 w-5' /></div>
                <div>
                  <div className='text-xl font-bold text-gray-800 dark:text-gray-100'>{insights?.avgDiscount || 0}%</div>
                  <div className='text-xs text-gray-500 dark:text-gray-400'>TB giảm giá</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Wishlist Insights Banner */}
            {insights && (
              <motion.div
                variants={fadeInUp}
                initial='hidden'
                animate='visible'
                className='mb-6 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-fuchsia-500/20 border border-purple-200 dark:border-purple-800/50 p-4'
              >
                <div className='flex flex-wrap items-center gap-4 text-sm'>
                  <span className='inline-flex items-center gap-1.5 font-medium text-purple-700 dark:text-purple-300'><IconTrendingUp className='h-4 w-4' /> Insights:</span>
                  <span className='text-gray-600 dark:text-gray-300'>
                    Danh mục yêu thích nhất: <span className='inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400'>{(() => { const CatIcon = categoryIconComponents[insights.topCategory] || IconCube; return <CatIcon className='h-3.5 w-3.5' /> })()} {insights.topCategory}</span> ({insights.topCategoryCount} SP)
                  </span>
                  <span className='hidden sm:inline text-gray-300 dark:text-gray-600'>|</span>
                  <span className='text-gray-600 dark:text-gray-300'>
                    {insights.priceDropCount > 0 && (
                      <span className='inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold'><IconFire className='h-3.5 w-3.5' /> {insights.priceDropCount} sản phẩm giảm &gt;30%</span>
                    )}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Filter Pills + Sort */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
                {filterPills.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setActiveFilter(pill.id)}
                    className={`cursor-pointer flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:ring-offset-1 ${
                      activeFilter === pill.id
                        ? 'bg-[#ee4d2d] dark:bg-orange-500 text-white shadow-md shadow-orange-500/25'
                        : 'border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d] dark:hover:border-orange-400 dark:hover:text-orange-400'
                    }`}
                  >
                    <pill.Icon className='h-3.5 w-3.5' />
                    {pill.label}
                  </button>
                ))}
              </div>
              {/* Sort dropdown */}
              <div className='relative flex-shrink-0'>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className='flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:border-[#ee4d2d] dark:hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:ring-offset-1'
                >
                  <span>Sắp xếp: {sortOptions.find((s) => s.id === activeSort)?.label}</span>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' /></svg>
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className='absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-1 shadow-lg dark:shadow-slate-900/50'
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setActiveSort(opt.id); setShowSortDropdown(false) }}
                          className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 dark:focus:ring-orange-400 ${
                            activeSort === opt.id
                              ? 'bg-orange-50 dark:bg-orange-900/20 text-[#ee4d2d] dark:text-orange-400 font-medium'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <opt.Icon className='h-4 w-4' /> {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Results count */}
            {activeFilter !== 'all' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
                Hiển thị {wishlistItems.length} / {allWishlistItems.length} sản phẩm
              </motion.div>
            )}

            {/* Product Card Grid */}
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              key={activeFilter + activeSort}
              className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            >
              {wishlistItems.map((item) => {
                const categoryName = item.product.category?.name || (item as { mockCategory?: string }).mockCategory || 'Sản phẩm'
                const discount = getDiscountPercent(item.product)
                const stock = getStockStatus(item.product)
                const recent = isRecentlyAdded(item.addedAt)
                const trending = isTrending(item.product)
                return (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    layout
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setHoveredCardId(item._id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className='group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-slate-900/50 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 border border-gray-100 dark:border-slate-700'
                  >
                    {/* Top-left badges stack */}
                    <div className='absolute top-2 left-2 z-10 flex flex-col gap-1'>
                      {recent && (
                        <span className='inline-flex items-center gap-0.5 rounded bg-gradient-to-r from-blue-500 to-cyan-400 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm'><IconSparkles className='h-2.5 w-2.5' /> MỚI</span>
                      )}
                      {trending && (
                        <span className='inline-flex items-center gap-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-400 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm'><IconFire className='h-2.5 w-2.5' /> HOT</span>
                      )}
                      {stock && (
                        <span className={`rounded ${stock.color} px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm`}>{stock.label}</span>
                      )}
                    </div>

                    {/* Discount badge - top right */}
                    {discount > 0 && (
                      <div className='absolute top-0 right-0 z-10'>
                        <div className='relative inline-flex items-center gap-0.5 bg-[#ee4d2d] dark:bg-orange-500 text-white text-[11px] font-bold px-2 py-1 rounded-bl-lg'>
                          -{discount}%
                          {discount >= 30 && <IconLightning className='h-2.5 w-2.5' />}
                        </div>
                      </div>
                    )}

                    {/* Delete button overlay - visible on hover */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: hoveredCardId === item._id ? 1 : 0, scale: hoveredCardId === item._id ? 1 : 0.8 }}
                      onClick={() => removeMutation.mutate(item.product._id)}
                      className='absolute bottom-[calc(100%-2rem)] right-2 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 dark:bg-slate-700/90 text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-150 shadow-md dark:shadow-slate-900/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1'
                      whileTap={{ scale: 0.9 }}
                      aria-label='Xóa khỏi yêu thích'
                    >
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-3.5 h-3.5'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </motion.button>

                    {/* Product Image */}
                    <Link to={getProductLink(item.product)} className='relative block w-full pt-[100%] cursor-pointer overflow-hidden'>
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className='absolute top-0 left-0 h-full w-full bg-white dark:bg-slate-700 object-cover transition-transform duration-500 group-hover:scale-110'
                        loading='lazy'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                      {/* Heart icon overlay on hover */}
                      <div className='absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <div className='flex h-7 w-7 items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'>
                          <svg className='h-4 w-4 text-red-500' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                          </svg>
                        </div>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className='p-3'>
                      <Link
                        to={getProductLink(item.product)}
                        className='line-clamp-2 min-h-[2.5rem] text-xs text-gray-800 dark:text-gray-100 hover:text-[#ee4d2d] dark:hover:text-orange-400 transition-colors duration-150 cursor-pointer leading-relaxed'
                      >
                        {item.product.name}
                      </Link>

                      {/* Category Tag with icon */}
                      <div className='mt-1.5'>
                        <span className='inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-slate-700/50 px-2 py-0.5 text-[10px] text-gray-500 dark:text-gray-400'>
                          {(() => { const CatIcon = categoryIconComponents[categoryName] || IconCube; return <CatIcon className='h-3 w-3' /> })()} {categoryName}
                        </span>
                      </div>

                      {/* Price */}
                      <div className='mt-2 flex items-baseline gap-1.5'>
                        <span className='truncate text-sm text-[#ee4d2d] dark:text-orange-400 font-bold'>₫{formatCurrency(item.product.price)}</span>
                        {discount > 0 && (
                          <span className='truncate text-[10px] text-gray-400 dark:text-gray-500 line-through'>
                            ₫{formatCurrency(item.product.price_before_discount)}
                          </span>
                        )}
                      </div>

                      {/* Rating & Sold */}
                      <div className='mt-1.5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400'>
                        <ProductRating rating={item.product.rating} />
                        <span>Đã bán {formatNumberToSocialStyle(item.product.sold)}</span>
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button
                        onClick={() => addToCartMutation.mutate(item.product._id)}
                        className='mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ee4d2d] to-[#ff6b4a] dark:from-orange-500 dark:to-orange-400 py-2 text-xs font-medium text-white hover:from-[#d73211] hover:to-[#ee4d2d] dark:hover:from-orange-600 dark:hover:to-orange-500 transition-all duration-200 shadow-sm dark:shadow-slate-900/50 hover:shadow-md hover:shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:ring-offset-1'
                        whileTap={{ scale: 0.95 }}
                        aria-label='Thêm vào giỏ hàng'
                      >
                        <IconShoppingCart className='h-3.5 w-3.5' />
                        Thêm vào giỏ
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Empty filter result */}
            {wishlistItems.length === 0 && activeFilter !== 'all' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='py-12 text-center'>
                <div className='mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'><IconMagnifyingGlass className='h-7 w-7' /></div>
                <p className='text-gray-500 dark:text-gray-400'>Không tìm thấy sản phẩm phù hợp</p>
                <button onClick={() => setActiveFilter('all')} className='mt-3 cursor-pointer text-sm text-[#ee4d2d] dark:text-orange-400 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 rounded'>Xem tất cả</button>
              </motion.div>
            )}

            {/* Two-column banners */}
            <motion.div
              variants={fadeInUp}
              initial='hidden'
              animate='visible'
              className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2'
            >
              {/* Price Alert Banner */}
              <div className='overflow-hidden rounded-xl bg-gradient-to-br from-[#ee4d2d] to-[#ff6b4a] dark:from-orange-600 dark:to-orange-500 p-5 shadow-lg dark:shadow-slate-900/50'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white'><IconBell className='h-6 w-6' /></div>
                  <div className='text-white'>
                    <h3 className='text-sm font-semibold'>Theo dõi giá sản phẩm</h3>
                    <p className='text-xs text-white/80 mt-0.5'>Nhận thông báo ngay khi giá giảm!</p>
                  </div>
                </div>
                <button className='mt-3 cursor-pointer rounded-full bg-white px-5 py-2 text-xs font-semibold text-[#ee4d2d] dark:text-orange-600 transition-all duration-200 hover:bg-white/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-orange-500'>
                  Bật thông báo
                </button>
              </div>

              {/* Savings Goal Banner */}
              <div className='overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 p-5 shadow-lg dark:shadow-slate-900/50'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white'><IconTarget className='h-6 w-6' /></div>
                  <div className='text-white'>
                    <h3 className='text-sm font-semibold'>Mục tiêu tiết kiệm</h3>
                    <p className='text-xs text-white/80 mt-0.5'>Bạn đã tiết kiệm ₫{formatCurrency(totalSavings)} từ {allWishlistItems.length} sản phẩm</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className='mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalSavings / (totalValue + totalSavings || 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className='h-full rounded-full bg-white/80'
                  />
                </div>
                <p className='mt-1 text-[10px] text-white/70'>
                  Tiết kiệm {totalValue + totalSavings > 0 ? Math.round((totalSavings / (totalValue + totalSavings)) * 100) : 0}% so với giá gốc
                </p>
              </div>
            </motion.div>

            {/* Category breakdown mini cards */}
            <motion.div
              variants={fadeInUp}
              initial='hidden'
              animate='visible'
              className='mt-6'
            >
              <h3 className='mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300'><IconFolder className='h-4 w-4' /> Phân loại yêu thích</h3>
              <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
                {Object.entries(
                  allWishlistItems.reduce<Record<string, number>>((acc, item) => {
                    const cat = item.product.category?.name || (item as { mockCategory?: string }).mockCategory || 'Khác'
                    acc[cat] = (acc[cat] || 0) + 1
                    return acc
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => {
                    const CatIcon = categoryIconComponents[cat] || IconCube
                    return (
                      <div
                        key={cat}
                        className='flex flex-shrink-0 items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs'
                      >
                        <span className='text-gray-500 dark:text-gray-400'><CatIcon className='h-4 w-4' /></span>
                        <span className='text-gray-700 dark:text-gray-300 font-medium'>{cat}</span>
                        <span className='rounded-full bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] text-gray-500 dark:text-gray-400'>{count}</span>
                      </div>
                    )
                  })}
              </div>
            </motion.div>
          </Fragment>
        ) : (
          /* Enhanced Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='relative rounded-xl bg-white dark:bg-slate-800 p-12 md:p-16 text-center shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden'
          >
            <motion.div animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className='absolute top-10 left-10 h-3 w-3 rounded-full bg-orange-300 dark:bg-orange-500/50' />
            <motion.div animate={{ y: [0, 10, 0], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className='absolute top-20 right-16 h-2 w-2 rounded-full bg-pink-300 dark:bg-pink-500/50' />
            <motion.div animate={{ y: [0, -8, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className='absolute bottom-16 left-20 h-2.5 w-2.5 rounded-full bg-blue-300 dark:bg-blue-500/50' />
            <motion.div animate={{ x: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }} className='absolute top-16 right-1/3 h-2 w-2 rounded-full bg-purple-300 dark:bg-purple-500/50' />

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className='mx-auto mb-6 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center shadow-inner'
            >
              <span className='text-orange-400 dark:text-orange-500'><IconHeart className='h-16 w-16 md:h-20 md:w-20' /></span>
            </motion.div>

            <h3 className='text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2'>Chưa có sản phẩm yêu thích</h3>
            <p className='mb-6 text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm'>
              Hãy khám phá và thêm những sản phẩm bạn yêu thích vào danh sách để theo dõi giá và mua sắm dễ dàng hơn
            </p>
            <Link
              to={path.home}
              className='inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[#ee4d2d] to-[#ff6b4a] dark:from-orange-500 dark:to-orange-400 px-8 py-3 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:ring-offset-2'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
              </svg>
              Mua sắm ngay
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
