import { AuthResponse } from 'src/types/auth.type'
import http from 'src/utils/http'

const authApi = {
  registerAccount: (body: { email: string; password: string }) => http.post<AuthResponse>('/register', body),
  loginAccount: (body: { email: string; password: string }) => http.post<AuthResponse>('/login', body),
  logoutAccount: () => http.post('/logout')
}

// export const registerAccount = (body: { email: string; password: string }) => http.post<AuthResponse>('/register', body)

// export const loginAccount = (body: { email: string; password: string }) => http.post<AuthResponse>('/login', body)

// export const logoutAccount = () => http.post('/logout')

export default authApi
