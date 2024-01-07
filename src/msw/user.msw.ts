// Viết những cái file liên quan đến user
import { HttpResponse, http,rest } from 'msw'
import { access_token_1s } from './auth.msw'
import HTTP_STATUS_CODE from 'src/constant/httpStatusCode.enum'
import config from 'src/constant/config'

const meRes = {
  message: 'Lấy người dùng thành công',
  data: {
    _id: '63e0f0386d7c620340850e6e',
    roles: ['User'],
    email: 'langtupro0456@gmail.com',
    createdAt: '2023-02-06T12:19:04.582Z',
    updatedAt: '2024-01-06T10:45:26.290Z',
    address: '126/13 đường 17 khu phố 5 phường Linh Trung Tp Thủ Đức',
    date_of_birth: '1990-04-27T17:00:00.000Z',
    name: 'Lê Hoàng Trọng',
    phone: '0773094710',
    avatar: '77d9909d-3161-4195-a67c-db4585f80e4b.jpg'
  }
}

const meRequest = rest.get(`${config.baseUrl}me`, (req, res, ctx) => {
  const access_token = req.headers.get('authorization')
  if (access_token === access_token_1s) {
    return res(
      // ctx.status(HTTP_STATUS_CODE.Unauthorized),
      ctx.json({
        message: 'Lỗi',
        data: {
          message: 'Token hết hạn',
          name: 'EXPIRED_TOKEN'
        }
      })
    )
    // return HttpResponse.json({
    //   message: 'Lỗi',
    //   data: {
    //     message: 'Token hết hạn',
    //     name: 'EXPIRED_TOKEN'
    //   }
    // })
  }
  return res(ctx.status(HTTP_STATUS_CODE.Ok), ctx.json(meRes))
  // return HttpResponse.json(meRes)
})

const userRequests = [meRequest]

export default userRequests
