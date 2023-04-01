import { useSearchParams } from 'react-router-dom'
import queryString from 'query-string'

const useQueryParams = () => {
  const [searchParams] = useSearchParams()
  return Object.fromEntries([...searchParams]) // biến cái mảng con thành key: value tương ứng trong object
  // const parsed = queryString.parse(location.search)
  // return parsed
}

export default useQueryParams
