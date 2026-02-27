import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HOME_VI from 'src/locales/vi/home.json'
import PRODUCT_VI from 'src/locales/vi/product.json'

export const locales = {
  en: 'English',
  vi: 'Tiếng Việt'
} as const

export const resources = {
  vi: {
    home: HOME_VI,
    product: PRODUCT_VI
  }
} as const

export const defaultNS = 'home'

// Khởi tạo i18n chỉ khi không phải test environment
// Sử dụng import.meta.env của Vite thay vì process.env
const isTestEnvironment =
  import.meta.env.MODE === 'test' || (typeof window !== 'undefined' && window.location.href.includes('vitest'))

if (!isTestEnvironment) {
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

/**
 * Lazy load non-default language resources.
 * Vietnamese (default) is eagerly loaded above.
 * English is loaded on-demand when user switches language.
 */
export async function loadLanguage(lng: string): Promise<void> {
  if (lng === 'vi') {
    // Vietnamese is already loaded statically
    await i18n.changeLanguage('vi')
    return
  }

  // Check if resources are already loaded (cached by i18n)
  if (i18n.hasResourceBundle(lng, 'home') && i18n.hasResourceBundle(lng, 'product')) {
    await i18n.changeLanguage(lng)
    return
  }

  // Dynamically import English translations
  const [homeModule, productModule] = await Promise.all([
    import('src/locales/en/home.json'),
    import('src/locales/en/product.json')
  ])

  i18n.addResourceBundle(lng, 'home', homeModule.default, true, true)
  i18n.addResourceBundle(lng, 'product', productModule.default, true, true)
  await i18n.changeLanguage(lng)
}

export default i18n
