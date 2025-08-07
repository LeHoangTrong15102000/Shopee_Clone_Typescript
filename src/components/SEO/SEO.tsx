import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

export default function SEO({
  title = 'Shopee Clone - Mua Sắm Online Số 1 Việt Nam',
  description = 'Mua sắm trực tuyến hàng triệu sản phẩm ở tất cả ngành hàng. Giá tốt & Ưu đãi. Mua và bán online trong 30 giây. Shopee Đảm Bảo | Freeship Xtra | Hoàn Xu Xtra',
  image = 'https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/26c9324913c021677768c36975d635ef.png',
  url,
  type = 'website'
}: SEOProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const fullTitle = title.includes('Shopee Clone') ? title : `${title} | Shopee Clone`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />

      {/* Open Graph Meta Tags */}
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta property='og:url' content={currentUrl} />
      <meta property='og:type' content={type} />
      <meta property='og:site_name' content='Shopee Clone' />

      {/* Twitter Card Meta Tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />

      {/* Additional Meta Tags */}
      <meta name='keywords' content='mua sắm online, shopee, thương mại điện tử' />
      <meta name='author' content='Shopee Clone' />
      <link rel='canonical' href={currentUrl} />
    </Helmet>
  )
}
