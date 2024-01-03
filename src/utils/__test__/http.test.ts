import { beforeEach, describe, expect, it } from 'vitest'
import { Http } from '../http'
import HTTP_STATUS_CODE from 'src/constant/httpStatusCode.enum'
import { setAccessTokenToLS, setRefreshTokenToLS } from 'src/utils/auth'

describe('http axios', () => {
  // Tạo một instance mới tránh ảnh hưởng từ thằng instance cũ
  let http = new Http().instance
  beforeEach(() => {
    // Mỗi lần trước khi chạy it() thì tạo mới thằng http() để reset cái http trước đó
    localStorage.clear()
    http = new Http().instance
  })

  const access_token_1s =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTAzVDA3OjU4OjEzLjI1MVoiLCJpYXQiOjE3MDQyNjg2OTMsImV4cCI6MTcwNDI2ODY5NH0.zMLnzrH-oOGnzs3-XQBtBU_RQYiPB4w_OPX00e2UVVc'

  const refresh_token_1000days =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTAzVDA3OjU4OjEzLjI1MVoiLCJpYXQiOjE3MDQyNjg2OTMsImV4cCI6MTcxMjkwODY5M30.FucRo5A1RZt-0Ai9_zGa5FINoc2XGKsRgAI_q4CoIZM'

  // Hàm xử lý lỗi 401 Auth Request
  function getAsyncAuthRequest() {
    return Promise.reject(new Error('Unauthorized User'))
  }

  it('Gọi API', async () => {
    // Không nên đụng đến thư mục Apis
    // Vì chúng ta test riêng file http thì chỉ nên dùng `http` thôi
    // Vì lỡ như file Apis có thay đổi gì đó thì cũng không ảnh hưởng đến file test này
    const res = await http.get('products')
    expect(res.status).toBe(HTTP_STATUS_CODE.Ok)
  })

  // Test những cái request cần access_token
  it('Auth Request', async () => {
    // Nên có 1 cái account test
    // Và 1 server test
    await http.post('login', {
      email: 'langtupro0456@gmail.com',
      password: '123123123'
    })
    const res = await http.get('me')
    expect(res.status).toBe(HTTP_STATUS_CODE.Ok)
    await expect(() => getAsyncAuthRequest()).rejects.toThrowError('Unauthorized User')
  })

  // it('Refresh Token', async () => {
  //   // dưới đây cũng phải tạo một cái http mới sau khi thằng beforeEach() nó đã reset cái http() trước đó rồi
  //   // Không cần phải đăng nhập nữa -> Vì Chúng ta đã mock sẵn access_token rồi, vì khi mà đăng nhập lần nũa thì phải set lại refresh_token
  //   setAccessTokenToLS(access_token_1s)
  //   setRefreshTokenToLS(refresh_token_30days)
  //   const httpNew = new Http().instance
  //   const res = await httpNew.get('me')
  //   expect(res.status).toBe(HTTP_STATUS_CODE.Ok)
  // })

  it('Refresh Token', async () => {
    setAccessTokenToLS(access_token_1s)
    setRefreshTokenToLS(refresh_token_1000days)
    const httpNew = new Http().instance
    const res = await httpNew.get('me')
    // console.log('Lấy dự liệu khi refresh token thành công', res)
    expect(res.status).toBe(HTTP_STATUS_CODE.Ok)
    await expect(() => getAsyncAuthRequest()).rejects.toThrowError('Unauthorized User')
  })
})
