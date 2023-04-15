import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HOME_EN from 'src/locales/en/home.json'
import PRODUCT_EN from 'src/locales/en/product.json'
import HOME_VI from 'src/locales/vi/home.json'
import PRODUCT_VI from 'src/locales/vi/product.json'

export const locales = {
  en: 'English',
  vi: 'Tiếng Việt'
} as const

export const resources = {
  en: {
    // gọi là namespacee, bỏ các translation: {} trong `en` khai báo như kiểu bên dưới chúng ta dễ kiểm soát hơn
    home: HOME_EN, //
    product: PRODUCT_EN
  },
  vi: {
    home: HOME_VI,
    product: PRODUCT_VI
  }
}

// Khai báo một namespace Default
export const defaultNS = 'home' // export ra để dùng cho trong khai báo cái type của chúng ta

// Khi mà khai báo namespace trong resource thì chúng ta cũng nên khai báo ở dưới đây
// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  ns: ['home', 'product'], // Dùng bao nhiêu namespace thì chúng ta khai báo trong đây(NS dùng trong project)
  fallbackLng: 'vi', //  Trong trường hợp chúng ta không xác định được ngôn ngữ thì cho nó về 'vi'
  defaultNS, // Khai báo defaultNS
  interpolation: {
    escapeValue: false // Nên set là false vì thằng react nó đã có khả năng chống XSS khi render ra JSX rồi
  }
})
