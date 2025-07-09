// Đường dẫn này chỉ có thể đọc thôi, đánh tránh trong quá trình code gõ sai
const path = {
  home: '/',
  products: '/products',
  user: '/user',
  profile: '/user/profile',
  changePassword: '/user/password',
  historyPurchases: '/user/purchase',
  login: '/login',
  register: '/register',
  logout: '/logout',
  categories: '/categories',
  productDetail: ':nameId', // sửa lại thành nameId cho nó đồng bộ với logic productDetail, tuy không để dấu '/' nhưng nó vẫn hiểu là có dấu /
  cart: '/cart' // dường dẫn trên UI do chúng ta tự tạo ra để phù hợp
} as const

export default path
