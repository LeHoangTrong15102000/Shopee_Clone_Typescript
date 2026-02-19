import { useState, useEffect, useCallback } from 'react'
import { Seller, FollowedSeller } from 'src/types/seller.type'

const FOLLOWED_SELLERS_KEY = 'shopee_followed_sellers'
const MAX_FOLLOWED_SELLERS = 100

const MOCK_FOLLOWED_SELLERS: FollowedSeller[] = [
  {
    _id: 'seller_001',
    name: 'Thời Trang Việt',
    avatar: 'https://down-vn.img.susercontent.com/file/sg-11134004-7qvfc-lhj3c9qnp7ov4a_tn',
    is_official: true,
    location: 'TP. Hồ Chí Minh',
    products_count: 1250,
    rating: 4.8,
    followed_at: '2024-01-15T08:30:00.000Z'
  },
  {
    _id: 'seller_002',
    name: 'Điện Tử Số',
    avatar: 'https://down-vn.img.susercontent.com/file/sg-11134004-7qvfc-lhj3c9qnp7ov4a_tn',
    is_official: true,
    location: 'Hà Nội',
    products_count: 890,
    rating: 4.9,
    followed_at: '2024-01-10T14:20:00.000Z'
  },
  {
    _id: 'seller_003',
    name: 'Mỹ Phẩm Hàn Quốc',
    avatar: 'https://down-vn.img.susercontent.com/file/sg-11134004-7qvfc-lhj3c9qnp7ov4a_tn',
    is_official: false,
    location: 'Đà Nẵng',
    products_count: 456,
    rating: 4.7,
    followed_at: '2024-01-08T10:15:00.000Z'
  },
  {
    _id: 'seller_004',
    name: 'Phụ Kiện Gaming',
    avatar: 'https://down-vn.img.susercontent.com/file/sg-11134004-7qvfc-lhj3c9qnp7ov4a_tn',
    is_official: false,
    location: 'TP. Hồ Chí Minh',
    products_count: 320,
    rating: 4.6,
    followed_at: '2024-01-05T16:45:00.000Z'
  },
  {
    _id: 'seller_005',
    name: 'Đồ Gia Dụng Cao Cấp',
    avatar: 'https://down-vn.img.susercontent.com/file/sg-11134004-7qvfc-lhj3c9qnp7ov4a_tn',
    is_official: true,
    location: 'Hà Nội',
    products_count: 678,
    rating: 4.8,
    followed_at: '2024-01-02T09:00:00.000Z'
  }
]

export const useSellerFollowing = () => {
  const [followedSellers, setFollowedSellers] = useState<FollowedSeller[]>(MOCK_FOLLOWED_SELLERS)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FOLLOWED_SELLERS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FollowedSeller[]
        setFollowedSellers(parsed)
      } catch (e) {
        console.error('Failed to parse followed sellers:', e)
        localStorage.removeItem(FOLLOWED_SELLERS_KEY)
      }
    }
  }, [])

  // Save to localStorage
  const saveToStorage = useCallback((sellers: FollowedSeller[]) => {
    localStorage.setItem(FOLLOWED_SELLERS_KEY, JSON.stringify(sellers))
  }, [])

  // Check if a seller is followed
  const isFollowing = useCallback(
    (sellerId: string) => {
      return followedSellers.some((seller) => seller._id === sellerId)
    },
    [followedSellers]
  )

  // Follow a seller
  const followSeller = useCallback(
    (seller: Seller) => {
      if (isFollowing(seller._id)) return

      setFollowedSellers((prev) => {
        const newFollowed: FollowedSeller = {
          ...seller,
          followed_at: new Date().toISOString()
        }
        const updated = [newFollowed, ...prev].slice(0, MAX_FOLLOWED_SELLERS)
        saveToStorage(updated)
        return updated
      })
    },
    [isFollowing, saveToStorage]
  )

  // Unfollow a seller
  const unfollowSeller = useCallback(
    (sellerId: string) => {
      setFollowedSellers((prev) => {
        const updated = prev.filter((seller) => seller._id !== sellerId)
        saveToStorage(updated)
        return updated
      })
    },
    [saveToStorage]
  )

  // Get all followed sellers
  const getFollowedSellers = useCallback(() => {
    return followedSellers
  }, [followedSellers])

  // Clear all followed sellers
  const clearAllFollowed = useCallback(() => {
    setFollowedSellers([])
    localStorage.removeItem(FOLLOWED_SELLERS_KEY)
  }, [])

  // Get followed count
  const followedCount = followedSellers.length

  return {
    followedSellers,
    followedCount,
    isFollowing,
    followSeller,
    unfollowSeller,
    getFollowedSellers,
    clearAllFollowed
  }
}

export default useSellerFollowing

