# Thay đổi thuật toán Kéo thả (Drag & Drop) — AddressBook

> File: `src/pages/User/pages/AddressBook/AddressBook.tsx`

---

## Vấn đề cũ

Trước đây, kéo thả địa chỉ sử dụng thuật toán **insertion (chèn)** của dnd-kit:

```
closestCenter + arrayMove
```

Khi kéo item A qua vị trí item B → A được **chèn** vào vị trí B → tất cả item phía sau bị **đẩy dịch** sang.

**Vấn đề thực tế**: Trong grid có ô trống (ví dụ 4 item trong grid 3 cột → 1 ô trống), `closestCenter` tính khoảng cách đến **tất cả** vùng droppable — kể cả ô trống. Kết quả: user có thể thả item vào chỗ không có gì, gây khó hiểu.

```
Trước:
┌─────┐ ┌─────┐ ┌─────┐
│  A  │ │  B  │ │  C  │   ← Kéo A thả vào ô trống → ???
└─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐
│  D  │ │     │ ← ô trống, nhưng vẫn nhận drop
└─────┘ └─────┘
```

---

## Giải pháp: Swap-only (Hoán đổi vị trí)

Thay đổi sang thuật toán **swap** — chỉ cho phép thả item lên item khác, hai cái đổi chỗ cho nhau.

### 1. Custom Collision Detection

```typescript
// CŨ: closestCenter (detect mọi thứ, kể cả ô trống)
collisionDetection={closestCenter}

// MỚI: swapOnlyCollision (chỉ detect item thực sự tồn tại)
const swapOnlyCollision: CollisionDetection = useCallback(
  (args) => {
    const collisions = closestCenter(args)
    const validIds = new Set(otherAddresses.map((addr) => addr._id))
    return collisions.filter((c) => validIds.has(c.id as string))
  },
  [otherAddresses]
)
```

**Cách hoạt động**: Vẫn dùng `closestCenter` để tính collision, nhưng **lọc bỏ** tất cả collision không phải là ID của address item thực sự. Ô trống không có ID → bị loại.

### 2. Swap thay vì Insert

```typescript
// CŨ: arrayMove — chèn rồi đẩy dịch
const newOrder = arrayMove(otherAddresses, oldIndex, newIndex)

// MỚI: swap — hoán đổi trực tiếp 2 vị trí
const newOrder = [...otherAddresses]
const temp = newOrder[activeIndex]
newOrder[activeIndex] = newOrder[overIndex]
newOrder[overIndex] = temp
```

**Khác biệt**:

```
arrayMove (cũ):  A B C D → kéo A đến C → B C A D (B, C dịch sang trái)
swap (mới):      A B C D → kéo A đến C → C B A D (chỉ A và C đổi chỗ)
```

### 3. Visual Feedback — Highlight Drop Target

Thêm state `overId` + handler `onDragOver` để track item đang hover realtime:

```typescript
const [overId, setOverId] = useState<string | null>(null)

const handleDragOver = useCallback((event: DragOverEvent) => {
  setOverId(event.over ? (event.over.id as string) : null)
}, [])
```

Truyền `isDropTarget` xuống `SortableAddressCard`:

```typescript
isDropTarget={overId === address._id && activeId !== address._id}
```

Khi `isDropTarget = true` → item đích hiện viền cam + phóng to nhẹ:

```typescript
isDropTarget
  ? 'ring-2 ring-orange ring-offset-2 scale-[1.02]'  // ← highlight
  : ''
```

---

## Tóm tắt thay đổi

| Thành phần | Cũ | Mới |
|---|---|---|
| Collision detection | `closestCenter` | `swapOnlyCollision` (filter chỉ item thực) |
| Thuật toán sắp xếp | `arrayMove` (chèn) | Swap trực tiếp (hoán đổi) |
| Drop vào ô trống | ✅ Cho phép | ❌ Không cho phép |
| Visual feedback hover | Không có | Viền cam + scale 1.02 |
| Tracking hover | Không có | `overId` state + `onDragOver` |

---

## Tại sao chọn Swap?

1. **4 phần tử** — với số lượng ít, swap trực quan hơn insert. User thấy rõ "A đổi chỗ B" thay vì "A chen vào, mọi thứ dịch chuyển".

2. **Grid có ô trống** — insert cho phép thả vào ô trống gây confuse. Swap chỉ cho thả lên item khác → không có hành vi bất ngờ.

3. **Dễ hiểu** — kéo item 1 thả lên item 3 → hai cái đổi chỗ. Item 2 và 4 không bị ảnh hưởng. Đơn giản, dễ đoán.

---

## Test

Tất cả 451 tests pass sau thay đổi. Không có test nào bị ảnh hưởng vì logic drag-and-drop chỉ thay đổi behavior, không thay đổi API hay data flow.

