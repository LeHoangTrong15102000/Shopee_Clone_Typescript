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
    home: HOME_EN,
    product: PRODUCT_EN
  },
  vi: {
    home: HOME_VI,
    product: PRODUCT_VI
  }
} as const

export const defaultNS = 'home'

// Chỉ khởi tạo i18n nếu không phải test environment
if (typeof window !== 'undefined' && !window?.location?.href?.includes('vitest')) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'vi',
    ns: ['home', 'product'],
    fallbackLng: 'vi',
    defaultNS,
    interpolation: {
      escapeValue: false // react already does escaping
    }
  })
}

export default i18n
