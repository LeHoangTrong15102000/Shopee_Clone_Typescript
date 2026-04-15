# PHỎNG VẤN NEXT.JS — Middle Frontend Developer (3-5 năm)

> **Ngày nghiên cứu**: 2026-04-15  
> **Phạm vi**: Next.js Core, Rendering Strategies, Data Fetching, API Routes, SEO, Middleware, Performance, Deployment  
> **Bám sát JD**: React/Next, SSR/SSG/CSR, SEO, API integration, tối ưu hiệu năng, responsive, coding standards  
> **Mục tiêu**: Giúp bạn trả lời tốt cả câu hỏi lý thuyết lẫn tình huống kỹ thuật

---

## MỤC LỤC

- [1) Next.js Core](#1-nextjs-core)
- [2) Rendering Strategies: SSR/SSG/ISR/CSR](#2-rendering-strategies-ssrssgisrcsr)
- [3) Data Fetching](#3-data-fetching)
- [4) API Routes và Route Handlers](#4-api-routes-và-route-handlers)
- [5) Image Optimization](#5-image-optimization)
- [6) SEO trong Next.js](#6-seo-trong-nextjs)
- [7) Middleware](#7-middleware)
- [8) Performance Optimization](#8-performance-optimization)
- [9) Deployment và Production](#9-deployment-và-production)
- [10) App Router nâng cao (RSC, Server Actions, Streaming)](#10-app-router-nâng-cao-rsc-server-actions-streaming)
- [11) Câu hỏi tình huống nhà tuyển dụng hay hỏi](#11-câu-hỏi-tình-huống-nhà-tuyển-dụng-hay-hỏi)
- [12) Checklist ôn phỏng vấn nhanh](#12-checklist-ôn-phỏng-vấn-nhanh)

---

## 1) Next.js Core

### Câu hỏi hay gặp

#### Q1. Next.js là gì? Vì sao chọn Next.js thay vì React thuần?
**Trả lời ngắn gọn:**
- React là UI library; Next.js là full-stack React framework.
- Next.js có sẵn routing, SSR/SSG/ISR, API routes/route handlers, tối ưu ảnh, tối ưu SEO, code splitting mặc định.
- Phù hợp app production cần hiệu năng + SEO.

#### Q2. Pages Router và App Router khác nhau như thế nào?
| Tiêu chí | Pages Router (`/pages`) | App Router (`/app`) |
|---|---|---|
| Component mặc định | Client-oriented | Server Components mặc định |
| Data fetching | `getServerSideProps`, `getStaticProps` | `async/await` trực tiếp trong Server Components |
| Layout | `_app.tsx`, `_document.tsx` | `layout.tsx` lồng nhau theo route |
| Loading/Error | Thủ công | `loading.tsx`, `error.tsx` theo segment |
| Streaming | Hạn chế | Tốt (React 18+) |

#### Q3. File-based routing trong App Router hoạt động ra sao?
```txt
app/
  page.tsx                  -> /
  products/page.tsx         -> /products
  products/[id]/page.tsx    -> /products/:id
  (marketing)/about/page.tsx -> /about (route group, không vào URL)
  @modal/(..)products/[id]/page.tsx -> intercepting route
```

---

## 2) Rendering Strategies: SSR/SSG/ISR/CSR

#### Q1. Khi nào chọn SSR, SSG, ISR, CSR?
| Strategy | Render lúc nào | SEO | Khi dùng |
|---|---|---|---|
| SSG | Build time | Rất tốt | Blog, trang tĩnh |
| ISR | Build + revalidate | Tốt | Product pages, news |
| SSR | Mỗi request | Tốt | Nội dung cá nhân hóa, dashboard |
| CSR | Browser | Kém hơn | Admin nội bộ, widget client-heavy |

#### Q2. Giải thích ISR với ví dụ App Router
```tsx
// app/products/[id]/page.tsx
export const revalidate = 60;

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    next: { revalidate: 60 },
  }).then(r => r.json());

  return <h1>{product.name}</h1>;
}
```

#### Q3. Nhà tuyển dụng hỏi: “Tại sao không dùng SSR cho tất cả?”
**Điểm trả lời tốt:**
- SSR tốn tài nguyên server hơn.
- Với data ít đổi, SSG/ISR cho TTFB tốt hơn, scale tốt hơn qua CDN.
- Nên chọn theo đặc thù dữ liệu, không “one-size-fits-all”.

---

## 3) Data Fetching

#### Q1. App Router fetch data khác Pages Router thế nào?
- Pages Router: dùng `getServerSideProps/getStaticProps/getStaticPaths`.
- App Router: fetch trực tiếp trong Server Components + cache control bằng `cache`, `revalidate`, `next`.

```tsx
// SSR-like
await fetch(url, { cache: "no-store" });

// SSG-like
await fetch(url, { cache: "force-cache" });

// ISR-like
await fetch(url, { next: { revalidate: 120 } });
```

#### Q2. `generateStaticParams` dùng khi nào?
Dùng để khai báo trước danh sách dynamic routes ở build time trong App Router.

```tsx
export async function generateStaticParams() {
  const products = await fetch("https://api.example.com/products").then(r => r.json());
  return products.map((p: { id: string }) => ({ id: p.id }));
}
```

#### Q3. Phân biệt Server Component fetch và Client Component fetch
- Server Component: tốt cho SEO, bảo mật token server, giảm JS gửi xuống client.
- Client Component: dùng khi cần tương tác realtime trên client, optimistic UI.

---

## 4) API Routes và Route Handlers

#### Q1. Route Handlers trong App Router là gì?
Là API endpoint trong `app/api/**/route.ts` dùng Web `Request/Response`.

```ts
// app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([{ id: 1, name: "A" }]);
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ ok: true, body }, { status: 201 });
}
```

#### Q2. Server Actions vs Route Handlers?
- **Server Actions**: tốt cho form mutation nội bộ app.
- **Route Handlers**: tốt khi cần endpoint public, webhook, tích hợp external services.

#### Q3. Câu hỏi follow-up hay gặp: “Bạn bảo vệ API route như nào?”
**Điểm nên nói:**
- Auth check (session/JWT), RBAC, input validation (Zod), rate limit, audit logs.

---

## 5) Image Optimization

#### Q1. `next/image` tối ưu ảnh như nào?
- Resize theo viewport, lazy load mặc định, chuyển định dạng tối ưu (WebP/AVIF), giảm CLS khi có width/height hoặc `fill`.

```tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
/>;
```

#### Q2. `priority` dùng khi nào?
Chỉ dùng cho ảnh above-the-fold (thường là hero/LCP image), không dùng tràn lan.

#### Q3. Cấu hình domain ảnh ngoài?
```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.example.com" },
    ],
  },
};
```

---

## 6) SEO trong Next.js

#### Q1. Tại sao Next.js tốt cho SEO hơn SPA thuần CSR?
- HTML có nội dung sẵn từ server (SSR/SSG), crawler đọc nhanh hơn.
- Có metadata API, sitemap, robots, structured data thuận tiện.

#### Q2. Metadata API trong App Router
```tsx
// app/products/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await fetch(`https://api.example.com/products/${params.id}`).then(r => r.json());
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.image] },
  };
}
```

#### Q3. Tạo sitemap và robots
```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://example.com", priority: 1 }];
}

// app/robots.ts
export default function robots() {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://example.com/sitemap.xml" };
}
```

---

## 7) Middleware

#### Q1. Middleware trong Next.js dùng để làm gì?
- Auth gate, redirect, rewrite, geolocation routing, AB testing nhẹ.

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");
  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
```

#### Q2. Giới hạn của Middleware?
- Chạy trên Edge runtime, không nên làm logic nặng.
- Cần giới hạn `matcher` để tránh ảnh hưởng toàn bộ traffic.

---

## 8) Performance Optimization

#### Q1. Bạn tối ưu Next.js app theo checklist nào?
1. Chọn đúng chiến lược render (SSG/ISR trước, SSR khi cần).
2. Tách Client/Server Components hợp lý.
3. Dùng dynamic import cho module nặng.
4. Tối ưu ảnh bằng `next/image`.
5. Đo bundle bằng `@next/bundle-analyzer`.
6. Theo dõi Core Web Vitals (LCP/INP/CLS).

#### Q2. Dynamic import trong Next.js
```tsx
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("./Chart"), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
});
```

#### Q3. Câu hỏi tình huống: “Trang rất chậm, bạn làm gì trước?”
**Cách trả lời tốt:**  
Đo trước (Lighthouse, Web Vitals, profiler) -> xác định bottleneck -> sửa theo dữ liệu.  
Không nói “thêm useMemo/useCallback” khi chưa profile.

---

## 9) Deployment và Production

#### Q1. Vercel vs Self-hosting?
| Tiêu chí | Vercel | Self-host |
|---|---|---|
| Setup | Nhanh | Phức tạp hơn |
| Chi phí scale | Có thể cao | Kiểm soát tốt hơn |
| DX | Rất tốt | Tùy đội DevOps |

#### Q2. Standalone output để tối ưu Docker
```js
// next.config.js
module.exports = { output: "standalone" };
```

#### Q3. Env vars trong Next.js
- `NEXT_PUBLIC_*` lộ ra client bundle.
- Secret (`DB_URL`, `JWT_SECRET`) chỉ giữ server-side.

---

## 10) App Router nâng cao (RSC, Server Actions, Streaming)

#### Q1. Server Components vs Client Components
| | Server Component | Client Component |
|---|---|---|
| Chạy | Server | Browser |
| Hooks state/effect | Không | Có |
| Event handler | Không | Có |
| Truy cập secret/DB trực tiếp | Có | Không |
| JS gửi xuống client | Ít | Nhiều hơn |

#### Q2. Server Actions là gì?
- Hàm chạy server được gọi trực tiếp từ form/action flow.
- Tốt cho mutate data + revalidate cache.

```ts
// app/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") || "");
  // save db...
  revalidatePath("/products");
}
```

#### Q3. Streaming giúp gì?
- Trả HTML từng phần thay vì đợi toàn bộ xong.
- UX tốt hơn với `loading.tsx` + `Suspense`.

---

## 11) Câu hỏi tình huống nhà tuyển dụng hay hỏi

### Tình huống 1
**Hỏi:** “Trang product detail cần SEO tốt nhưng giá đổi liên tục. Chọn SSR hay ISR?”  
**Trả lời mẫu:**  
Mình ưu tiên ISR với `revalidate` ngắn (ví dụ 60s) cho đa số nội dung + fetch phần giá realtime ở client/server tùy criticality. Nếu giá yêu cầu chính xác theo từng request (flash sale), chuyển đoạn đó sang SSR hoặc dynamic fetch `no-store`.

### Tình huống 2
**Hỏi:** “Bạn xử lý auth trong Next.js App Router thế nào?”  
**Trả lời mẫu:**  
Middleware kiểm tra route protected + session check ở server layer + route handlers xác thực lại quyền. Client không được tin cậy tuyệt đối.

### Tình huống 3
**Hỏi:** “Làm sao giảm bundle size 30%?”  
**Trả lời mẫu:**  
Đo bundle analyzer -> tách thư viện nặng bằng dynamic import -> thay lib nặng bằng alternative nhẹ -> đẩy logic sang Server Components -> kiểm tra tree-shaking imports.

### Tình huống 4
**Hỏi:** “SEO kỹ thuật bạn sẽ triển khai gì trong 1 dự án thương mại điện tử?”  
**Trả lời mẫu:**  
Metadata động theo sản phẩm, OpenGraph, JSON-LD Product schema, sitemap tự động, canonical tags, tối ưu LCP ảnh sản phẩm.

---

## 12) Checklist ôn phỏng vấn nhanh

- [ ] Giải thích rõ trade-off giữa SSR/SSG/ISR/CSR (không trả lời chung chung)
- [ ] Viết được ví dụ Route Handler `GET/POST`
- [ ] Hiểu rõ Server Components vs Client Components
- [ ] Trình bày được 1 flow auth chuẩn trong Next.js
- [ ] Biết cách tối ưu ảnh với `next/image` (`sizes`, `priority`, CLS)
- [ ] Nêu được 1 quy trình optimize performance dựa trên đo lường
- [ ] Nắm Metadata API, sitemap, robots
- [ ] Trả lời được deployment strategy (Vercel vs self-host)

---

## Gợi ý cách trả lời để “điểm cao” (Middle level)

1. Trả lời theo cấu trúc: **Khi nào dùng -> Vì sao -> Trade-off -> Ví dụ thực tế**.  
2. Nói rõ các giới hạn/edge cases thay vì chỉ nêu “best practice”.  
3. Kết thúc bằng trải nghiệm thực tế từ dự án (điều này giúp phân biệt junior vs middle).

---

*Tài liệu liên quan:*  
- `docs/ZZ_55_REACT_NEXTJS_INTERVIEW_PREPARATION.md` (performance + scenarios + behavioral)  
- `docs/ZZ_56_REACTJS_CORE_INTERVIEW.md` (React core chuyên sâu)
