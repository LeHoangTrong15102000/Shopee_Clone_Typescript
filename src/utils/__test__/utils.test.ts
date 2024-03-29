import { describe, it, expect } from 'vitest'
import { isAxiosError, isAxiosUnprocessableEntityError } from '../utils'
import { AxiosError, AxiosResponse } from 'axios'
import HTTP_STATUS_CODE from 'src/constant/httpStatusCode.enum'

// describe dùng để mô tả tập hợp các ngữ cảnh hoặc đơn 1 vị cần test: ví dụ function, component
// Thì trong file này đơn vị là hàm isAxiosError
describe('isAxiosError', () => {
  // it dùng để ghi chú trường hợp cần test
  it('isAxiosError trả về boolean', () => {
    // expect() dùng để mong đợi giá trị trả về
    expect(isAxiosError(new Error())).toBe(false) // Nếu nó quăng ra cái Error bình thường thì là false
    expect(isAxiosError(new AxiosError())).toBe(true)
  })
})

// Test AxiosUnprocessEntity
describe('isAxiosUnprocessableEntityError', () => {
  it('isAxiosUnprocessableEntityError trả về boolean', () => {
    expect(isAxiosUnprocessableEntityError(new Error())).toBe(false) // truyền Error bình thường vào vẫn là false
    expect(
      // Để lấy ra được thằng status bên trong AxiosError thì ta đọc ngược lại mã nguồn của nó -> Thì cái chúng ta quann tâm chính là thằng `response`(chứa status) của AxiosError -> Bởi vì cái function chúng ta viết trong ứng dụng chỉ check cái `response` mà thôi
      isAxiosUnprocessableEntityError(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: HTTP_STATUS_CODE.InternalServerError,
          data: null
        } as AxiosResponse)
      )
    ).toBe(false)
    expect(
      isAxiosUnprocessableEntityError(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: HTTP_STATUS_CODE.UnprocessableEntity,
          data: null
        } as AxiosResponse)
      )
    ).toBe(true)
  })
})
