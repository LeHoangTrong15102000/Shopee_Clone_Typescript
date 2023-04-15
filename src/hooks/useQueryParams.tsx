import { useSearchParams } from 'react-router-dom'
import queryString from 'query-string'

const useQueryParams = () => {
  // Lấy ra các giá trị params sau dấu `?` ví dụ ?page=1&limit=20
  const [searchParams] = useSearchParams()
  return Object.fromEntries([...searchParams]) // biến cái mảng con trong 1 mảng cha thành key: value tương ứng trong object
  // const parsed = queryString.parse(location.search)
  // return parsed
}

export default useQueryParams
