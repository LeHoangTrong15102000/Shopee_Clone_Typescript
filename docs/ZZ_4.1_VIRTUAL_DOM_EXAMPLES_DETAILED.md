# 🔥 Virtual DOM Chi Tiết: Ví Dụ Cụ Thể Về Batching Updates và Diffing Algorithm

## 📖 Mục Lục

1. [Batching Updates - Gộp các thay đổi với ví dụ cụ thể](#batching-updates---gộp-các-thay-đổi-với-ví-dụ-cụ-thể)
2. [Diffing Algorithm - Giả định 1: Element khác type](#diffing-algorithm---giả-định-1-element-khác-type)
3. [Diffing Algorithm - Giả định 2: Keys trong danh sách](#diffing-algorithm---giả-định-2-keys-trong-danh-sách)
4. [Diffing Algorithm - Giả định 3: Component cùng type](#diffing-algorithm---giả-định-3-component-cùng-type)
5. [Ví dụ thực tế từ Shopee Clone](#ví-dụ-thực-tế-từ-shopee-clone)

---

## 🎯 Batching Updates - Gộp các thay đổi với ví dụ cụ thể

### **Vấn đề với Real DOM**

Hãy tưởng tượng bạn có một trang web bán hàng và cần cập nhật thông tin của 3 sản phẩm cùng lúc:

```javascript
// ⚠️ Real DOM - Nhiều DOM mutations riêng biệt
function updateProductsRealDOM() {
  console.log('🚀 Bắt đầu cập nhật 3 sản phẩm...')

  // Thay đổi 1: Ẩn sản phẩm hết hàng
  const product1 = document.getElementById('product-1')
  product1.style.display = 'none'

  // Thay đổi 2: Cập nhật tên sản phẩm
  const product2 = document.getElementById('product-2')
  product2.querySelector('.product-name').textContent = 'iPhone 15 Pro Max - SALE 50%'

  // Thay đổi 3: Thêm class highlight cho sản phẩm hot
  const product3 = document.getElementById('product-3')
  product3.className += ' hot-deal'

  // ⚠️ Lưu ý: Browser hiện đại (Chrome, Firefox) CÓ THỂ batch các mutations
  // liên tiếp trong cùng synchronous block thành 1 reflow.
  // Tuy nhiên, nếu bạn ĐỌC layout property giữa các writes (layout thrashing),
  // browser buộc phải reflow ngay lập tức cho mỗi lần đọc.
}

// Ví dụ Layout Thrashing — đây mới thật sự gây nhiều reflow:
function layoutThrashing() {
  const elements = document.querySelectorAll('.product')
  elements.forEach(el => {
    const height = el.offsetHeight  // ĐỌC → force reflow
    el.style.height = height + 10 + 'px'  // GHI → invalidate layout
    // Vòng lặp tiếp theo ĐỌC lại → force reflow NGAY LẬP TỨC
  })
}
```

### **Giải pháp với Virtual DOM**

```javascript
// ✅ Virtual DOM - Tất cả thay đổi được gộp lại
function ProductList() {
  const [products, setProducts] = useState([
    { id: 1, name: 'iPhone 14', inStock: true, isHot: false },
    { id: 2, name: 'iPhone 15', inStock: true, isHot: false },
    { id: 3, name: 'Samsung S24', inStock: true, isHot: false }
  ])

  const updateAllProducts = () => {
    console.log('🚀 Bắt đầu cập nhật 3 sản phẩm với Virtual DOM...')
    
    // TẤT CẢ thay đổi được gộp trong 1 lần setState
    setProducts(prevProducts => prevProducts.map(product => {
      if (product.id === 1) {
        return { ...product, inStock: false } // Sản phẩm 1: Hết hàng
      }
      if (product.id === 2) {
        return { ...product, name: 'iPhone 15 Pro Max - SALE 50%' } // Sản phẩm 2: Đổi tên
      }
      if (product.id === 3) {
        return { ...product, isHot: true } // Sản phẩm 3: Hot deal
      }
      return product
    }))
    
    console.log('⚡ Chỉ 1 lần DOM update duy nhất!')
  }

  return (
    <div>
      {products.map(product => (
        <div 
          key={product.id}
          className={`product-card ${product.isHot ? 'hot-deal' : ''}`}
          style={{ display: product.inStock ? 'block' : 'none' }}
        >
          <h3 className="product-name">{product.name}</h3>
        </div>
      ))}
    </div>
  )
}

// Kết quả: React gộp tất cả thay đổi, chỉ 1 lần DOM update!
```

### **Lợi thế thực sự của Virtual DOM**

```javascript
// Lợi thế chính của Virtual DOM KHÔNG phải là tốc độ thuần túy
// mà là ở chỗ:
//
// 1. Developer không cần lo về thứ tự read/write DOM (tránh layout thrashing)
// 2. React tự động tính toán minimum DOM operations cần thiết
// 3. Batching được đảm bảo — nhiều setState() = 1 lần DOM update
// 4. Declarative code — mô tả UI mong muốn, React lo phần update
//
// ⚠️ Lưu ý: Không nên so sánh performance bằng cách đo performance.now()
// trong React component — vì React render là async (batching, scheduling),
// thời gian đo trong function body không phản ánh thời gian DOM thực sự update.
// Dùng React DevTools Profiler hoặc Chrome Performance tab để đo chính xác.
```

### **Ví dụ cụ thể hơn: Shopping Cart**

```javascript
// ⚠️ Real DOM - Cập nhật giỏ hàng
function updateCartRealDOM(cartItems) {
  // Các DOM mutations liên tiếp — browser hiện đại có thể batch
  // NHƯNG developer phải cẩn thận không đọc layout giữa các writes
  cartItems.forEach(item => {
    const element = document.getElementById(`cart-item-${item.id}`)

    // Update 1: Số lượng
    element.querySelector('.quantity').textContent = item.quantity

    // Update 2: Tổng tiền
    element.querySelector('.total').textContent = item.quantity * item.price

    // Update 3: Highlight nếu số lượng > 5
    if (item.quantity > 5) {
      element.classList.add('bulk-order')
    }
  })

  // Browser hiện đại sẽ batch các writes liên tiếp này
  // Nhưng nếu code phức tạp hơn (đọc offsetHeight giữa các writes) → layout thrashing
  // Developer phải TỰ đảm bảo thứ tự read/write đúng
}

// ✅ Virtual DOM - React đảm bảo batch tất cả
function ShoppingCart({ cartItems }) {
  return (
    <div>
      {cartItems.map(item => (
        <div
          key={item.id}
          className={`cart-item ${item.quantity > 5 ? 'bulk-order' : ''}`}
        >
          <span className="quantity">{item.quantity}</span>
          <span className="total">{item.quantity * item.price}</span>
        </div>
      ))}
    </div>
  )
  // React đảm bảo chỉ 1 lần DOM update cho tất cả items
  // Developer không cần lo về thứ tự read/write DOM
}
```

---

## 🧮 Diffing Algorithm - Giả định 1: Element khác type

### **Giải thích đơn giản**

Khi React thấy một element thay đổi từ type này sang type khác (ví dụ: `<span>` thành `<h3>`), nó sẽ **phá hủy toàn bộ** element cũ và **tạo mới** hoàn toàn, thay vì cố gắng so sánh từng thuộc tính.

### **Ví dụ cụ thể: Product Title**

```javascript
// Trường hợp 1: Element cùng type - React sẽ UPDATE
function ProductCard({ product, isHighlighted }) {
  return (
    <div className="product-card">
      {/* Cùng là <h3>, chỉ khác nội dung */}
      <h3 className={isHighlighted ? 'highlighted' : 'normal'}>
        {product.name}
      </h3>
    </div>
  )
}

// Old Virtual DOM:
// <h3 className="normal">iPhone 14</h3>

// New Virtual DOM:  
// <h3 className="highlighted">iPhone 14 Pro</h3>

// React sẽ làm:
// ✅ Giữ nguyên <h3> element
// ✅ Chỉ update className: "normal" → "highlighted"  
// ✅ Chỉ update textContent: "iPhone 14" → "iPhone 14 Pro"
// 🚀 Performance: NHANH - chỉ 2 DOM operations
```

```javascript
// Trường hợp 2: Element khác type - React sẽ DESTROY & CREATE
function ProductCard({ product, useHeading }) {
  return (
    <div className="product-card">
      {useHeading ? (
        <h3>{product.name}</h3>  // Type: h3
      ) : (
        <span>{product.name}</span>  // Type: span
      )}
    </div>
  )
}

// Old Virtual DOM:
// <span>iPhone 14</span>

// New Virtual DOM:
// <h3>iPhone 14</h3>

// React sẽ làm:
// ❌ Phá hủy toàn bộ <span> element
// ❌ Tạo mới hoàn toàn <h3> element
// ❌ Gán lại textContent
// 🐌 Performance: CHẬM hơn - 3 DOM operations + memory allocation
```

### **Tại sao React làm vậy?**

```javascript
// Lý do: Tránh việc so sánh phức tạp không cần thiết
// Nếu React cố gắng "chuyển đổi" span → h3:

function convertSpanToH3(spanElement) {
  // Phải làm rất nhiều việc:
  // 1. Tạo h3 element mới
  const h3 = document.createElement('h3')
  
  // 2. Copy tất cả attributes từ span
  Array.from(spanElement.attributes).forEach(attr => {
    h3.setAttribute(attr.name, attr.value)
  })
  
  // 3. Copy tất cả children
  while (spanElement.firstChild) {
    h3.appendChild(spanElement.firstChild)
  }
  
  // 4. Copy event listeners (phức tạp!)
  // 5. Copy custom properties
  // 6. Replace trong DOM
  spanElement.parentNode.replaceChild(h3, spanElement)
  
  // => Phức tạp và dễ bug hơn việc tạo mới!
}

// React quyết định: "Thà destroy + create cho đơn giản"
```

### **Ví dụ thực tế: Loading State**

```javascript
// ❌ BAD: Khác type → Destroy/Create liên tục
function ProductInfo({ loading, product }) {
  return (
    <div>
      {loading ? (
        <span className="loading">Đang tải...</span>  // Type: span
      ) : (
        <h2 className="product-title">{product.name}</h2>  // Type: h2
      )}
    </div>
  )
}

// Khi loading thay đổi true ↔ false:
// React phải destroy/create liên tục → CHẬM

// ✅ GOOD: Cùng type → Chỉ update content
function ProductInfo({ loading, product }) {
  return (
    <div>
      <h2 className={loading ? "loading" : "product-title"}>
        {loading ? "Đang tải..." : product.name}
      </h2>
    </div>
  )
}

// Khi loading thay đổi:
// React chỉ update className và textContent → NHANH
```

---

## 🗝️ Diffing Algorithm - Giả định 2: Keys trong danh sách

### **Giải thích đơn giản**

Khi React render một **danh sách** (list) các elements, nó cần biết element nào trong danh sách cũ tương ứng với element nào trong danh sách mới. Nếu không có `key`, React chỉ so sánh theo **vị trí (index)** — dẫn đến việc re-render sai hoặc mất state. Khi có `key`, React dùng key để **match chính xác** từng element, bất kể thứ tự thay đổi thế nào.

### **Vấn đề khi không có key (hoặc dùng index làm key)**

```javascript
// ❌ BAD: Không có key — React so sánh theo vị trí
function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <li>{product.name}</li>  // ⚠️ Thiếu key!
      ))}
    </ul>
  )
}

// Danh sách ban đầu:
// Index 0: iPhone 14
// Index 1: Samsung S24
// Index 2: Google Pixel 8

// Sau khi xóa phần tử đầu tiên (iPhone 14):
// Index 0: Samsung S24   ← React thấy "vị trí 0 thay đổi" → UPDATE
// Index 1: Google Pixel 8 ← React thấy "vị trí 1 thay đổi" → UPDATE
//                          React thấy "vị trí 2 biến mất" → REMOVE

// Kết quả: React UPDATE 2 nodes + REMOVE 1 node
// Thay vì chỉ cần REMOVE đúng 1 node (iPhone 14)
// → 3 DOM operations thay vì 1 → CHẬM và có thể sai state!
```

```javascript
// ❌ BAD: Dùng index làm key — vẫn sai khi list thay đổi thứ tự
function ProductList({ products }) {
  return (
    <ul>
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
        // key=0, key=1, key=2 — gắn với VỊ TRÍ, không phải với SẢN PHẨM
      ))}
    </ul>
  )
}

// Khi xóa iPhone 14 (index 0):
// React thấy key=0 vẫn còn → "Ồ, vị trí 0 vẫn tồn tại, chỉ đổi data"
// → React UPDATE ProductCard tại key=0 với data của Samsung S24
// → React UPDATE ProductCard tại key=1 với data của Google Pixel 8
// → React REMOVE ProductCard tại key=2

// Vấn đề nghiêm trọng hơn khi ProductCard có internal state:
function ProductCard({ product }) {
  const [isExpanded, setIsExpanded] = useState(false)  // Internal state!
  // ...
}

// Nếu user đang expand iPhone 14 (key=0, isExpanded=true)
// Sau khi xóa iPhone 14:
// → key=0 giờ là Samsung S24, nhưng isExpanded vẫn là TRUE (state bị giữ lại sai!)
// → Samsung S24 bị expand dù user chưa click!
```

### **Giải pháp đúng: Dùng stable unique key**

```javascript
// ✅ GOOD: Dùng ID ổn định làm key
function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
        // key="1", key="2", key="3" — gắn với SẢN PHẨM, không phải vị trí
      ))}
    </ul>
  )
}

// Khi xóa iPhone 14 (id=1):
// React thấy key="1" biến mất → REMOVE đúng ProductCard của iPhone 14
// React thấy key="2" vẫn còn → KEEP Samsung S24 nguyên vẹn (kể cả state!)
// React thấy key="3" vẫn còn → KEEP Google Pixel 8 nguyên vẹn

// Kết quả: Chỉ 1 DOM operation (REMOVE) — NHANH và ĐÚNG state!
```

### **Ví dụ minh họa: React dùng key để match như thế nào**

```javascript
// Danh sách cũ (old Virtual DOM):
[
  { key: "p1", type: ProductCard, props: { product: iPhone14 } },
  { key: "p2", type: ProductCard, props: { product: Samsung } },
  { key: "p3", type: ProductCard, props: { product: Pixel } },
]

// Danh sách mới (new Virtual DOM) — thêm 1 sản phẩm ở đầu:
[
  { key: "p0", type: ProductCard, props: { product: iPad } },    // MỚI
  { key: "p1", type: ProductCard, props: { product: iPhone14 } },
  { key: "p2", type: ProductCard, props: { product: Samsung } },
  { key: "p3", type: ProductCard, props: { product: Pixel } },
]

// React Diffing với KEY:
console.log('🔍 React dùng key để match...')

// key="p0": Không có trong old list → CREATE mới
console.log('➕ key="p0": Create ProductCard cho iPad')

// key="p1": Tìm thấy trong old list → REUSE, chỉ check props
console.log('✅ key="p1": Reuse iPhone14 ProductCard — props không đổi → skip')

// key="p2": Tìm thấy trong old list → REUSE
console.log('✅ key="p2": Reuse Samsung ProductCard — props không đổi → skip')

// key="p3": Tìm thấy trong old list → REUSE
console.log('✅ key="p3": Reuse Pixel ProductCard — props không đổi → skip')

// KẾT QUẢ: Chỉ 1 CREATE operation, 3 ProductCard được tái sử dụng hoàn toàn!
// Nếu không có key: React sẽ UPDATE tất cả 4 nodes theo vị trí → 4 operations
```

### **Ví dụ thực tế: Reorder danh sách**

```javascript
// Tình huống: User sort sản phẩm theo giá
function SortableProductList() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [products] = useState([
    { id: 1, name: "iPhone 14", price: 20000000 },
    { id: 2, name: "Samsung S24", price: 15000000 },
    { id: 3, name: "Google Pixel 8", price: 18000000 },
  ])

  const sortedProducts = [...products].sort((a, b) =>
    sortOrder === 'asc' ? a.price - b.price : b.price - a.price
  )

  return (
    <div>
      <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
        Sort by price {sortOrder === 'asc' ? '↑' : '↓'}
      </button>

      {sortedProducts.map(product => (
        // ✅ key=product.id — React biết đây là CÙNG sản phẩm, chỉ đổi vị trí
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// Khi user click Sort (asc → desc):
// Old order: Samsung(id=2) → Pixel(id=3) → iPhone(id=1)
// New order: iPhone(id=1) → Pixel(id=3) → Samsung(id=2)

// React với key=id:
// → Nhận ra id=1, id=2, id=3 đều đã tồn tại
// → Chỉ REORDER DOM nodes (move operations) — không destroy/create
// → Internal state của mỗi ProductCard được GIỮ NGUYÊN

// React không có key (hoặc key=index):
// → Thấy vị trí 0 thay đổi data → UPDATE
// → Thấy vị trí 1 thay đổi data → UPDATE
// → Thấy vị trí 2 thay đổi data → UPDATE
// → 3 UPDATE operations + internal state bị reset!
```

### **Khi nào được phép dùng index làm key?**

```javascript
// ✅ OK dùng index khi list THOẢ MÃN CẢ 3 điều kiện:
// 1. List KHÔNG bao giờ reorder
// 2. List KHÔNG bao giờ filter/remove phần tử ở giữa
// 3. Các items KHÔNG có internal state

// Ví dụ an toàn: Danh sách static, chỉ append
function BreadcrumbNav({ items }) {
  return (
    <nav>
      {items.map((item, index) => (
        // ✅ OK: breadcrumb không reorder, không có state
        <span key={index}>{item.label}</span>
      ))}
    </nav>
  )
}

// ❌ KHÔNG OK: Cart items có thể xóa ở giữa, có internal state
function CartList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        // ❌ SAI: Nếu xóa item ở giữa → state của các item sau bị shift
        <CartItemCard key={index} item={item} />
      ))}
    </div>
  )
}

// ✅ ĐÚNG: Dùng stable ID
function CartList({ items }) {
  return (
    <div>
      {items.map(item => (
        <CartItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
```

### **Tóm tắt: Key giúp React làm gì?**

```
Không có key / key=index:
  Old list: [A(0), B(1), C(2)]
  New list: [B(0), C(1)]        ← A bị xóa ở đầu
  React so sánh theo vị trí:
    Vị trí 0: A → B  → UPDATE (sai!)
    Vị trí 1: B → C  → UPDATE (sai!)
    Vị trí 2: C → ∅  → REMOVE
  = 2 UPDATE + 1 REMOVE = 3 operations, state bị sai

Có key=id:
  Old list: [A(id=a), B(id=b), C(id=c)]
  New list: [B(id=b), C(id=c)]  ← A bị xóa
  React so sánh theo key:
    key=a: tồn tại trong old, không có trong new → REMOVE A
    key=b: tồn tại trong cả hai → KEEP B (không đổi)
    key=c: tồn tại trong cả hai → KEEP C (không đổi)
  = 1 REMOVE = 1 operation, state chính xác ✅
```

---

## 🔄 Diffing Algorithm - Giả định 3: Component cùng type

### **Giải thích đơn giản**

Khi React thấy cùng một component type (ví dụ: `ProductCard`), nó tin rằng component đó sẽ render ra **cấu trúc HTML tương tự**. Do đó, React chỉ cần **update props** chứ không cần **rebuild** toàn bộ component.

### **Ví dụ cụ thể: Product Card**

```javascript
// Component ProductCard luôn có cấu trúc tương tự
function ProductCard({ product, isOnSale }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <div className="price">
        {isOnSale && <span className="sale-badge">SALE</span>}
        <span className="current-price">₫{product.price}</span>
      </div>
    </div>
  )
}

// Render lần 1:
const product1 = { id: 1, name: "iPhone 14", price: 20000000, image: "iphone14.jpg" }
<ProductCard product={product1} isOnSale={false} />

// Virtual DOM Tree lần 1:
{
  type: 'div',
  props: { className: 'product-card' },
  children: [
    { type: 'img', props: { src: 'iphone14.jpg', alt: 'iPhone 14' }},
    { type: 'h3', props: { children: 'iPhone 14' }},
    { 
      type: 'div', 
      props: { className: 'price' },
      children: [
        { type: 'span', props: { className: 'current-price', children: '₫20.000.000' }}
      ]
    }
  ]
}
```

```javascript
// Render lần 2: Chỉ thay đổi props
const product2 = { id: 1, name: "iPhone 14 Pro", price: 25000000, image: "iphone14pro.jpg" }
<ProductCard product={product2} isOnSale={true} />

// Virtual DOM Tree lần 2:
{
  type: 'div',
  props: { className: 'product-card' },
  children: [
    { type: 'img', props: { src: 'iphone14pro.jpg', alt: 'iPhone 14 Pro' }},  // Changed
    { type: 'h3', props: { children: 'iPhone 14 Pro' }},  // Changed
    { 
      type: 'div', 
      props: { className: 'price' },
      children: [
        { type: 'span', props: { className: 'sale-badge', children: 'SALE' }},  // Added
        { type: 'span', props: { className: 'current-price', children: '₫25.000.000' }}  // Changed
      ]
    }
  ]
}

// React Diffing Process:
console.log('🔍 React so sánh 2 Virtual DOM trees...')

// 1. Root <div>: Cùng type → Giữ nguyên
console.log('✅ <div className="product-card">: Không đổi')

// 2. <img>: Cùng type → Update props
console.log('🔄 <img>: Update src và alt')

// 3. <h3>: Cùng type → Update children  
console.log('🔄 <h3>: Update text content')

// 4. Price <div>: Cùng type → So sánh children
console.log('✅ <div className="price">: Không đổi')

// 5. Children của price div: Có thêm element mới
console.log('➕ Thêm <span className="sale-badge">')
console.log('🔄 Update <span className="current-price">')

// KẾT QUẢ: Chỉ 4 DOM operations thay vì rebuild toàn bộ!
```

### **So sánh nếu không có giả định này**

```javascript
// Nếu React KHÔNG tin tưởng component cùng type:
function diffWithoutAssumption(oldTree, newTree) {
  console.log('😰 React phải so sánh TOÀN BỘ cây từ đầu...')
  
  // Phải check từng node một cách đệ quy
  function deepCompare(oldNode, newNode) {
    // So sánh type
    if (oldNode.type !== newNode.type) return 'REPLACE'

    // So sánh props
    const oldProps = oldNode.props || {}
    const newProps = newNode.props || {}

    // So sánh từng prop
    for (let prop in oldProps) {
      if (oldProps[prop] !== newProps[prop]) {
        // Phải update prop này
      }
    }

    // So sánh children đệ quy
    const oldChildren = oldNode.children || []
    const newChildren = newNode.children || []

    for (let i = 0; i < Math.max(oldChildren.length, newChildren.length); i++) {
      if (oldChildren[i] && newChildren[i]) {
        deepCompare(oldChildren[i], newChildren[i]) // Đệ quy!
      }
    }
  }

  // Thuật toán diff tree tổng quát có complexity O(n³)
  // React's heuristic (3 giả định) giảm xuống O(n)
}

// Với giả định "component cùng type có structure tương tự":
function diffWithAssumption(oldProductCard, newProductCard) {
  console.log('🚀 React chỉ cần update props và diff children!')

  // Tin rằng ProductCard luôn có:
  // - 1 div wrapper
  // - 1 img
  // - 1 h3
  // - 1 price div

  // React vẫn phải diff children recursively → O(n) với n = số nodes
  // Nhưng nhanh hơn rất nhiều so với O(n³) của thuật toán tổng quát
  // vì React skip việc so sánh cross-tree (chỉ so sánh cùng level)
}
```

### **Ví dụ thực tế: Product List**

```javascript
// Danh sách 1000 sản phẩm
function ProductList({ products }) {
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// Khi user search → products array thay đổi
const oldProducts = [
  { id: 1, name: "iPhone 14" },
  { id: 2, name: "iPhone 15" },
  { id: 3, name: "Samsung S24" }
]

const newProducts = [
  { id: 1, name: "iPhone 14 Pro" },  // Changed
  { id: 2, name: "iPhone 15" },      // Same
  { id: 4, name: "Google Pixel 8" }  // New
]

// React Diffing:
console.log('🔍 Diffing 1000 ProductCard components...')

// ProductCard id=1: Cùng type → Chỉ update props
console.log('🔄 ProductCard #1: Update product prop')

// ProductCard id=2: Cùng type, cùng props → Không làm gì
console.log('✅ ProductCard #2: Không thay đổi')

// ProductCard id=3: Bị remove
console.log('➖ ProductCard #3: Remove')

// ProductCard id=4: Thêm mới  
console.log('➕ ProductCard #4: Create new')

// KẾT QUẢ: Chỉ 3 operations cho 1000 components!
// Thay vì phải rebuild 1000 components từ đầu
```

---

## 🛍️ Ví dụ thực tế từ Shopee Clone

### **1. Search Suggestions - Batching Updates**

```typescript
// src/components/Header/SearchSuggestions/SearchSuggestions.tsx
function SearchSuggestions({ searchValue }: { searchValue: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // ✅ React 18+ Automatic Batching — TẤT CẢ setState đều được batch
  // Dù gọi trong event handler, setTimeout, Promise, hay bất kỳ đâu
  const updateSuggestions = (newSuggestions: string[], newProducts: Product[]) => {
    setSuggestions(newSuggestions)  // Batched
    setProducts(newProducts)        // Batched
    setLoading(false)              // Batched
    // => Chỉ 1 lần DOM update duy nhất!
  }

  // 📝 Lưu ý lịch sử:
  // - React 17 trở về trước: batching CHỈ hoạt động trong React event handlers
  //   (onClick, onChange, ...). Trong setTimeout, Promise, native events → KHÔNG batch
  // - React 18+: Automatic Batching cho TẤT CẢ contexts
  // - Dự án Shopee Clone dùng React 19 → luôn được batch tự động

  return (
    <div className="search-suggestions">
      {loading && <div>Đang tìm kiếm...</div>}
      
      {/* Suggestions list */}
      <div className="suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-item">
            {suggestion}
          </div>
        ))}
      </div>

      {/* Products list */}
      <div className="products">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

### **2. Product Card - Diffing Algorithm**

```typescript
// src/components/ProductCard/ProductCard.tsx
interface ProductCardProps {
  product: Product
  isInCart?: boolean
  isOnSale?: boolean
}

function ProductCard({ product, isInCart = false, isOnSale = false }: ProductCardProps) {
  return (
    <div className={`product-card ${isOnSale ? 'on-sale' : ''}`}>
      {/* Image - Giả định 3: Luôn có img */}
      <img 
        src={product.image} 
        alt={product.name}
        className="product-image" 
      />
      
      {/* Title - Giả định 3: Luôn có h3 */}
      <h3 className="product-title">{product.name}</h3>
      
      {/* Price - Giả định 3: Luôn có price container */}
      <div className="price-container">
        {isOnSale && <span className="sale-badge">SALE</span>}
        <span className="price">₫{product.price.toLocaleString('vi-VN')}</span>
      </div>
      
      {/* Button - Giả định 1: Khác type dựa vào isInCart */}
      {isInCart ? (
        <button className="btn-remove">Xóa khỏi giỏ</button>  // Type: button
      ) : (
        <button className="btn-add">Thêm vào giỏ</button>     // Type: button (cùng type!)
      )}
    </div>
  )
}

// Demo diffing process:
function ProductListDemo() {
  const [products, setProducts] = useState([
    { id: 1, name: "iPhone 14", price: 20000000, image: "iphone14.jpg" }
  ])
  const [cartItems, setCartItems] = useState<number[]>([])

  // Khi user thêm sản phẩm vào cart
  const addToCart = (productId: number) => {
    setCartItems(prev => [...prev, productId])
    
    // React Diffing sẽ diễn ra:
    console.log('🔍 React diffing ProductCard...')
    
    // ProductCard component: Cùng type → Giả định 3 áp dụng
    console.log('✅ ProductCard: Cùng component type, chỉ update props')
    
    // isInCart prop: false → true
    console.log('🔄 isInCart prop: false → true')
    
    // Button element: Cùng type (button) → Chỉ update content & className
    console.log('🔄 Button: Update text "Thêm vào giỏ" → "Xóa khỏi giỏ"')
    console.log('🔄 Button: Update className "btn-add" → "btn-remove"')
    
    // Không có destroy/create → Performance tốt!
  }

  return (
    <div>
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          isInCart={cartItems.includes(product.id)}
          isOnSale={product.id === 1} // iPhone 14 đang sale
        />
      ))}
    </div>
  )
}
```

### **3. Shopping Cart - Batching + Diffing Combined**

```typescript
// src/pages/Cart/Cart.tsx — Ví dụ minh họa batching + diffing
function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // ✅ Tính toán derived state thay vì dùng separate state
  // Tránh stale closure và đảm bảo consistency
  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cartItems]
  )
  const discountAmount = totalPrice > 500000 ? totalPrice * 0.1 : 0

  // Complex update — React 18+ batch tất cả setState tự động
  const updateQuantity = (itemId: string, newQuantity: number) => {
    // Chỉ cần 1 setState — totalPrice và discountAmount tự tính lại
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
    // React batch update → chỉ 1 lần DOM update!
  }

  // ⚠️ LƯU Ý: Pattern dưới đây là SAI (stale closure):
  //
  // const updateQuantityBad = (itemId, newQuantity) => {
  //   setCartItems(prev => prev.map(...))
  //   setTotalPrice(prev => {
  //     const item = cartItems.find(...)  // ← stale closure! cartItems là giá trị CŨ
  //     ...
  //   })
  //   setDiscountAmount(prev => {
  //     const newTotal = totalPrice  // ← stale closure! totalPrice là giá trị CŨ
  //     ...
  //   })
  // }
  // → Dùng useMemo cho derived state thay vì separate setState

  return (
    <div className="shopping-cart">
      {/* Cart Items - Diffing Algorithm sẽ hoạt động */}
      {cartItems.map(item => (
        <CartItemCard 
          key={item.id}           // Key giúp React identify chính xác
          item={item}             // Giả định 3: CartItemCard luôn có cấu trúc tương tự
          onUpdateQuantity={updateQuantity}
        />
      ))}
      
      {/* Summary - Chỉ update khi cần */}
      <div className="cart-summary">
        <div>Tổng tiền: ₫{totalPrice.toLocaleString('vi-VN')}</div>
        <div>Giảm giá: ₫{discountAmount.toLocaleString('vi-VN')}</div>
        <div>Thành tiền: ₫{(totalPrice - discountAmount).toLocaleString('vi-VN')}</div>
      </div>
    </div>
  )
}

// CartItemCard - Component tận dụng Diffing Algorithm
function CartItemCard({ item, onUpdateQuantity }: CartItemCardProps) {
  return (
    <div className="cart-item">
      {/* Giả định 3: Luôn có image */}
      <img src={item.product.image} alt={item.product.name} />
      
      {/* Giả định 3: Luôn có product info */}
      <div className="product-info">
        <h4>{item.product.name}</h4>
        <span>₫{item.product.price.toLocaleString('vi-VN')}</span>
      </div>
      
      {/* Giả định 3: Luôn có quantity controls */}
      <div className="quantity-controls">
        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
        <span>{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
      </div>
      
      {/* Giả định 3: Luôn có total */}
      <div className="item-total">
        ₫{(item.quantity * item.product.price).toLocaleString('vi-VN')}
      </div>
    </div>
  )
}
```

---

## 🎯 Tổng Kết

### **Batching Updates - Gộp các thay đổi:**
- **Real DOM**: Browser hiện đại có thể batch writes liên tiếp, nhưng developer phải tự tránh layout thrashing
- **Virtual DOM (React 18+)**: Automatic Batching — nhiều setState = 1 lần DOM update, trong MỌI context
- **Lợi thế**: Developer không cần lo về thứ tự read/write DOM

### **Diffing Algorithm - Giả định 1 (Element khác type):**
- **Khác type**: Destroy + Create (đơn giản nhưng chậm hơn)
- **Cùng type**: Update props (phức tạp nhưng nhanh hơn)
- **Lesson**: Giữ element type ổn định để tối ưu performance

### **Diffing Algorithm - Giả định 2 (Keys trong danh sách):**
- **Không có key / key=index**: React so sánh theo vị trí → UPDATE sai, state bị shift
- **key=stable ID**: React match chính xác từng element → chỉ REMOVE/CREATE đúng node cần thiết
- **Lesson**: Luôn dùng stable unique ID làm key, không dùng index khi list có thể reorder hoặc filter

### **Diffing Algorithm - Giả định 3 (Component cùng type):**
- **Cùng component**: React tin rằng structure tương tự
- **Chỉ diff props và children**: Thay vì rebuild toàn bộ
- **Kết quả**: O(n) thay vì O(n³) complexity của thuật toán diff tree tổng quát

### **Ứng dụng trong Shopee Clone:**
- Search suggestions batching → Mượt mà
- Product cards diffing → Hiệu quả
- Shopping cart updates → Nhanh chóng

**🚀 Virtual DOM không chỉ là về performance, mà còn về predictable và maintainable code!**

---

**📝 Tác giả**: Shopee Clone TypeScript Project
**📅 Ngày tạo**: 2024
**🔄 Cập nhật lần cuối**: 2026-03 — Sửa complexity claims, batching behavior, stale closure examples
**🎯 Mục tiêu**: Giải thích chi tiết Virtual DOM với ví dụ cụ thể