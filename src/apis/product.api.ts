// khai báo APi cho Product

import { Product, ProductList, ProductListConfig } from 'src/types/product.type'
import { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

export interface SearchSuggestionsResponse {
  suggestions: string[]
  products: {
    _id: string
    name: string
    image: string
    price: number
  }[]
}

// Thêm API cho search suggestions
const getSearchSuggestions = (params: { q: string }) =>
  http.get<SuccessResponseApi<SearchSuggestionsResponse>>('products/search/suggestions', { params })

// Thêm API cho search history
const getSearchHistory = () => http.get<SuccessResponseApi<string[]>>('products/search/history')

// Thêm API để save search history
const saveSearchHistory = (body: { keyword: string }) =>
  http.post<SuccessResponseApi<any>>('products/search/save-history', body)

const productApi = {
  // truyền params đường dẫn vào
  getProducts: (params: ProductListConfig) => {
    return http.get<SuccessResponseApi<ProductList>>('/products', {
      params // gửi lên params là các queryParams của chúng ta
    })
  },
  getProductDetail: (id: string) => {
    return http.get<SuccessResponseApi<Product>>(`/products/${id}`)
  },
  getSearchSuggestions,
  getSearchHistory,
  saveSearchHistory
}

export default productApi
