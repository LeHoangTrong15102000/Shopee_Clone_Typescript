import { AuthResponse } from 'src/types/auth.type'
import http from 'src/utils/http'

export const URL_LOGIN = 'login'
export const URL_REGISTER = 'register'
export const URL_LOGOUT = 'logout'
export const URL_REFRESH_TOKEN = 'refresh-access-token'

const authApi = {
  registerAccount: (body: { email: string; password: string }) => http.post<AuthResponse>(URL_REGISTER, body),
  loginAccount: (body: { email: string; password: string }) => http.post<AuthResponse>(URL_LOGIN, body),
  logoutAccount: () => http.post(URL_LOGOUT),
  // Body phải gửi lên đúng là object có `refresh_token`, cái ở đây để cho biết là phải truyền lên một cái object có một thuộc tính là refresh_token(chỉ là params thôi) -> Nhưng mà cũng phải ghi giống với BE quy định
  refreshAccessToken: (body: { refresh_token: string }) => http.post(URL_REFRESH_TOKEN, body)
}

// export const registerAccount = (body: { email: string; password: string }) => http.post<AuthResponse>('/register', body)

// export const loginAccount = (body: { email: string; password: string }) => http.post<AuthResponse>('/login', body)

// export const logoutAccount = () => http.post('/logout')

/**
 * Muốn custom thời gian cho access_token và refresh_token thì truyền lên header 2 tham số
 * + `expire_access_token` và `expires_refresh_token`
 */

export default authApi
