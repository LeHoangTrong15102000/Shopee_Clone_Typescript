import { createContext, useState } from 'react'
import { ExtendedPurchase } from 'src/types/purchases.type'
import { User } from 'src/types/user.type'
import { getAccessTokenFromLS, getProfileFromLS } from 'src/utils/auth'

interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  extendedPurchases: ExtendedPurchase[]
  setExtendedPurchases: React.Dispatch<React.SetStateAction<ExtendedPurchase[]>>
  reset: () => void
}

// Khởi tạo giá trị cho localStorage
const initialAppContext: AppContextInterface = {
  isAuthenticated: Boolean(getAccessTokenFromLS()), // ép kiểu cho nó
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(), // ban đầu cho nó giá trị khởi tạo là null, lấy ra user từ localStorage
  setProfile: () => null,
  extendedPurchases: [], // ban đầu sẽ cho nó là 1 cái arr rỗng
  setExtendedPurchases: () => null,
  reset: () => null
}

// Khai báo một context
export const AppContext = createContext<AppContextInterface>(initialAppContext) // cho nó 1 giá trị khởi tạo

// Khi mà không truyền vào provider cái value thì giá trị khởi tạo sẽ được dùng
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAppContext.isAuthenticated)
  const [extendedPurchases, setExtendedPurchases] = useState<ExtendedPurchase[]>(initialAppContext.extendedPurchases)
  const [profile, setProfile] = useState<AppContextInterface['profile']>(initialAppContext.profile)

  // Mỗi khi mà clearLS thì hàm reset này nó sẽ gọi lại
  const reset = () => {
    // Không nên reset lại bằng giá trị của initalAppContext
    setIsAuthenticated(false)
    setExtendedPurchases([])
    setProfile(null)
  }
  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        extendedPurchases,
        setExtendedPurchases,
        reset
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
