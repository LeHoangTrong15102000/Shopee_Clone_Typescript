// Viết những  cái liên quan đến uth

import { http, HttpResponse } from 'msw'
import config from 'src/constant/config'
import HTTP_STATUS_CODE from 'src/constant/httpStatusCode.enum'

export const access_token_1s =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTAzVDA3OjU4OjEzLjI1MVoiLCJpYXQiOjE3MDQyNjg2OTMsImV4cCI6MTcwNDI2ODY5NH0.zMLnzrH-oOGnzs3-XQBtBU_RQYiPB4w_OPX00e2UVVc'

export const refresh_token_1000days =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTAzVDA3OjU4OjEzLjI1MVoiLCJpYXQiOjE3MDQyNjg2OTMsImV4cCI6MTcxMjkwODY5M30.FucRo5A1RZt-0Ai9_zGa5FINoc2XGKsRgAI_q4CoIZM'

const loginRes = {
  message: 'Đăng nhập thành công',
  data: {
    access_token:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTA1VDE2OjA2OjM5Ljc4NVoiLCJpYXQiOjE3MDQ0NzA3OTksImV4cCI6MTcwNTQ3MDc5OH0.10E5lHBSckB8quToAsCrd-_q2JjaKcb2bLshLoFgKa8',
    expires: 999999,
    refresh_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTA1VDE2OjA2OjM5Ljc4NVoiLCJpYXQiOjE3MDQ0NzA3OTksImV4cCI6MTc5MDg3MDc5OX0.Df6Y1NheO7px2v4ZMStDXkfEcxqMEXLO98G85Apo4b8',
    expires_refresh_token: 86400000,
    user: {
      _id: '63e0f0386d7c620340850e6e',
      roles: ['User'],
      email: 'langtupro0456@gmail.com',
      createdAt: '2023-02-06T12:19:04.582Z',
      updatedAt: '2024-01-02T04:56:13.929Z',
      __v: 0,
      address: '126/13 đường 17 khu phố 5 phường Linh Trung Tp Thủ Đức',
      date_of_birth: '1990-04-27T17:00:00.000Z',
      name: 'Lê Hoàng Trọng 1',
      phone: '0773094710',
      avatar: '77d9909d-3161-4195-a67c-db4585f80e4b.jpg'
    }
  }
}

// Res khi mà refresh-access-token thành công
const refreshTokenRes = {
  message: 'Refresh Token thành công',
  data: {
    access_token:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzZTBmMDM4NmQ3YzYyMDM0MDg1MGU2ZSIsImVtYWlsIjoibGFuZ3R1cHJvMDQ1NkBnbWFpbC5jb20iLCJyb2xlcyI6WyJVc2VyIl0sImNyZWF0ZWRfYXQiOiIyMDI0LTAxLTA2VDE1OjM3OjE4LjExMVoiLCJpYXQiOjE3MDQ1NTU0MzgsImV4cCI6MTcwNTE2MDIzOH0.kad6gTSSI5NKIKcFPD6ILliiZk4U6Ar2kKmSj7zjISk'
  }
}

export const loginRequest = http.post(`${config.baseUrl}login`, () => {
  // return res(ctx.status(HTTP_STATUS_CODE.Ok), ctx.json(loginRes))
  return HttpResponse.json(loginRes, { status: HTTP_STATUS_CODE.Ok })
})

// Tạo thêm Refresh Token ở đây luôn

export const refreshToken = http.post(`${config.baseUrl}refresh-access-token`, () => {
  // return res(ctx.status(HTTP_STATUS_CODE.Ok), ctx.json(refreshTokenRes))
  return HttpResponse.json(refreshTokenRes, { status: HTTP_STATUS_CODE.Ok })
})

const authRequests = [loginRequest, refreshTokenRes]

export default authRequests
