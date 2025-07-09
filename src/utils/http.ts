// viết lại file utils cho nó sạch
import axios, { AxiosError, type AxiosRequestConfig, type AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import HTTP_STATUS_CODE from 'src/constant/httpStatusCode.enum'
import { isAxiosExpiredTokenError, isAxiosUnauthorizedError } from './utils'
import { AuthResponse, RefreshTokenResponse } from 'src/types/auth.type'
import {
  clearLS,
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  setAccessTokenToLS,
  setProfileToLS,
  setRefreshTokenToLS
} from './auth'

import config from 'src/constant/config'
import { URL_LOGIN, URL_LOGOUT, URL_REFRESH_TOKEN, URL_REGISTER } from 'src/apis/auth.api'
import { ErrorResponseApi } from 'src/types/utils.type'

// Developer thì phải biết design pattern,

// type InternalAxiosRequestConfig chỉ xuất hiện ở phiên bản axios 1.2.4

// console.log('Process Env', process.env)

const URL = `${(process.env.BUILD_MODE as string) === 'dev'}`
  ? 'http://localhost:3000/login'
  : 'https://shop.lehoangtrong.online/login'

export class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string
  private refreshTokenRequest: Promise<string> | null
  constructor() {
    // this.accessToken sẽ lưu vào RAM nên lấy ra sẽ nhanh hơn
    this.accessToken = getAccessTokenFromLS()
    this.refreshToken = getRefreshTokenFromLS()
    this.refreshTokenRequest = null
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'expire-access-token': 60 * 60 * 24,
        'refresh-access-token': 60 * 60 * 24 * 7 // refreshToken cho là 7 ngày
      }
      // withCredentials: true
    })
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.authorization = this.accessToken

          return config
        }
        return config
      },
      (error) => {
        // console.log('Error', error)
        return Promise.reject(error)
      }
    )
    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config

        if (url === URL_LOGIN || url === URL_REGISTER) {
          const { data } = response.data as AuthResponse
          this.accessToken = data.access_token
          this.refreshToken = data.refresh_token
          setAccessTokenToLS(this.accessToken)
          setRefreshTokenToLS(this.refreshToken)
          setProfileToLS(data.user)
        } else if (url === URL_LOGOUT) {
          clearLS()
          this.accessToken = ''
          this.refreshToken = ''
        }

        return response
      },
      async (error: AxiosError) => {
        // Nếu không phải lỗi liên quan đến 422 hoặc là 401
        if (
          ![HTTP_STATUS_CODE.UnprocessableEntity, HTTP_STATUS_CODE.Unauthorized].includes(
            error.response?.status as number
          )
        ) {
          const data = error.response?.data as { message?: string } | undefined
          const message = data?.message || error.message
          toast.error(message)
        }

        // Lỗi Unauthorized (401) có rất nhiều trường hợp
        /**
         * 1. Token không đúng
         * 2. Không truyền token
         * 3. token hết hạn
         */

        // Nếu là lỗi 401
        if (isAxiosUnauthorizedError<ErrorResponseApi<{ name: string; message: string }>>(error)) {
          const config = error.response?.config ?? ({} as AxiosRequestConfig)
          // const config = error.response?.config || ({ headers: {} } as AxiosRequestConfig) -> dùng như này hoặc là như trên đều được
          const { url } = config

          // Nếu đã là lỗi 401 thì kiểm tra tiếp có phải là access_token hết hạn hay không
          if (isAxiosExpiredTokenError(error) && url !== URL_REFRESH_TOKEN) {
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                  setTimeout(() => {
                    // Giữ API refreshToken lại 10s cho những Api kế bên gọi chung để  set lại access_token lấy lại dự liệu, nếu sau khoảng thời gian này thì mới gọi lại refreshTokenRequest = null lại như ban đầu
                    this.refreshTokenRequest = null
                  }, 10000)
                })

            return this.refreshTokenRequest?.then((access_token) => {
              return this.instance({ ...config, headers: { ...(config.headers || {}), authorization: access_token } })
            })
          }

          // Khi mà đã hết token rồi thì chúng ta sẽ remove localStorage đi và window.location.reload() -> Nhưng mà cách này nó không đủ hay -> Cách hay hơn đó là dùng EventTarget()

          // Còn nếu không nhảy vào trường hợp ở trên thì có thể là do refreshToken hết hạn

          clearLS()
          this.accessToken = ''
          this.refreshToken = ''
          toast.error('Phiên đăng nhập đã hết hạn. Quý khách vui lòng đăng nhập lại!', { autoClose: 1000 })
          toast.error(error.response?.data?.data?.message ?? error.response?.data.message, { autoClose: 1000 })
          setTimeout(() => {
            window.location.replace(URL)
          }, 1000)
          // khi mà hết hạn refresh_token thì chúng ta sẽ quay lại trang đầu tiên
        }
        return Promise.reject(error)
      }
    )
  }
  private async handleRefreshToken() {
    // console.log('Refresh chạy vào đây ------------')
    // Nếu chúng ta không return thì nó sẽ trả về Promise() và không thể .finally() được
    return await this.instance
      .post<RefreshTokenResponse>(URL_REFRESH_TOKEN, {
        // Bắt buộc phải truyền lên `refresh_token` đúng chữ vì ở dưới backend yêu cầu như vậy
        refresh_token: this.refreshToken
      })
      .then((res) => {
        const { access_token } = res.data.data
        setAccessTokenToLS(access_token)
        this.accessToken = access_token

        // return về access_token để khi gọi hàm handleRefreshToken thì sẽ lấy được access_token
        return access_token
      })
      .catch((error) => {
        clearLS()
        this.accessToken = ''
        this.refreshToken = ''
        throw error
      })
  }
}

const http = new Http().instance

export default http
