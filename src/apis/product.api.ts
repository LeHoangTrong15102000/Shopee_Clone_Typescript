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

// Interface cho API options với AbortSignal
export interface ApiOptions {
  signal?: AbortSignal
}

// Thêm API cho search suggestions với AbortSignal support
const getSearchSuggestions = (params: { q: string }, options?: ApiOptions) =>
  http.get<SuccessResponseApi<SearchSuggestionsResponse>>('products/search/suggestions', {
    params,
    signal: options?.signal
  })

// Thêm API cho search history với AbortSignal support
const getSearchHistory = (options?: ApiOptions) =>
  http.get<SuccessResponseApi<string[]>>('products/search/history', {
    signal: options?.signal
  })

// Thêm API để save search history với AbortSignal support
const saveSearchHistory = (body: { keyword: string }, options?: ApiOptions) =>
  http.post<SuccessResponseApi<any>>('products/search/save-history', body, {
    signal: options?.signal
  })

const productApi = {
  // truyền params đường dẫn vào với AbortSignal support
  getProducts: (params: ProductListConfig, options?: ApiOptions) => {
    return http.get<SuccessResponseApi<ProductList>>('/products', {
      params, // gửi lên params là các queryParams của chúng ta
      signal: options?.signal
    })
  },

  getProductDetail: (id: string, options?: ApiOptions) => {
    return http.get<SuccessResponseApi<Product>>(`/products/${id}`, {
      signal: options?.signal
    })
  },

  getSearchSuggestions,
  getSearchHistory,
  saveSearchHistory
}

export default productApi
