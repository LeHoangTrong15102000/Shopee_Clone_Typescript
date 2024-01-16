import { rest } from 'msw'
import config from 'src/constant/config'
import HttpStatusCode from 'src/constant/httpStatusCode.enum'
import { access_token_1s } from './auth.msw'

const meRes = {
  message: 'Lấy người dùng thành công',
  data: {
    _id: '63e0f0386d7c620340850e6e',
    roles: ['User'],
    email: 'langtupro0456@gmail.com',
    createdAt: '2023-02-06T12:19:04.582Z',
    updatedAt: '2024-01-09T04:36:01.373Z',
    address: '126/13 đường 17 khu phố 5 phường Linh Trung Tp Thủ Đức',
    date_of_birth: '1990-04-17T17:00:00.000Z',
    name: 'Lê Hoàng Trọng',
    phone: '0773094710',
    avatar: '77d9909d-3161-4195-a67c-db4585f80e4b.jpg'
  }
}

const meRequest = rest.get(`${config.baseUrl}me`, (req, res, ctx) => {
  const access_token = req.headers.get('authorization')
  if (access_token === access_token_1s) {
    return res(
      ctx.status(HttpStatusCode.Unauthorized),
      ctx.json({
        message: 'Lỗi',
        data: {
          message: 'Token hết hạn',
          name: 'EXPIRED_TOKEN'
        }
      })
    )
  }
  return res(ctx.status(HttpStatusCode.Ok), ctx.json(meRes))
})

const userRequests = [meRequest]

export default userRequests
