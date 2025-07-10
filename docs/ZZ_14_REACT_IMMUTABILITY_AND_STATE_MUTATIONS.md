# React Immutability & State Mutations - Phân Tích Toàn Diện

## Tổng Quan

Trong React, **immutability** (tính bất biến) là một nguyên tắc cốt lõi quan trọng. Việc hiểu rõ về immutability và cách xử lý state mutations sẽ giúp bạn tránh được nhiều bugs khó debug và tối ưu hiệu suất ứng dụng.

## 1. Immutability trong React - Tại Sao Quan Trọng?

### 1.1. React's Reconciliation Algorithm

React sử dụng **Object.is()** và **shallow comparison** để kiểm tra xem component có cần re-render hay không:

```javascript
// React internal comparison (simplified)
function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) {
    return true // Same reference = no re-render
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (!Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}
```

### 1.2. Vấn Đề Với Mutable Updates

```javascript
// ❌ WRONG - Mutation trực tiếp
const [user, setUser] = useState({ name: 'John', age: 25 })

const updateAge = () => {
  user.age = 26 // Mutate trực tiếp object
  setUser(user) // React không detect được thay đổi!
  // Vì reference vẫn giống nhau → No re-render
}

// ✅ CORRECT - Immutable update
const updateAge = () => {
  setUser({ ...user, age: 26 }) // Tạo object mới
  // New reference → React detects change → Re-render
}
```

## 2. Các Vấn Đề Thường Gặp Với Mutable State

### 2.1. Array Mutations

```javascript
// ❌ WRONG - Direct array mutations
const [items, setItems] = useState(['apple', 'banana'])

const addItem = (newItem) => {
  items.push(newItem) // Mutate array trực tiếp
  setItems(items) // React không re-render!
}

const removeItem = (index) => {
  items.splice(index, 1) // Mutate array
  setItems(items) // No re-render!
}

// ✅ CORRECT - Immutable array updates
const addItem = (newItem) => {
  setItems([...items, newItem]) // Tạo array mới
}

const removeItem = (index) => {
  setItems(items.filter((_, i) => i !== index)) // Tạo array mới
}
```

### 2.2. Nested Object Mutations

```javascript
// ❌ WRONG - Deep mutation
const [user, setUser] = useState({
  profile: {
    name: 'John',
    address: {
      city: 'Hanoi',
      country: 'Vietnam'
    }
  }
})

const updateCity = (newCity) => {
  user.profile.address.city = newCity // Deep mutation
  setUser(user) // React không detect!
}

// ✅ CORRECT - Immutable deep update
const updateCity = (newCity) => {
  setUser({
    ...user,
    profile: {
      ...user.profile,
      address: {
        ...user.profile.address,
        city: newCity
      }
    }
  })
}
```

## 3. Memory Reference và Shallow Comparison

### 3.1. Hiểu Về Memory Reference

```javascript
// Ví dụ về reference equality
const obj1 = { name: 'John' }
const obj2 = { name: 'John' }
const obj3 = obj1

console.log(obj1 === obj2) // false - Different references
console.log(obj1 === obj3) // true - Same reference

// React sử dụng Object.is() tương tự như ===
console.log(Object.is(obj1, obj2)) // false
console.log(Object.is(obj1, obj3)) // true
```

### 3.2. Tại Sao React Chỉ Làm Shallow Comparison?

```javascript
// Deep comparison sẽ rất expensive về performance
function deepEqual(a, b) {
  if (a === b) return true

  if (typeof a !== 'object' || typeof b !== 'object') return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  // Đệ quy qua tất cả properties (expensive!)
  for (let key of keysA) {
    if (!deepEqual(a[key], b[key])) return false
  }

  return true
}

// React chọn shallow comparison vì:
// 1. Performance - O(n) thay vì O(n^m)
// 2. Predictable behavior
// 3. Encourage immutable patterns
```

## 4. Các Kỹ Thuật Immutable Updates Thủ Công

### 4.1. Spread Operator cho Objects

```javascript
// Basic object update
const updateUser = (updates) => {
  setUser({ ...user, ...updates })
}

// Conditional updates
const toggleActive = () => {
  setUser({ ...user, isActive: !user.isActive })
}

// Nested object update (manual)
const updateProfile = (profileUpdates) => {
  setUser({
    ...user,
    profile: {
      ...user.profile,
      ...profileUpdates
    }
  })
}
```

### 4.2. Array Methods cho Immutable Updates

```javascript
const [todos, setTodos] = useState([])

// Add item
const addTodo = (todo) => {
  setTodos([...todos, todo]) // hoặc todos.concat(todo)
}

// Update item by id
const updateTodo = (id, updates) => {
  setTodos(todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)))
}

// Remove item
const removeTodo = (id) => {
  setTodos(todos.filter((todo) => todo.id !== id))
}

// Insert at specific position
const insertTodo = (index, todo) => {
  setTodos([...todos.slice(0, index), todo, ...todos.slice(index)])
}
```

### 4.3. Các Utility Functions Tự Viết

```javascript
// Deep clone utility
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj

  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map((item) => deepClone(item))

  const cloned = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

// Set nested property immutably
function setNestedProperty(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()

  let current = { ...obj }
  let target = current

  for (let key of keys) {
    target[key] = { ...target[key] }
    target = target[key]
  }

  target[lastKey] = value
  return current
}

// Usage
const newUser = setNestedProperty(user, 'profile.address.city', 'Ho Chi Minh')
```

## 5. Lodash - Utility Library cho Immutable Operations

### 5.1. Cài Đặt và Setup

```bash
npm install lodash
npm install @types/lodash # TypeScript support
```

### 5.2. Lodash Methods for Immutability

```javascript
import _ from 'lodash'

// Deep clone
const clonedUser = _.cloneDeep(user)
clonedUser.profile.name = 'Jane' // Safe mutation

// Merge objects immutably
const updatedUser = _.merge({}, user, { profile: { age: 30 } })

// Set nested value immutably
const newUser = _.set(_.cloneDeep(user), 'profile.address.city', 'Da Nang')

// Update array immutably
const updatedTodos = _.map(todos, (todo) => (todo.id === targetId ? _.assign({}, todo, updates) : todo))

// Pick specific properties
const userSummary = _.pick(user, ['id', 'name', 'email'])

// Omit properties
const userWithoutSensitiveData = _.omit(user, ['password', 'creditCard'])
```

### 5.3. Lodash Performance Considerations

```javascript
// ❌ Expensive - Deep clone toàn bộ object lớn
const updateName = (newName) => {
  const cloned = _.cloneDeep(massiveUserObject)
  cloned.profile.name = newName
  setUser(cloned)
}

// ✅ Better - Chỉ clone những gì cần thiết
const updateName = (newName) => {
  setUser({
    ...user,
    profile: {
      ...user.profile,
      name: newName
    }
  })
}

// ✅ Optimal - Sử dụng Lodash cho complex operations
const updateNestedData = (path, value) => {
  const updated = _.set(_.cloneDeep(user), path, value)
  setUser(updated)
}
```

## 6. Immer - Immutable State với Mutable API

### 6.1. Cài Đặt Immer

```bash
npm install immer
```

### 6.2. Cách Immer Hoạt Động

```javascript
import { produce } from 'immer'

// Immer sử dụng Proxy để track mutations
const [user, setUser] = useState({
  profile: {
    name: 'John',
    address: {
      city: 'Hanoi',
      country: 'Vietnam'
    }
  },
  todos: ['Learn React', 'Build app']
})

// ✅ Immer - Write mutable code, get immutable result
const updateUserWithImmer = () => {
  const newUser = produce(user, (draft) => {
    // draft là proxy object, có thể mutate trực tiếp
    draft.profile.name = 'Jane'
    draft.profile.address.city = 'Ho Chi Minh'
    draft.todos.push('Deploy app')
    draft.todos[0] = 'Master React'
  })

  setUser(newUser) // newUser là completely new object
}
```

### 6.3. Immer với useImmer Hook

```javascript
import { useImmer } from 'use-immer'

const [user, updateUser] = useImmer({
  profile: { name: 'John', age: 25 },
  todos: []
})

// Cực kỳ đơn giản!
const addTodo = (todo) => {
  updateUser((draft) => {
    draft.todos.push(todo) // Direct mutation!
  })
}

const updateProfile = (field, value) => {
  updateUser((draft) => {
    draft.profile[field] = value // Direct mutation!
  })
}
```

### 6.4. Immer Advanced Patterns

```javascript
import { produce, enableMapSet } from 'immer'

// Enable Map/Set support
enableMapSet()

// Complex state with Maps and Sets
const [appState, setAppState] = useState({
  users: new Map(),
  activeUsers: new Set(),
  settings: { theme: 'light', lang: 'vi' }
})

const addUser = (user) => {
  setAppState(
    produce((draft) => {
      draft.users.set(user.id, user)
      draft.activeUsers.add(user.id)
    })
  )
}

// Conditional updates
const toggleUserStatus = (userId) => {
  setAppState(
    produce((draft) => {
      const user = draft.users.get(userId)
      if (user) {
        user.isActive = !user.isActive
        if (user.isActive) {
          draft.activeUsers.add(userId)
        } else {
          draft.activeUsers.delete(userId)
        }
      }
    })
  )
}
```

## 7. So Sánh Các Phương Pháp

### 7.1. Performance Comparison

| Method            | Bundle Size | Runtime Performance | Learning Curve | Use Case               |
| ----------------- | ----------- | ------------------- | -------------- | ---------------------- |
| **Manual Spread** | 0KB         | Fastest             | Easy           | Simple updates         |
| **Lodash**        | ~70KB       | Good                | Medium         | Utility-heavy apps     |
| **Immer**         | ~14KB       | Good                | Easy           | Complex nested updates |

### 7.2. Code Comparison

```javascript
// Scenario: Update nested user profile
const updateUserCity = (newCity) => {
  // Manual spread (verbose but explicit)
  setUser({
    ...user,
    profile: {
      ...user.profile,
      address: {
        ...user.profile.address,
        city: newCity
      }
    }
  })

  // Lodash (functional approach)
  setUser(_.set(_.cloneDeep(user), 'profile.address.city', newCity))

  // Immer (intuitive mutation)
  setUser(
    produce((draft) => {
      draft.profile.address.city = newCity
    })
  )
}
```

## 8. Best Practices và Recommendations

### 8.1. Khi Nào Sử Dụng Từng Phương Pháp?

#### Manual Spread Operator

✅ **Sử dụng khi:**

- Simple state structure
- Performance critical operations
- Bundle size matters
- Team familiar với immutable patterns

```javascript
// Good for simple updates
const updateName = (name) => setUser({ ...user, name })
const addItem = (item) => setItems([...items, item])
```

#### Lodash

✅ **Sử dụng khi:**

- Already using Lodash in project
- Complex data transformations
- Need utility functions beyond immutability

```javascript
// Good for complex operations
const processUserData = (userData) => {
  return _.chain(userData).cloneDeep().pick(['id', 'profile', 'settings']).merge({ lastUpdated: Date.now() }).value()
}
```

#### Immer

✅ **Sử dụng khi:**

- Deep nested state
- Complex state logic
- Team prefers mutable-style code
- Redux Toolkit (includes Immer)

```javascript
// Excellent for complex nested updates
const updateUserPreferences = (preferences) => {
  setUser(
    produce((draft) => {
      Object.assign(draft.settings.preferences, preferences)
      draft.lastModified = Date.now()
      draft.history.push({
        action: 'preferences_updated',
        timestamp: Date.now()
      })
    })
  )
}
```

### 8.2. Common Pitfalls

```javascript
// ❌ Don't mix mutable and immutable patterns
const badUpdate = () => {
  const newUser = { ...user }
  newUser.profile.name = 'Jane' // Still mutating!
  setUser(newUser)
}

// ❌ Don't overuse deep cloning
const inefficientUpdate = () => {
  const cloned = JSON.parse(JSON.stringify(massiveObject)) // Expensive!
  cloned.simpleField = 'new value'
  setData(cloned)
}

// ❌ Don't ignore TypeScript types with Immer
const typedUpdate = () => {
  updateUser((draft) => {
    draft.nonExistentField = 'value' // TypeScript error!
  })
}
```

### 8.3. Testing Immutability

```javascript
// Test helper to verify immutability
const testImmutability = (originalState, updateFunction, ...args) => {
  const originalRef = originalState
  const newState = updateFunction(originalState, ...args)

  expect(newState).not.toBe(originalRef) // Different reference
  expect(originalState).toEqual(originalRef) // Original unchanged

  return newState
}

// Usage in tests
test('user update should be immutable', () => {
  const originalUser = { name: 'John', age: 25 }

  const updatedUser = testImmutability(originalUser, (user, updates) => ({ ...user, ...updates }), { age: 26 })

  expect(updatedUser).toEqual({ name: 'John', age: 26 })
  expect(originalUser).toEqual({ name: 'John', age: 25 }) // Unchanged
})
```

## 9. Real-world Examples từ Shopee Clone

### 9.1. Shopping Cart State Management

```javascript
// src/contexts/app.context.tsx
interface CartItem {
  product: Product;
  buy_count: number;
}

const [cart, setCart] = useState<CartItem[]>([]);

// Add to cart (immutable)
const addToCart = (product: Product, quantity: number) => {
  const existingIndex = cart.findIndex(item => item.product._id === product._id);

  if (existingIndex !== -1) {
    // Update existing item
    setCart(cart.map((item, index) =>
      index === existingIndex
        ? { ...item, buy_count: item.buy_count + quantity }
        : item
    ));
  } else {
    // Add new item
    setCart([...cart, { product, buy_count: quantity }]);
  }
};

// Update quantity (with Immer would be cleaner)
const updateQuantity = (productId: string, newQuantity: number) => {
  setCart(produce(draft => {
    const item = draft.find(item => item.product._id === productId);
    if (item) {
      item.buy_count = newQuantity;
    }
  }));
};
```

### 9.2. Form State với Nested Objects

```javascript
// Profile form state
const [profile, setProfile] = useState({
  personal: {
    name: '',
    phone: '',
    email: ''
  },
  address: {
    street: '',
    city: '',
    country: ''
  }
});

// Manual approach (verbose)
const updatePersonalInfo = (field: string, value: string) => {
  setProfile({
    ...profile,
    personal: {
      ...profile.personal,
      [field]: value
    }
  });
};

// Immer approach (cleaner)
const updatePersonalInfoWithImmer = (field: string, value: string) => {
  setProfile(produce(draft => {
    draft.personal[field] = value;
  }));
};
```

## 10. Kết Luận và Recommendations

### 10.1. Tổng Kết Quan Trọng

1. **React yêu cầu immutable updates** để trigger re-renders chính xác
2. **Shallow comparison** là lý do tại sao cần tạo new references
3. **Manual spread operator** cho simple updates
4. **Lodash** cho utility-heavy applications
5. **Immer** cho complex nested state management

### 10.2. Workflow Recommendations

```javascript
// Recommended approach for different scenarios

// 1. Simple state updates → Manual
const [user, setUser] = useState({ name: '', age: 0 })
const updateAge = (age) => setUser({ ...user, age })

// 2. Complex nested state → Immer
const [appState, setAppState] = useImmer(complexInitialState)
const updateNested = (path, value) => {
  setAppState((draft) => {
    // Navigate to nested property and update
    const keys = path.split('.')
    let current = draft
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
  })
}

// 3. Data transformations → Lodash
const processData = (rawData) => {
  return _.chain(rawData)
    .cloneDeep()
    .map((item) => _.pick(item, ['id', 'name', 'value']))
    .filter((item) => item.value > 0)
    .orderBy(['name'], ['asc'])
    .value()
}
```

### 10.3. Migration Strategy

1. **Start** với manual spread cho new features
2. **Introduce Immer** cho complex state logic
3. **Keep Lodash** nếu đã sử dụng cho utilities khác
4. **Gradually refactor** existing mutable code

Hiểu rõ về immutability và cách xử lý state mutations sẽ giúp bạn:

- ✅ Tránh bugs liên quan đến stale state
- ✅ Tối ưu performance với proper re-renders
- ✅ Viết code dễ debug và maintain
- ✅ Integrate tốt với React DevTools và time-travel debugging

**Remember**: Immutability không chỉ là requirement của React mà còn là best practice cho functional programming và predictable state management!
