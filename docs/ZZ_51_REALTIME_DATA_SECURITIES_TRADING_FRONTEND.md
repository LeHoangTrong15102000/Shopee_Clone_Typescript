# 📈 PHÂN TÍCH CHUYÊN SÂU: XỬ LÝ DỮ LIỆU THỜI GIAN THỰC TRÊN FRONTEND ỨNG DỤNG CHỨNG KHOÁN

> **Ngày phân tích**: 2026-03-09
> **Mục tiêu**: Phân tích toàn diện kiến trúc frontend cho ứng dụng giao dịch chứng khoán — giao thức giao tiếp, chiến lược fetch/render dữ liệu real-time, tối ưu hiệu năng, đảm bảo độ chính xác dữ liệu
> **Đối tượng**: Frontend Developer 2+ năm kinh nghiệm, chuẩn bị phỏng vấn domain chứng khoán/tài chính

---

## 📑 MỤC LỤC

1. [Tổng Quan Thách Thức](#1-tổng-quan-thách-thức)
2. [Giao Thức Giao Tiếp FE-BE](#2-giao-thức-giao-tiếp-fe-be)
3. [Kiến Trúc Luồng Dữ Liệu Real-Time](#3-kiến-trúc-luồng-dữ-liệu-real-time)
4. [Chiến Lược Fetch & Render Dữ Liệu Tần Suất Cao](#4-chiến-lược-fetch--render-dữ-liệu-tần-suất-cao)
5. [State Management Cho Real-Time Data](#5-state-management-cho-real-time-data)
6. [Virtual Scrolling & Windowing](#6-virtual-scrolling--windowing)
7. [Canvas/WebGL — Khi Nào Nên Dùng?](#7-canvaswebgl--khi-nào-nên-dùng)
8. [Đảm Bảo Độ Chính Xác Dữ Liệu](#8-đảm-bảo-độ-chính-xác-dữ-liệu)
9. [Performance Metrics & Monitoring](#9-performance-metrics--monitoring)
10. [Code Examples Thực Tế](#10-code-examples-thực-tế)
11. [Tổng Kết & Recommendations](#11-tổng-kết--recommendations)
12. [Tài Liệu Tham Khảo](#12-tài-liệu-tham-khảo)

---

## 1. Tổng Quan Thách Thức

### 🎯 Tại sao frontend chứng khoán khác biệt?

Ứng dụng chứng khoán là một trong những bài toán **khó nhất** của frontend development vì:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ĐẶC THÙ ỨNG DỤNG CHỨNG KHOÁN                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📊 Dữ liệu KHỔNG LỒ:  10,000 - 100,000+ updates/giây                │
│  ⚡ Yêu cầu REAL-TIME:  Độ trễ < 100ms (glass-to-glass)               │
│  🎯 Độ chính xác 100%:  Sai 1 số = mất tiền thật                      │
│  🖥️ Render MƯỢT MÀ:    60fps liên tục, không được drop frame           │
│  🔄 Dữ liệu LIÊN TỤC:  Không có "idle time" trong giờ giao dịch       │
│  💰 Hậu quả NGHIÊM TRỌNG: Lag/sai → nhà đầu tư mất tiền, công ty     │
│     mất uy tín, có thể bị kiện                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 📊 So sánh với ứng dụng web thông thường

| Tiêu chí | Web App Thông Thường | Ứng Dụng Chứng Khoán |
|----------|---------------------|----------------------|
| Tần suất update | 0.1 - 1 req/giây | 10,000 - 100,000+ msg/giây |
| Độ trễ chấp nhận | 1-3 giây | < 100ms |
| Độ chính xác | Cho phép eventual consistency | Phải chính xác tuyệt đối |
| FPS target | 30fps đủ tốt | 60fps bắt buộc |
| Memory budget | 500MB+ OK | < 200MB (nhiều tab mở) |
| Hậu quả lỗi | UX tệ | Mất tiền thật |

---

## 2. Giao Thức Giao Tiếp FE-BE

### 🔍 So sánh chi tiết các giao thức

| Giao Thức | Hướng | Latency | Throughput | Browser Support | Use Case Chứng Khoán |
|-----------|-------|---------|------------|-----------------|----------------------|
| **WebSocket** | Full-duplex ↔️ | Thấp nhất | Cao nhất | ✅ Tất cả | ⭐ Order book, ticker, trade execution |
| **SSE** | Server → Client ↗️ | Thấp | Trung bình | ✅ Tất cả | Tin tức, thông báo (read-only) |
| **gRPC-Web** | Request/Response | Trung bình | Cao | ⚠️ Cần proxy | Backend microservices (không phù hợp browser) |
| **HTTP/2 Streaming** | Multiplexed | Trung bình | Trung bình | ✅ Tất cả | REST fallback, initial snapshots |
| **Long Polling** | Simulated push | Cao | Thấp | ✅ Tất cả | ❌ Không phù hợp chứng khoán |

### ⭐ WebSocket — Lựa chọn số 1 cho chứng khoán

**Tại sao WebSocket là chuẩn ngành?**

Binance, Coinbase, OKX, Interactive Brokers, Kraken — tất cả đều dùng WebSocket cho streaming market data.

```
┌──────────────────────────────────────────────────────────────────┐
│                    WEBSOCKET FLOW                                 │
│                                                                   │
│  Client                              Server                      │
│    │                                    │                         │
│    │──── HTTP Upgrade Request ─────────>│                         │
│    │<─── 101 Switching Protocols ───────│                         │
│    │                                    │                         │
│    │<════ Persistent TCP Connection ════│                         │
│    │                                    │                         │
│    │<─── ticker:AAPL {price: 150.25} ──│  (push liên tục)        │
│    │<─── depth:AAPL {bids:[], asks:[]} │                         │
│    │<─── trade:AAPL {qty: 100} ────────│                         │
│    │                                    │                         │
│    │──── subscribe:GOOGL ──────────────>│  (client gửi lệnh)     │
│    │──── place_order:{...} ────────────>│                         │
│    │<─── order_ack:{status: filled} ───│                         │
│    │                                    │                         │
└──────────────────────────────────────────────────────────────────┘
```

**Ưu điểm WebSocket:**
- Full-duplex: client vừa nhận data vừa gửi lệnh mua/bán trên cùng 1 connection
- Latency cực thấp: không có HTTP overhead cho mỗi message
- Persistent connection: không cần handshake lại
- Binary frame support: có thể gửi Protobuf/MessagePack thay vì JSON

**Nhược điểm WebSocket:**
- Không có built-in message ordering guarantee khi reconnect
- Cần tự implement heartbeat, reconnection logic
- Load balancer cần hỗ trợ sticky sessions hoặc WebSocket-aware routing
- Firewall/proxy có thể block WebSocket connections

### 🔄 SSE — Phù hợp cho dữ liệu read-only

SSE (Server-Sent Events) phù hợp cho các luồng dữ liệu **một chiều** từ server:

```typescript
// SSE phù hợp cho: tin tức thị trường, thông báo, market summary
const eventSource = new EventSource('/api/market-news/stream')

eventSource.addEventListener('news', (event) => {
  const news = JSON.parse(event.data)
  // Render tin tức mới
})

eventSource.addEventListener('market-summary', (event) => {
  const summary = JSON.parse(event.data)
  // Update tổng quan thị trường
})
```

**Khi nào dùng SSE thay WebSocket?**
- News feed, market summary (không cần gửi data ngược lại server)
- Fallback khi WebSocket bị block bởi firewall/proxy
- Tự động reconnect (built-in, không cần code thêm)

### 🏗️ Kiến trúc kết hợp — Best Practice thực tế

Trong thực tế, ứng dụng chứng khoán **KHÔNG** chỉ dùng 1 giao thức:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  KIẾN TRÚC GIAO THỨC KẾT HỢP                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  WebSocket (primary):                                               │
│    ├── Order book depth updates (real-time)                         │
│    ├── Ticker/price streaming                                       │
│    ├── Trade execution reports                                      │
│    └── Order placement & cancellation                               │
│                                                                     │
│  REST/HTTP (secondary):                                             │
│    ├── Initial data snapshots (order book, portfolio)               │
│    ├── Historical candle data                                       │
│    ├── Account info, balance                                        │
│    └── Order submission (backup khi WebSocket down)                 │
│                                                                     │
│  SSE (optional):                                                    │
│    ├── Market news feed                                             │
│    ├── System notifications                                         │
│    └── Market status updates                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 📦 Binary Protocol vs JSON

| Format | Encode/Decode Speed | Payload Size | Cần Schema? | Phù hợp khi |
|--------|-------------------|--------------|-------------|-------------|
| **JSON** | Chậm nhất (text parsing) | Lớn nhất | Không | < 50k msg/giây, prototype nhanh |
| **MessagePack** | Nhanh | Nhỏ hơn JSON 20-30% | Không | Middle ground tốt |
| **Protocol Buffers** | Rất nhanh | Nhỏ hơn JSON 60-80% | Có (.proto) | > 50k msg/giây, typed data |
| **FlatBuffers** | Nhanh nhất (zero-copy) | Tương tự Protobuf | Có | Ultra-low-latency |

> **Thực tế**: Binance, Coinbase đều dùng **JSON** qua WebSocket cho public API. JSON đủ tốt cho hầu hết trading frontend. Chỉ cần binary protocol khi xử lý > 50k messages/giây.

---

## 3. Kiến Trúc Luồng Dữ Liệu Real-Time

### 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KIẾN TRÚC TỔNG THỂ                                   │
│                                                                             │
│  ┌──────────┐    WebSocket     ┌──────────────┐    postMessage    ┌──────┐ │
│  │  Server   │ ═══════════════>│  Web Worker   │ ═══════════════> │ Main │ │
│  │ (Exchange)│                 │  (Dedicated)  │                  │Thread│ │
│  └──────────┘                 │               │                  │      │ │
│       │                       │ • Parse JSON  │                  │ rAF  │ │
│       │  REST (snapshots)     │ • Apply deltas│    ┌──────────┐  │ loop │ │
│       │─────────────────────> │ • Sort book   │───>│  Zustand  │  │  │   │ │
│       │                       │ • Aggregate   │    │  Store    │  │  ▼   │ │
│       │                       │ • Validate seq│    └──────────┘  │ DOM  │ │
│       │                       └──────────────┘                   │Update│ │
│       │                                                          └──────┘ │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Rendering Layer                                                     │   │
│  │  ┌─────────┐  ┌──────────────┐  ┌───────────────┐  ┌────────────┐  │   │
│  │  │  DOM    │  │ TanStack     │  │ Canvas 2D     │  │ Lightweight│  │   │
│  │  │ (ticker,│  │ Virtual      │  │ (order book   │  │ Charts     │  │   │
│  │  │  forms) │  │ (trade list) │  │  depth viz)   │  │ (candles)  │  │   │
│  │  └─────────┘  └──────────────┘  └───────────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🔄 Data Flow Chi Tiết

```
1. WebSocket nhận message từ server
         │
         ▼
2. Web Worker parse & xử lý (OFF main thread)
   ├── Parse JSON/Binary
   ├── Validate sequence number
   ├── Apply delta updates vào order book
   ├── Tính toán aggregated data
   └── Phát hiện gap → trigger REST snapshot
         │
         ▼
3. postMessage gửi processed data về main thread
         │
         ▼
4. Update store (Zustand/Ref)
   ├── High-frequency data → useRef (bypass React)
   ├── Medium-frequency → Zustand with selectors
   └── Low-frequency → TanStack Query cache
         │
         ▼
5. requestAnimationFrame render loop
   ├── Batch tất cả updates trong 1 frame (16ms)
   ├── Chỉ update DOM elements thực sự thay đổi
   └── Skip frames nếu data không đổi
```

---

## 4. Chiến Lược Fetch & Render Dữ Liệu Tần Suất Cao

### 🎯 Vấn đề cốt lõi

Khi server push 10,000-100,000+ messages/giây, **KHÔNG THỂ** re-render React component cho mỗi message. Browser chỉ paint 60 frames/giây (16.67ms/frame). Nếu mỗi message trigger 1 `setState` → React reconciliation → DOM update, app sẽ **freeze ngay lập tức**.

```
❌ SAI: 10,000 messages/giây × setState mỗi message = 10,000 re-renders/giây
   → Browser chỉ paint 60 frames/giây → 9,940 renders LÃNG PHÍ
   → Main thread bị block → UI freeze → Nhà đầu tư mất tiền

✅ ĐÚNG: 10,000 messages/giây → Buffer → 60 batch renders/giây
   → Mỗi batch chỉ giữ giá trị MỚI NHẤT
   → Main thread rảnh → UI mượt 60fps
```

### ⚡ Giải pháp 1: Message Batching + requestAnimationFrame

Đây là kỹ thuật **quan trọng nhất** — gom nhiều messages lại và chỉ render 1 lần mỗi frame:

```typescript
// ✅ ĐÚNG: Batch messages, render 1 lần/frame
class MessageBatcher<T> {
  private buffer: T[] = []
  private rafId: number | null = null
  private onFlush: (messages: T[]) => void

  constructor(onFlush: (messages: T[]) => void) {
    this.onFlush = onFlush
  }

  push(message: T) {
    this.buffer.push(message)

    // Schedule flush vào frame tiếp theo (nếu chưa schedule)
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        const batch = this.buffer
        this.buffer = []
        this.rafId = null
        this.onFlush(batch) // Xử lý TẤT CẢ messages 1 lần
      })
    }
  }

  destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
    }
  }
}

// Sử dụng:
const batcher = new MessageBatcher<TickerUpdate>((messages) => {
  // Chỉ giữ giá MỚI NHẤT cho mỗi symbol
  const latestBySymbol = new Map<string, TickerUpdate>()
  for (const msg of messages) {
    latestBySymbol.set(msg.symbol, msg)
  }
  // Update store 1 lần duy nhất
  updateTickerStore(latestBySymbol)
})

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  batcher.push(data) // KHÔNG render ngay, chỉ buffer
}
```

**Tại sao hiệu quả?**
- 10,000 messages trong 16ms → chỉ 1 lần render
- `requestAnimationFrame` tự động sync với browser paint cycle
- Chỉ giữ giá trị MỚI NHẤT cho mỗi symbol → bỏ qua intermediate values

### ⚡ Giải pháp 2: Web Worker — Offload xử lý nặng khỏi Main Thread

**Tại sao cần Web Worker?**

Main thread phải xử lý: React rendering, DOM updates, user interactions, animations. Nếu thêm việc parse JSON, sort order book, validate sequence numbers → main thread quá tải → UI giật.

```typescript
// === worker/market-data.worker.ts ===
// Worker chạy trên thread riêng, KHÔNG block UI

interface OrderBookState {
  bids: Map<number, number> // price → quantity
  asks: Map<number, number>
  lastUpdateId: number
}

const orderBooks = new Map<string, OrderBookState>()

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data

  switch (type) {
    case 'SNAPSHOT': {
      // Nhận snapshot ban đầu từ REST API
      const { symbol, bids, asks, lastUpdateId } = payload
      orderBooks.set(symbol, {
        bids: new Map(bids.map((b: number[]) => [b[0], b[1]])),
        asks: new Map(asks.map((a: number[]) => [a[0], a[1]])),
        lastUpdateId
      })
      postProcessedBook(symbol)
      break
    }

    case 'DELTA': {
      // Apply delta update
      const { symbol, bids, asks, firstUpdateId, lastUpdateId } = payload
      const book = orderBooks.get(symbol)
      if (!book) return

      // ⚠️ Validate sequence number — QUAN TRỌNG cho độ chính xác
      if (firstUpdateId > book.lastUpdateId + 1) {
        // GAP detected! Request new snapshot
        self.postMessage({ type: 'NEED_SNAPSHOT', symbol })
        return
      }

      // Apply bid deltas
      for (const [price, qty] of bids) {
        if (qty === 0) book.bids.delete(price)
        else book.bids.set(price, qty)
      }

      // Apply ask deltas
      for (const [price, qty] of asks) {
        if (qty === 0) book.asks.delete(price)
        else book.asks.set(price, qty)
      }

      book.lastUpdateId = lastUpdateId
      postProcessedBook(symbol)
      break
    }
  }
}

function postProcessedBook(symbol: string) {
  const book = orderBooks.get(symbol)
  if (!book) return

  // Sort và lấy top 20 levels — tính toán NẶNG này chạy trên Worker
  const sortedBids = [...book.bids.entries()]
    .sort((a, b) => b[0] - a[0])
    .slice(0, 20)

  const sortedAsks = [...book.asks.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(0, 20)

  // Gửi data đã xử lý về main thread — chỉ 20 levels, không phải toàn bộ
  self.postMessage({
    type: 'BOOK_UPDATE',
    symbol,
    bids: sortedBids,
    asks: sortedAsks,
    lastUpdateId: book.lastUpdateId
  })
}
```

```typescript
// === hooks/useOrderBook.ts ===
// Main thread: chỉ nhận data đã xử lý sẵn từ Worker

import { useEffect, useRef, useCallback } from 'react'

interface OrderBookLevel {
  price: number
  quantity: number
}

export function useOrderBook(symbol: string) {
  const workerRef = useRef<Worker | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const bidsRef = useRef<OrderBookLevel[]>([])
  const asksRef = useRef<OrderBookLevel[]>([])

  // Dùng ref thay vì state để tránh re-render mỗi khi data thay đổi
  // Component sẽ tự quyết định khi nào cần re-render qua rAF

  useEffect(() => {
    // 1. Khởi tạo Web Worker
    const worker = new Worker(
      new URL('../worker/market-data.worker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    // 2. Nhận data đã xử lý từ Worker
    worker.onmessage = (event) => {
      const { type } = event.data

      if (type === 'BOOK_UPDATE') {
        bidsRef.current = event.data.bids.map(
          ([price, qty]: number[]) => ({ price, quantity: qty })
        )
        asksRef.current = event.data.asks.map(
          ([price, qty]: number[]) => ({ price, quantity: qty })
        )
      }

      if (type === 'NEED_SNAPSHOT') {
        fetchSnapshot(event.data.symbol)
      }
    }

    // 3. Fetch initial snapshot qua REST
    fetchSnapshot(symbol)

    // 4. Mở WebSocket cho delta updates
    const ws = new WebSocket(`wss://stream.exchange.com/ws/${symbol}@depth`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // Forward RAW data tới Worker — main thread KHÔNG parse/xử lý
      worker.postMessage({ type: 'DELTA', payload: data })
    }

    return () => {
      ws.close()
      worker.terminate()
    }
  }, [symbol])

  const fetchSnapshot = useCallback(async (sym: string) => {
    const res = await fetch(`https://api.exchange.com/depth?symbol=${sym}&limit=1000`)
    const data = await res.json()
    workerRef.current?.postMessage({ type: 'SNAPSHOT', payload: data })
  }, [])

  return { bidsRef, asksRef }
}
```

### ⚡ Giải pháp 3: useRef + Direct DOM Mutation — Bypass React hoàn toàn

Cho dữ liệu cập nhật **cực kỳ nhanh** (ticker price), bypass React rendering hoàn toàn:

```typescript
// ✅ Pattern: useRef + direct DOM mutation
// Dùng cho: ticker price, bid/ask spread, volume — update > 10 lần/giây

function TickerPrice({ symbol }: { symbol: string }) {
  const priceRef = useRef<HTMLSpanElement>(null)
  const changeRef = useRef<HTMLSpanElement>(null)
  const prevPriceRef = useRef<number>(0)

  useEffect(() => {
    const ws = new WebSocket(`wss://stream.exchange.com/ws/${symbol}@ticker`)

    ws.onmessage = (event) => {
      const { price, change } = JSON.parse(event.data)

      // Update DOM TRỰC TIẾP — không qua React setState
      if (priceRef.current) {
        priceRef.current.textContent = price.toFixed(2)

        // Flash animation khi giá thay đổi
        const direction = price > prevPriceRef.current ? 'up' : 'down'
        priceRef.current.className = `ticker-price flash-${direction}`

        // Remove flash class sau animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (priceRef.current) {
              priceRef.current.className = 'ticker-price'
            }
          })
        })
      }

      if (changeRef.current) {
        changeRef.current.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`
        changeRef.current.className = change >= 0 ? 'text-green-500' : 'text-red-500'
      }

      prevPriceRef.current = price
    }

    return () => ws.close()
  }, [symbol])

  // Component chỉ render 1 LẦN DUY NHẤT khi mount
  return (
    <div className='ticker-container'>
      <span ref={priceRef} className='ticker-price'>--</span>
      <span ref={changeRef} className='text-gray-500'>--%</span>
    </div>
  )
}
```

> **Khi nào dùng pattern này?**
> - Dữ liệu update > 10 lần/giây
> - Chỉ cần update text/style, không cần thay đổi cấu trúc DOM
> - Ticker prices, bid/ask spread, volume counters

### 📊 So sánh 3 giải pháp

| Giải pháp | Tần suất phù hợp | Độ phức tạp | Khi nào dùng |
|-----------|------------------|-------------|-------------|
| Message Batching + rAF | 100-10,000 msg/s | Thấp | Ticker board, watchlist |
| Web Worker + Batching | 1,000-100,000+ msg/s | Trung bình | Order book, trade feed |
| useRef + DOM Mutation | 10-1,000 msg/s | Thấp | Individual ticker price |

---

## 5. State Management Cho Real-Time Data

### 🎯 TanStack Query có phù hợp cho real-time data không?

**Câu trả lời ngắn: KHÔNG hoàn toàn.**

TanStack Query (React Query) được thiết kế cho mô hình **request/response** với caching. Nó không có native support cho streaming/subscription data. Tuy nhiên, nó vẫn có vai trò trong ứng dụng chứng khoán.

### 📋 Phân loại data theo tần suất update

```
┌─────────────────────────────────────────────────────────────────────────┐
│              CHỌN STATE MANAGEMENT THEO TẦN SUẤT UPDATE                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Tần suất thấp (< 1 update/giây):                                      │
│  ├── Portfolio balance, account info                                    │
│  ├── Historical candle data                                             │
│  └── ✅ Dùng TanStack Query                                            │
│      staleTime: 30_000, refetchInterval: 60_000                        │
│                                                                         │
│  Tần suất trung bình (1-10 updates/giây):                              │
│  ├── Ticker prices (watchlist)                                          │
│  ├── Portfolio P&L                                                      │
│  └── ✅ Dùng Zustand với selectors                                     │
│      useStore(state => state.tickers[symbol])                          │
│                                                                         │
│  Tần suất cao (10-100 updates/giây):                                   │
│  ├── Order book depth                                                   │
│  ├── Recent trades                                                      │
│  └── ✅ Dùng useRef + direct DOM mutation                              │
│      Hoặc useSyncExternalStore                                         │
│                                                                         │
│  Tần suất cực cao (100+ updates/giây):                                 │
│  ├── Raw market data feed                                               │
│  ├── Level 3 order book                                                 │
│  └── ✅ Web Worker + Canvas rendering                                  │
│      Không chạm React state                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 🏪 Zustand — Lựa chọn tối ưu cho trading app

**Tại sao Zustand phù hợp hơn Context API / Redux?**

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface TickerData {
  price: number
  change: number
  volume: number
  timestamp: number
}

interface MarketStore {
  tickers: Record<string, TickerData>
  updateTicker: (symbol: string, data: TickerData) => void
  updateTickers: (updates: Record<string, TickerData>) => void
}

export const useMarketStore = create<MarketStore>()(
  subscribeWithSelector((set) => ({
    tickers: {},

    // Update 1 symbol
    updateTicker: (symbol, data) =>
      set((state) => ({
        tickers: { ...state.tickers, [symbol]: data }
      })),

    // Batch update nhiều symbols cùng lúc (từ WebSocket batch)
    updateTickers: (updates) =>
      set((state) => ({
        tickers: { ...state.tickers, ...updates }
      }))
  }))
)

// ✅ Component chỉ re-render khi ĐÚNG symbol thay đổi
function TickerRow({ symbol }: { symbol: string }) {
  // Selector chỉ subscribe vào 1 symbol cụ thể
  const ticker = useMarketStore((state) => state.tickers[symbol])

  if (!ticker) return <div>Loading...</div>

  return (
    <tr>
      <td>{symbol}</td>
      <td className={ticker.change >= 0 ? 'text-green-500' : 'text-red-500'}>
        {ticker.price.toFixed(2)}
      </td>
      <td>{ticker.change.toFixed(2)}%</td>
      <td>{ticker.volume.toLocaleString()}</td>
    </tr>
  )
}
```

**Ưu điểm Zustand cho trading:**
- Selector-based subscriptions: component chỉ re-render khi data nó cần thay đổi
- Có thể update store từ bên ngoài React (Web Worker, WebSocket handler)
- Bundle size cực nhỏ (~1KB gzipped)
- `subscribeWithSelector` middleware cho phép subscribe granular
- Không cần Provider wrapper

### 🔄 TanStack Query — Vai trò trong ứng dụng chứng khoán

TanStack Query vẫn hữu ích cho **dữ liệu REST** (không phải streaming):

```typescript
// ✅ TanStack Query phù hợp cho dữ liệu fetch 1 lần hoặc refetch chậm

// Historical candle data — fetch 1 lần, cache lâu
const { data: candles } = useQuery({
  queryKey: ['candles', symbol, timeframe],
  queryFn: () => fetchCandles(symbol, timeframe),
  staleTime: 5 * 60 * 1000, // 5 phút
  gcTime: 30 * 60 * 1000,   // 30 phút
})

// Account balance — refetch mỗi 30 giây
const { data: balance } = useQuery({
  queryKey: ['account', 'balance'],
  queryFn: fetchAccountBalance,
  refetchInterval: 30_000,
  staleTime: 10_000,
})

// Order history — fetch on demand
const { data: orders } = useQuery({
  queryKey: ['orders', { status: 'open' }],
  queryFn: () => fetchOrders({ status: 'open' }),
  staleTime: 5_000,
})

// ⚠️ Kết hợp WebSocket + TanStack Query cho order updates
// WebSocket chỉ invalidate cache, TanStack Query refetch
useEffect(() => {
  const ws = getWebSocket()
  ws.on('order_filled', (data) => {
    // Invalidate để TanStack Query refetch
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    queryClient.invalidateQueries({ queryKey: ['account', 'balance'] })
  })
}, [])
```

### 📊 Tổng kết State Management

| Công cụ | Dùng cho | Tần suất | Ví dụ |
|---------|---------|----------|-------|
| **TanStack Query** | REST data, cached data | < 1/giây | Candles, account, orders |
| **Zustand** | Streaming data, shared state | 1-10/giây | Ticker watchlist, portfolio |
| **useRef** | Hot path, bypass React | 10-100/giây | Individual price, spread |
| **Web Worker** | Heavy computation | 100+/giây | Order book processing |
| **Canvas** | Visual rendering | 100+/giây | Depth chart, heatmap |

---

## 6. Virtual Scrolling & Windowing

### 🎯 Khi nào cần Virtual Scrolling?

Order book thường chỉ hiển thị 20-50 price levels → **KHÔNG cần** virtual scrolling.
Trade history có thể có hàng ngàn dòng → **CẦN** virtual scrolling.

### 📋 So sánh thư viện

| Thư viện | Bundle Size | Ưu điểm | Nhược điểm | Phù hợp cho |
|----------|------------|---------|------------|-------------|
| **TanStack Virtual** | ~3KB gzip | Headless, nhẹ, modern | Mới, community nhỏ hơn | ⭐ Trade history |
| **react-virtuoso** | ~15KB gzip | Full-featured, auto-sizing | Nặng hơn, Chrome jitter | Complex lists |
| **react-window** | ~6KB gzip | Battle-tested | Unmaintained từ 2020 | Legacy projects |
| **virtua** | ~3KB gzip | Zero-config, multi-framework | Rất mới | Lightweight alternative |

### 💻 Ví dụ: Trade History với TanStack Virtual

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

interface Trade {
  id: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  timestamp: number
}

function TradeHistory({ trades }: { trades: Trade[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Mỗi row cao 32px
    overscan: 10, // Render thêm 10 rows ngoài viewport
  })

  return (
    <div
      ref={parentRef}
      className='h-[400px] overflow-auto'
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const trade = trades[virtualRow.index]
          return (
            <div
              key={trade.id}
              className='absolute top-0 left-0 w-full flex items-center px-2'
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <span className='w-1/3 text-right'>
                {trade.price.toFixed(2)}
              </span>
              <span className='w-1/3 text-right'>
                {trade.quantity.toFixed(4)}
              </span>
              <span className={`w-1/3 text-right ${
                trade.side === 'buy' ? 'text-green-500' : 'text-red-500'
              }`}>
                {new Date(trade.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

> **Lưu ý quan trọng**: Cho order book (20-50 levels), nhiều trading platform production **KHÔNG** dùng virtual scrolling mà render trực tiếp DOM hoặc dùng Canvas. Virtual scrolling chỉ thực sự cần cho danh sách dài (trade history, order history).

---

## 7. Canvas/WebGL — Khi Nào Nên Dùng?

### 📊 Chọn rendering technology theo use case

| Rendering | Use Case | Performance | Interactivity |
|-----------|----------|-------------|---------------|
| **DOM/HTML** | Ticker, forms, order entry | Tốt cho < 500 elements | Full CSS, accessibility |
| **Canvas 2D** | Order book depth, heatmap | 10,000+ elements @ 60fps | Cần manual hit-testing |
| **WebGL** | Candlestick charts 50k+ points | Tốt nhất | Phức tạp, cần library |
| **SVG** | Static charts, icons | Giảm > 1,000 elements | Tốt (DOM events) |

### 📈 Thư viện charting cho chứng khoán

| Thư viện | Renderer | Bundle Size | Performance | License | Phù hợp |
|----------|----------|-------------|-------------|---------|---------|
| **TradingView Lightweight Charts** | Canvas | ~45KB gzip | 60fps, 10k+ candles | Apache 2.0 (free) | ⭐ Tốt nhất cho hầu hết |
| **TradingView Charting Library** | Canvas + WebGL | ~450KB | 60fps, hardware accel | Proprietary (paid) | Enterprise |
| **Chart.js** | Canvas | ~61KB gzip | 60fps đến ~10k points | MIT (free) | Simple charts |
| **SciChart.js** | WebGL | Commercial | Millions of points | Commercial | Ultra-performance |
| **D3.js** | SVG | ~80KB | Không phù hợp real-time | BSD | Custom static viz |

> **Recommendation**: Dùng **TradingView Lightweight Charts** cho candlestick/price charts. Free, nhẹ (45KB), 60fps với 10k+ candles, real-time updates < 5ms.

---

## 8. Đảm Bảo Độ Chính Xác Dữ Liệu

### ⚠️ Tại sao độ chính xác là yếu tố sống còn?

Trong chứng khoán, hiển thị sai giá dù chỉ 1 tick có thể dẫn đến:
- Nhà đầu tư đặt lệnh sai → mất tiền
- Công ty bị kiện vì cung cấp thông tin sai
- Mất uy tín, mất khách hàng

### 🔢 Sequence Number — Phát hiện mất dữ liệu

Mọi sàn giao dịch lớn đều gửi **sequence number** trong mỗi WebSocket message:

```typescript
// Pattern: Sequence number gap detection (theo chuẩn Binance)

interface DepthUpdate {
  symbol: string
  firstUpdateId: number  // U
  lastUpdateId: number   // u
  bids: [number, number][]
  asks: [number, number][]
}

class OrderBookSync {
  private lastUpdateId: number = 0
  private isInitialized: boolean = false
  private pendingBuffer: DepthUpdate[] = []

  // Bước 1: Buffer messages trong khi chờ snapshot
  bufferUpdate(update: DepthUpdate) {
    this.pendingBuffer.push(update)
  }

  // Bước 2: Nhận snapshot từ REST API
  applySnapshot(snapshot: { lastUpdateId: number; bids: any[]; asks: any[] }) {
    this.lastUpdateId = snapshot.lastUpdateId

    // Bước 3: Bỏ tất cả buffered events có u <= lastUpdateId
    this.pendingBuffer = this.pendingBuffer.filter(
      (update) => update.lastUpdateId > this.lastUpdateId
    )

    // Bước 4: Apply remaining buffered events
    for (const update of this.pendingBuffer) {
      this.applyDelta(update)
    }
    this.pendingBuffer = []
    this.isInitialized = true
  }

  // Bước 5: Apply delta updates liên tục
  applyDelta(update: DepthUpdate): 'ok' | 'gap_detected' | 'stale' {
    if (!this.isInitialized) {
      this.bufferUpdate(update)
      return 'ok'
    }

    // Skip stale updates (đã xử lý rồi)
    if (update.lastUpdateId <= this.lastUpdateId) {
      return 'stale'
    }

    // ⚠️ GAP DETECTED — mất message!
    if (update.firstUpdateId > this.lastUpdateId + 1) {
      console.error(
        `Sequence gap: expected ${this.lastUpdateId + 1}, got ${update.firstUpdateId}`
      )
      this.isInitialized = false
      return 'gap_detected' // Caller phải fetch snapshot mới
    }

    // Apply update bình thường
    // ... apply bids/asks deltas ...
    this.lastUpdateId = update.lastUpdateId
    return 'ok'
  }
}
```

### 🔄 Reconnection Strategy

```typescript
// WebSocket reconnection với exponential backoff + snapshot recovery

class ReliableWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private baseDelay = 1000 // 1 giây

  connect(url: string) {
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0 // Reset counter
      // Re-subscribe tất cả channels
      this.resubscribe()
    }

    this.ws.onclose = (event) => {
      if (!event.wasClean) {
        this.scheduleReconnect(url)
      }
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private scheduleReconnect(url: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      // Hiển thị UI thông báo cho user
      return
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s... (max 30s)
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      30_000
    )

    // Thêm jitter để tránh thundering herd
    const jitter = delay * 0.1 * Math.random()

    setTimeout(() => {
      this.reconnectAttempts++
      this.connect(url)
    }, delay + jitter)
  }

  private resubscribe() {
    // Sau khi reconnect, PHẢI fetch snapshot mới
    // vì có thể đã mất messages trong lúc disconnect
    this.fetchAllSnapshots()
  }

  private fetchAllSnapshots() {
    // Fetch REST snapshots cho tất cả symbols đang subscribe
    // Rồi mới bắt đầu apply WebSocket deltas
  }
}
```

### ⏰ Timestamp & Ordering

```
┌─────────────────────────────────────────────────────────────────────┐
│                  QUY TẮC XỬ LÝ TIMESTAMP                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. LUÔN dùng server timestamp, KHÔNG dùng client clock             │
│     → Client clock có thể sai vài giây đến vài phút                │
│                                                                     │
│  2. Xử lý out-of-order messages:                                    │
│     → Buffer ngắn (50-100ms) rồi sort theo sequence number          │
│     → Hoặc dùng idempotent processing (apply cùng update 2 lần     │
│       cho kết quả giống nhau)                                       │
│                                                                     │
│  3. Khi có nhiều data sources:                                      │
│     → Dùng logical clock / Lamport timestamp                        │
│     → Hoặc watermarking: set deadline cho buffered messages         │
│                                                                     │
│  4. Hiển thị cho user:                                              │
│     → Luôn show server timestamp, không phải local time             │
│     → Hiển thị "delay indicator" nếu data cũ hơn threshold          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Performance Metrics & Monitoring

### 📊 Performance Budget cho ứng dụng chứng khoán

| Metric | Target | Ngưỡng nguy hiểm | Ghi chú |
|--------|--------|-------------------|---------|
| Frame time | < 16ms | > 33ms (dưới 30fps) | Phải duy trì 60fps |
| Glass-to-glass latency | < 100ms | > 250ms | Từ nhận data → pixel update |
| Order book update cycle | < 5ms | > 16ms | Xử lý + render 1 delta |
| Chart real-time update | < 5ms | > 50ms | Update candle mới nhất |
| JS heap (single tab) | < 150MB | > 300MB | Nhiều tab mở cùng lúc |
| Bundle size (gzipped) | < 200KB initial | > 500KB | First load performance |
| WebSocket reconnect | < 2s | > 5s | Thời gian recovery |
| First Contentful Paint | < 1.5s | > 3s | Initial page load |

### 🔍 Monitoring trong Production

```typescript
// === utils/performance-monitor.ts ===

class PerformanceMonitor {
  private frameTimestamps: number[] = []
  private updateLatencies: number[] = []

  // 1. FPS Monitor — phát hiện drop frames
  startFPSMonitor() {
    let lastTime = performance.now()
    let frames = 0

    const measure = () => {
      frames++
      const now = performance.now()

      if (now - lastTime >= 1000) {
        const fps = Math.round(frames * 1000 / (now - lastTime))

        if (fps < 30) {
          console.warn(`⚠️ FPS dropped to ${fps}`)
          // Gửi metric lên monitoring service
          this.reportMetric('fps_drop', { fps, timestamp: Date.now() })
        }

        frames = 0
        lastTime = now
      }

      requestAnimationFrame(measure)
    }

    requestAnimationFrame(measure)
  }

  // 2. Update Latency — đo thời gian từ nhận data đến render
  measureUpdateLatency(serverTimestamp: number) {
    const latency = Date.now() - serverTimestamp
    this.updateLatencies.push(latency)

    // Giữ 1000 samples gần nhất
    if (this.updateLatencies.length > 1000) {
      this.updateLatencies.shift()
    }

    if (latency > 250) {
      console.warn(`⚠️ High latency: ${latency}ms`)
    }
  }

  // 3. Memory Monitor — phát hiện memory leak
  startMemoryMonitor() {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const heapMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)

        if (heapMB > 300) {
          console.error(`🚨 Memory critical: ${heapMB}MB`)
          this.reportMetric('memory_critical', { heapMB })
        }
      }
    }, 10_000) // Check mỗi 10 giây
  }

  // 4. WebSocket Health — monitor connection quality
  monitorWebSocketHealth(ws: WebSocket) {
    let lastMessageTime = Date.now()

    const originalOnMessage = ws.onmessage
    ws.onmessage = (event) => {
      const gap = Date.now() - lastMessageTime
      lastMessageTime = Date.now()

      // Nếu không nhận message > 5 giây → có thể connection bị stale
      if (gap > 5000) {
        console.warn(`⚠️ WebSocket message gap: ${gap}ms`)
      }

      originalOnMessage?.call(ws, event)
    }
  }

  private reportMetric(name: string, data: Record<string, unknown>) {
    // Gửi lên monitoring service (DataDog, Grafana, etc.)
    // navigator.sendBeacon('/api/metrics', JSON.stringify({ name, data }))
  }
}
```

### 🎯 Checklist Performance cho Trading Frontend

```
✅ Pre-launch Checklist:
├── [ ] FPS ổn định 60fps trong giờ giao dịch cao điểm
├── [ ] Glass-to-glass latency < 100ms
├── [ ] Memory không tăng liên tục (no memory leak)
├── [ ] WebSocket auto-reconnect hoạt động đúng
├── [ ] Sequence number gap detection hoạt động
├── [ ] Bundle size < 200KB gzipped (initial load)
├── [ ] Web Worker xử lý order book (không block main thread)
├── [ ] Virtual scrolling cho trade history
├── [ ] Error boundary cho mỗi widget (1 widget crash không ảnh hưởng cả app)
└── [ ] Graceful degradation khi WebSocket down (fallback REST polling)
```

---

## 10. Code Examples Thực Tế

### 🏗️ Full Example: WebSocket Manager cho Trading App

```typescript
// === services/WebSocketManager.ts ===
// Singleton quản lý tất cả WebSocket connections

type MessageHandler = (data: unknown) => void

interface Channel {
  name: string
  handlers: Set<MessageHandler>
}

class WebSocketManager {
  private static instance: WebSocketManager
  private ws: WebSocket | null = null
  private channels = new Map<string, Channel>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private url: string = ''
  private batcher: MessageBatcher

  private constructor() {
    // Batch messages, flush mỗi frame
    this.batcher = new MessageBatcher((messages: any[]) => {
      for (const msg of messages) {
        const channel = this.channels.get(msg.channel)
        if (channel) {
          channel.handlers.forEach((handler) => handler(msg.data))
        }
      }
    })
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  connect(url: string, token: string) {
    this.url = url
    this.ws = new WebSocket(`${url}?token=${token}`)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      // Re-subscribe tất cả channels đang active
      for (const [name] of this.channels) {
        this.ws?.send(JSON.stringify({ action: 'subscribe', channel: name }))
      }
    }

    this.ws.onmessage = (event) => {
      // Push vào batcher, KHÔNG xử lý ngay
      this.batcher.push(JSON.parse(event.data))
    }

    this.ws.onclose = (event) => {
      if (!event.wasClean) {
        this.scheduleReconnect()
      }
    }
  }

  subscribe(channel: string, handler: MessageHandler) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, { name: channel, handlers: new Set() })
      // Gửi subscribe message tới server
      this.ws?.send(JSON.stringify({ action: 'subscribe', channel }))
    }
    this.channels.get(channel)!.handlers.add(handler)

    // Return unsubscribe function
    return () => {
      const ch = this.channels.get(channel)
      if (ch) {
        ch.handlers.delete(handler)
        if (ch.handlers.size === 0) {
          this.channels.delete(channel)
          this.ws?.send(JSON.stringify({ action: 'unsubscribe', channel }))
        }
      }
    }
  }

  private scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    const jitter = delay * 0.1 * Math.random()

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect(this.url, '') // Re-use stored token
    }, delay + jitter)
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.batcher.destroy()
    this.ws?.close()
    this.ws = null
  }
}

// MessageBatcher class (đã định nghĩa ở section 4)
class MessageBatcher<T = unknown> {
  private buffer: T[] = []
  private rafId: number | null = null

  constructor(private onFlush: (messages: T[]) => void) {}

  push(message: T) {
    this.buffer.push(message)
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        const batch = this.buffer
        this.buffer = []
        this.rafId = null
        this.onFlush(batch)
      })
    }
  }

  destroy() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId)
  }
}

export default WebSocketManager
```

### 🎨 React Hook: useMarketData — Kết hợp tất cả patterns

```typescript
// === hooks/useMarketData.ts ===
// Hook tổng hợp: WebSocket + Worker + Batching + Zustand

import { useEffect, useRef } from 'react'
import { useMarketStore } from '../stores/marketStore'

interface UseMarketDataOptions {
  symbols: string[]
  enableOrderBook?: boolean
}

export function useMarketData({ symbols, enableOrderBook = false }: UseMarketDataOptions) {
  const workerRef = useRef<Worker | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const updateTickers = useMarketStore((s) => s.updateTickers)

  useEffect(() => {
    if (symbols.length === 0) return

    // 1. Khởi tạo Worker cho heavy processing
    const worker = new Worker(
      new URL('../worker/market-data.worker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    // 2. Worker gửi processed data → update Zustand store
    worker.onmessage = (event) => {
      const { type, data } = event.data

      switch (type) {
        case 'TICKER_BATCH':
          // Batch update tất cả tickers cùng lúc
          updateTickers(data)
          break

        case 'NEED_SNAPSHOT':
          // Fetch REST snapshot khi phát hiện gap
          fetchSnapshot(data.symbol)
          break
      }
    }

    // 3. Mở WebSocket
    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/')
    const ws = new WebSocket(`wss://stream.exchange.com/stream?streams=${streams}`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      // Forward raw data tới Worker — main thread không xử lý
      worker.postMessage({ type: 'RAW_MESSAGE', payload: event.data })
    }

    ws.onerror = () => ws.close()
    ws.onclose = () => {
      // Auto-reconnect logic (simplified)
      setTimeout(() => {
        // Reconnect...
      }, 1000)
    }

    return () => {
      ws.close()
      worker.terminate()
    }
  }, [symbols.join(',')]) // Re-connect khi danh sách symbols thay đổi

  const fetchSnapshot = async (symbol: string) => {
    const res = await fetch(`https://api.exchange.com/depth?symbol=${symbol}`)
    const data = await res.json()
    workerRef.current?.postMessage({ type: 'SNAPSHOT', payload: data })
  }
}
```

---

## 11. Tổng Kết & Recommendations

### 🎯 Recommendations theo từng scenario

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION MATRIX                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📊 ORDER BOOK (real-time depth):                                       │
│  ├── Protocol: WebSocket                                                │
│  ├── Processing: Web Worker (parse, sort, validate)                     │
│  ├── State: useRef (bypass React) hoặc Zustand                         │
│  ├── Rendering: DOM (20-50 levels) hoặc Canvas (depth chart)           │
│  └── Accuracy: Sequence number + snapshot recovery                      │
│                                                                         │
│  📈 TICKER / WATCHLIST (price streaming):                               │
│  ├── Protocol: WebSocket                                                │
│  ├── Processing: Message Batching + rAF                                 │
│  ├── State: Zustand with selectors                                      │
│  ├── Rendering: DOM + useRef cho individual prices                      │
│  └── Accuracy: Latest value wins (no ordering needed)                   │
│                                                                         │
│  🕯️ CANDLESTICK CHART:                                                 │
│  ├── Protocol: WebSocket (real-time) + REST (historical)                │
│  ├── Processing: Main thread OK (1 update/giây)                         │
│  ├── State: TanStack Query (historical) + Zustand (live candle)         │
│  ├── Rendering: TradingView Lightweight Charts (Canvas)                 │
│  └── Accuracy: Server timestamp cho candle boundaries                   │
│                                                                         │
│  📋 TRADE HISTORY:                                                      │
│  ├── Protocol: WebSocket                                                │
│  ├── Processing: Message Batching (append to array)                     │
│  ├── State: Zustand (capped array, LRU)                                │
│  ├── Rendering: TanStack Virtual (virtual scrolling)                    │
│  └── Accuracy: Sequence number ordering                                 │
│                                                                         │
│  💼 PORTFOLIO / ACCOUNT:                                                │
│  ├── Protocol: REST + WebSocket (invalidation)                          │
│  ├── Processing: Main thread OK                                         │
│  ├── State: TanStack Query (staleTime: 30s)                            │
│  ├── Rendering: Standard React components                               │
│  └── Accuracy: WebSocket invalidate → TanStack Query refetch           │
│                                                                         │
│  📰 NEWS FEED:                                                          │
│  ├── Protocol: SSE hoặc WebSocket                                       │
│  ├── Processing: Main thread OK                                         │
│  ├── State: TanStack Query + manual cache update                        │
│  ├── Rendering: Standard React + lazy loading                           │
│  └── Accuracy: Eventual consistency OK                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 📝 Tóm tắt các điểm quan trọng nhất (cho phỏng vấn)

**1. Giao thức giao tiếp:**
- WebSocket là chuẩn ngành cho real-time trading data (Binance, Coinbase đều dùng)
- Kết hợp REST cho snapshots + WebSocket cho delta updates
- SSE chỉ phù hợp cho read-only data (news, notifications)

**2. Xử lý dữ liệu tần suất cao:**
- KHÔNG BAO GIỜ `setState` cho mỗi WebSocket message
- Message Batching + `requestAnimationFrame` = chỉ render 60 lần/giây
- Web Worker cho heavy processing (parse, sort, validate)
- `useRef` + direct DOM mutation cho ticker prices

**3. State Management:**
- TanStack Query: REST data, low-frequency (account, history)
- Zustand: streaming data, medium-frequency (watchlist, portfolio P&L)
- useRef: high-frequency (individual prices, order book)
- Web Worker + Canvas: extreme frequency (raw feed)

**4. Độ chính xác:**
- Sequence number gap detection + automatic snapshot recovery
- Server timestamps only (không dùng client clock)
- Idempotent processing cho out-of-order messages
- Exponential backoff + jitter cho reconnection

**5. Performance targets:**
- 60fps liên tục, frame time < 16ms
- Glass-to-glass latency < 100ms
- JS heap < 150MB
- WebSocket reconnect < 2 giây

---

## 12. Tài Liệu Tham Khảo

### 📚 Articles & Documentation

1. [OceanoBe — Front-End Performance Optimization for HFT Interfaces](https://oceanobe.com/news/front-end-performance-optimization-for-high-frequency-trading-interfaces/1634)
2. [FullStackTechies — React.js for FinTech HFT Dashboard](https://fullstacktechies.com/react-js-for-fintech-predictive-ai-dashboard/)
3. [Ably — WebSockets Explained](https://ably.com/topic/websockets)
4. [Ably — Chat Architecture for Reliable Message Ordering](https://ably.com/blog/chat-architecture-reliable-message-ordering)
5. [TanStack Query — Streaming/Subscription Discussion](https://github.com/TanStack/query/discussions/418)
6. [Binance API Documentation — WebSocket Streams](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams)
7. [Bloomberg BLPAPI Developer Guide](https://data.bloomberglp.com/professional/sites/4/blpapi-developers-guide-2.54.pdf)

### 🛠️ Libraries

| Library | Purpose | Link |
|---------|---------|------|
| TradingView Lightweight Charts | Candlestick charts | [GitHub](https://github.com/nicholasgasior/lightweight-charts) |
| TanStack Virtual | Virtual scrolling | [tanstack.com/virtual](https://tanstack.com/virtual) |
| Zustand | State management | [GitHub](https://github.com/pmndrs/zustand) |
| TanStack Query | REST data caching | [tanstack.com/query](https://tanstack.com/query) |
| MessagePack | Binary serialization | [msgpack.org](https://msgpack.org) |

### 🎓 Câu hỏi phỏng vấn thường gặp

1. "Làm sao xử lý khi WebSocket nhận 100,000 messages/giây?" → Message Batching + rAF + Web Worker
2. "TanStack Query có phù hợp cho real-time data không?" → Không hoàn toàn, dùng Zustand/useRef cho streaming, TanStack Query cho REST
3. "Làm sao đảm bảo order book chính xác?" → Sequence number gap detection + snapshot recovery
4. "WebSocket vs SSE cho chứng khoán?" → WebSocket (full-duplex, cần gửi lệnh), SSE chỉ cho read-only
5. "Làm sao tránh UI giật khi data đổ về liên tục?" → Không setState mỗi message, batch + rAF, Web Worker, useRef + DOM mutation
6. "Memory leak trong trading app?" → Unsubscribe WebSocket listeners, cap array sizes (LRU), monitor heap size
7. "Chọn charting library nào?" → TradingView Lightweight Charts (free, Canvas, 60fps)

---

> **Ghi chú**: Tài liệu này tập trung vào **frontend perspective**. Backend architecture (message queue, matching engine, market data gateway) là một chủ đề riêng biệt.