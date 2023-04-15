import axios, { AxiosError, type AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import HTTP_STATUS_CODE from 'src/constant/httpStatusCode.enum'
import { isAxiosUnprocessableEntityError } from './utils'
import { AuthResponse } from 'src/types/auth.type'
import { clearLS, getAccessTokenFromLS, setAccessTokenToLS, setProfileToLS } from './auth'
import path from 'src/constant/path'
import config from 'src/constant/config'

class Http {
  instance: AxiosInstance
  private accessToken: string // Lưu access_Token trong class là nó lưu trên RAM
  constructor() {
    this.accessToken = getAccessTokenFromLS() // lấy accessToken từ LS
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000, // sau 10s thì nó sẽ ngừng gọi api
      headers: {
        'Content-Type': 'application/json' // Giao tiếp dạng json
      }
    })
    // Add request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.authorization = this.accessToken // Config access_token lên headers-authorization
          return config // return lại headers-authorization có access_token lên server
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    // Add response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // console.log(response)
        const { url } = response.config
        if (url === path.login || url === path.register) {
          const data = response.data as AuthResponse
          this.accessToken = data.data.access_token
          setAccessTokenToLS(this.accessToken) //  lưu vào localStorage
          setProfileToLS(data.data.user)
        } else if (url === path.logout) {
          this.accessToken = ''
          clearLS() // xóa accessToken khỏi localStorage
        }
        return response
      },
      function (error: AxiosError) {
        // Nếu mà phủ định trong đây thì error: (kiểu type sẽ là Never)
        // if (!isAxiosUnprocessableEntityError(error)) {
        //   console.log(error)
        // }
        // Dùng như nà sẽ bảo toàn về mặt type Error cho chúng ta
        if (error.response?.status !== HTTP_STATUS_CODE.UnprocessableEntity) {
          const data: any | undefined = error.response?.data
          const message = data?.message || error.message // đôi khi data.message nó không trả về thì sẽ lấy error.message
          toast.error(message)
        }
        if (error.response?.status === HTTP_STATUS_CODE.Unauthorized) {
          clearLS() // Clear localStorage
        }
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
