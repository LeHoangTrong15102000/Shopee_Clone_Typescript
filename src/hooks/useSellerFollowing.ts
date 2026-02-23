import { useState, useEffect, useCallback } from 'react'
import { Seller, FollowedSeller } from 'src/types/seller.type'

// Versioned key to invalidate stale localStorage data (e.g. broken avatar URLs from previous fixes)
const FOLLOWED_SELLERS_KEY = 'shopee_followed_sellers_v2'
const LEGACY_FOLLOWED_SELLERS_KEY = 'shopee_followed_sellers'
const MAX_FOLLOWED_SELLERS = 100

const MOCK_FOLLOWED_SELLERS: FollowedSeller[] = [
  {
    _id: 'seller_001',
    name: 'Thời Trang Việt',
    avatar:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFRTREMkQiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNzIiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+VFQ8L3RleHQ+PC9zdmc+',
    is_official: true,
    location: 'TP. Hồ Chí Minh',
    products_count: 1250,
    rating: 4.8,
    followed_at: '2024-01-15T08:30:00.000Z'
  },
  {
    _id: 'seller_002',
    name: 'Điện Tử Số',
    avatar:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiMxRTkwRkYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNzIiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+xJBUPC90ZXh0Pjwvc3ZnPg==',
    is_official: true,
    location: 'Hà Nội',
    products_count: 890,
    rating: 4.9,
    followed_at: '2024-01-10T14:20:00.000Z'
  },
  {
    _id: 'seller_003',
    name: 'Mỹ Phẩm Hàn Quốc',
    avatar:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiMxMEI5ODEiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNzIiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+TVA8L3RleHQ+PC9zdmc+',
    is_official: false,
    location: 'Đà Nẵng',
    products_count: 456,
    rating: 4.7,
    followed_at: '2024-01-08T10:15:00.000Z'
  },
  {
    _id: 'seller_004',
    name: 'Phụ Kiện Gaming',
    avatar:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM4QjVDRjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNzIiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+UEs8L3RleHQ+PC9zdmc+',
    is_official: false,
    location: 'TP. Hồ Chí Minh',
    products_count: 320,
    rating: 4.6,
    followed_at: '2024-01-05T16:45:00.000Z'
  },
  {
    _id: 'seller_005',
    name: 'Đồ Gia Dụng Cao Cấp',
    avatar:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNFQzQ4OTkiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNzIiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+xJBHPC90ZXh0Pjwvc3ZnPg==',
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
    // Clean up legacy key from previous versions
    localStorage.removeItem(LEGACY_FOLLOWED_SELLERS_KEY)

    const stored = localStorage.getItem(FOLLOWED_SELLERS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FollowedSeller[]
        // Merge avatars from mock data to ensure they're always up-to-date
        const mockAvatarMap = new Map(MOCK_FOLLOWED_SELLERS.map((s) => [s._id, s.avatar]))
        const merged = parsed.map((seller) => {
          const mockAvatar = mockAvatarMap.get(seller._id)
          if (mockAvatar && seller.avatar !== mockAvatar) {
            return { ...seller, avatar: mockAvatar }
          }
          return seller
        })
        setFollowedSellers(merged)
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

