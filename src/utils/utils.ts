/* eslint-disable import/no-named-as-default-member */
import axios, { AxiosError } from 'axios'
import HTTP_STATUS_CODE from 'src/constant/httpStatusCode.enum'

// Hàm kiểm tra Error từ Axios
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}

// genericType <FormError> khi mà server trả về lỗi
export function isAxiosUnprocessableEntityError<FormError>(error: unknown): error is AxiosError<FormError> {
  // Khi đã có lỗi rồi mình muốn kiểm tra xem lỗi đó có phải là lỗi 422 ?
  return isAxiosError(error) && error.response?.status === HTTP_STATUS_CODE.UnprocessableEntity
}

// Hàm kiểm tra Unauthorized

// Hàm kiểm tra ExpiredTokenError()

// Tạo 2 function để tính convert giá tiền và số lượt bán trong productList
export function formatCurrency(currency: number) {
  return new Intl.NumberFormat('de-DE').format(currency)
}

export function formatNumberToSocialStyle(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  })
    .format(value)
    .replace('.', ',')
    .toLowerCase()
}

// Function tính tỉ lệ giá giảm trong productDetail
export const rateSale = (original: number, sale: number) => {
  return Math.round(((original - sale) / original) * 100) + '%'
}

// func xóa các kí tự đặc biệt trên bàn phím
const removeSpecialCharacter = (str: string) =>
  // eslint-disable-next-line no-useless-escape
  str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '')

// Tạo 1 func nhận vào cái name và cái id cuối cùng nó generate ra cái URL như này -> Điện-thoại-Apple-Iphone-12-64GB--Hàng-chính-hãng-VNA-i-60afb1c56ef5b902180aacb8

// Thằng này là phải truyền vào hàm với params giống với params đã được khai báo ở đây, này là truyền lên 1 cái object
export const generateNameId = ({ name, id }: { name: string; id: string }) => {
  return removeSpecialCharacter(name).replace(/\s/g, '-') + `-i-${id}`
}

// func get cái ID từ cái URL như này -> get cái ID ra để call Api gọi cái sản phẩm
export const getIdFromNameId = (nameId: string) => {
  const arr = nameId.split('-i-') // split cái chuỗi theo '-i.' -> được cái arr các phần tử
  return arr[arr.length - 1] // arr lấy cái item cuối cùng
}
