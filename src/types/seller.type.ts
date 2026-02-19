// Seller/Shop types for following feature
export interface Seller {
  _id: string
  name: string
  avatar?: string
  location?: string
  rating?: number
  products_count?: number
  followers_count?: number
  response_rate?: number
  response_time?: string
  joined_date?: string
  is_official?: boolean
}

export interface FollowedSeller extends Seller {
  followed_at: string
}

export interface SellerFollowingState {
  followedSellers: FollowedSeller[]
  isFollowing: (sellerId: string) => boolean
  followSeller: (seller: Seller) => void
  unfollowSeller: (sellerId: string) => void
  getFollowedSellers: () => FollowedSeller[]
  clearAllFollowed: () => void
}

