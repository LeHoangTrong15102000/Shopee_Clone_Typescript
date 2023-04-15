// khai báo APi cho Product

import { Product, ProductList, ProductListConfig } from 'src/types/product.type'
import { SuccessResponseApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const productApi = {
  // truyền params đường dẫn vào
  getProducts: (params: ProductListConfig) => {
    return http.get<SuccessResponseApi<ProductList>>('/products', {
      params // gửi lên params là các queryParams của chúng ta
    })
  },
  getProductDetail: (id: string) => {
    return http.get<SuccessResponseApi<Product>>(`/products/${id}`)
  }
}

export default productApi
