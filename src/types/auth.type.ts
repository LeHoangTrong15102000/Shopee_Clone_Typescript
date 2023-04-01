import { SuccessResponseApi } from './utils.type'
import { User } from './user.type'

// Khi mà đăng nhập hoặc đăng ký thành công thì SuccessRes nó sẽ trả về cho AuthRes
export type AuthResponse = SuccessResponseApi<{
  access_token: string
  expires: string
  user: User
}>
