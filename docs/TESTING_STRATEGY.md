# Chiến Lược Testing - Shopee Clone TypeScript

## 📋 Tổng Quan

Tài liệu này cung cấp chiến lược testing toàn diện cho dự án Shopee Clone TypeScript, được sắp xếp theo thứ tự ưu tiên từ cơ bản đến nâng cao.

## 🎯 Mục Tiêu Testing

- **Đảm bảo chất lượng code**: Phát hiện lỗi sớm trong quá trình phát triển
- **Tăng độ tin cậy**: Đảm bảo các tính năng hoạt động đúng như mong đợi
- **Hỗ trợ refactoring**: An toàn khi thay đổi code
- **Documentation**: Test cases là tài liệu sống của hệ thống

## 📊 Tình Trạng Hiện Tại

✅ **Đã có sẵn (18/20 test cases PASS)**:

- Integration tests cho Navigation (App.test.tsx)
- Authentication flow (Login.test.tsx)
- User profile management (Profile.test.tsx)
- MSW setup hoàn chỉnh
- Custom test utilities

❌ **Cần cải thiện**:

- 2 test cases còn fail cần fix
- Thiếu unit tests cho components
- Thiếu tests cho business logic

## 🏗️ Chiến Lược Testing Theo Cấp Độ

### **LEVEL 1: Foundation Components (Ưu tiên cao nhất)**

#### 1.1 Core Input Components

```
📁 src/components/Input/Input.test.tsx
📁 src/components/InputV2/InputV2.test.tsx
📁 src/components/InputNumber/InputNumber.test.tsx
📁 src/components/InputFile/InputFile.test.tsx
```

**Lý do ưu tiên**: Được sử dụng xuyên suốt ứng dụng, nếu lỗi sẽ ảnh hưởng toàn bộ hệ thống.

**Test cases cần cover**:

- ✅ Render đúng với props
- ✅ Handle user input (onChange, onBlur)
- ✅ Validation và error messages
- ✅ Accessibility (aria-labels, keyboard navigation)
- ✅ Edge cases (empty values, special characters)

#### 1.2 UI Controls

```
📁 src/components/Button/Button.test.tsx
📁 src/components/QuantityController/QuantityController.test.tsx
📁 src/components/ShopeeCheckbox/ShopeeCheckbox.test.tsx
```

**Test cases cần cover**:

- ✅ Click handlers
- ✅ Disabled states
- ✅ Loading states
- ✅ Quantity constraints (min/max)

#### 1.3 Navigation Components

```
📁 src/components/Pagination/Pagination.test.tsx
📁 src/components/NavHeader/NavHeader.test.tsx
```

**Test cases cần cover**:

- ✅ Page navigation logic
- ✅ URL parameter handling
- ✅ Edge cases (first/last page)

### **LEVEL 2: Business Logic Components (Ưu tiên trung bình)**

#### 2.1 Product Components

```
📁 src/pages/ProductList/components/Product/Product.test.tsx
📁 src/pages/ProductList/components/AsideFilter/AsideFilter.test.tsx
📁 src/pages/ProductList/components/SortProductList/SortProductList.test.tsx
📁 src/pages/ProductList/components/RatingStars/RatingStars.test.tsx
```

**Test cases cần cover**:

- ✅ Product display logic
- ✅ Filter functionality
- ✅ Sort options
- ✅ Rating calculations
- ✅ Price formatting

#### 2.2 Cart Components

```
📁 src/components/CartItem/CartItem.test.tsx
📁 src/components/CartSummary/CartSummary.test.tsx
```

**Test cases cần cover**:

- ✅ Quantity updates
- ✅ Price calculations
- ✅ Remove item functionality
- ✅ Cart total calculations

#### 2.3 Header Components

```
📁 src/components/Header/Header.test.tsx
📁 src/components/Header/SearchSuggestions/SearchSuggestions.test.tsx
📁 src/components/Header/NotificationDropdown/NotificationDropdown.test.tsx
```

**Test cases cần cover**:

- ✅ Search functionality
- ✅ User authentication states
- ✅ Notification handling
- ✅ Language switching

### **LEVEL 3: Integration & Flow Testing (Ưu tiên thấp nhất)**

#### 3.1 Page-Level Integration

```
📁 src/pages/ProductList/ProductList.test.tsx
📁 src/pages/ProductDetail/ProductDetail.test.tsx
📁 src/pages/Cart/Cart.test.tsx (đã có, cần cải thiện)
```

**Test cases cần cover**:

- ✅ API integration với MSW
- ✅ State management
- ✅ User interactions flow
- ✅ Error handling

#### 3.2 Complete User Flows

```
📁 src/__tests__/flows/PurchaseFlow.test.tsx
📁 src/__tests__/flows/AuthenticationFlow.test.tsx
📁 src/__tests__/flows/SearchFlow.test.tsx
```

**Test cases cần cover**:

- ✅ End-to-end user journeys
- ✅ Cross-page navigation
- ✅ Data persistence
- ✅ Error recovery

## 🛠️ Testing Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
// ✅ Good
test('should update quantity when plus button clicked', () => {
  // Arrange
  const mockOnChange = vi.fn()
  render(<QuantityController value={1} onChange={mockOnChange} />)

  // Act
  fireEvent.click(screen.getByRole('button', { name: /tăng/i }))

  // Assert
  expect(mockOnChange).toHaveBeenCalledWith(2)
})
```

### 2. Query Priority

```typescript
// ✅ Preferred order
screen.getByRole('button', { name: /đăng nhập/i })
screen.getByLabelText(/email/i)
screen.getByPlaceholderText(/nhập email/i)
screen.getByDisplayValue(/user@example.com/i)
screen.getByTestId('login-button') // Last resort
```

### 3. User-Centric Testing

```typescript
// ✅ Test user behavior, not implementation
test('should show error when email is invalid', async () => {
  render(<LoginForm />)

  // User types invalid email
  await user.type(screen.getByLabelText(/email/i), 'invalid-email')
  await user.click(screen.getByRole('button', { name: /đăng nhập/i }))

  // User sees error message
  expect(screen.getByText(/email không hợp lệ/i)).toBeInTheDocument()
})
```

### 4. Mock Strategy

```typescript
// ✅ Mock external dependencies
vi.mock('../apis/auth.api', () => ({
  loginAccount: vi.fn()
}))

// ✅ Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
})
```

## 📋 Implementation Roadmap

### Phase 1: Foundation (Tuần 1-2)

- [ ] Hoàn thiện Input components tests
- [ ] Button và UI controls tests
- [ ] Fix 2 test cases hiện tại đang fail

### Phase 2: Business Logic (Tuần 3-4)

- [ ] Product-related components
- [ ] Cart functionality
- [ ] Header components

### Phase 3: Integration (Tuần 5-6)

- [ ] Page-level tests
- [ ] User flow tests
- [ ] Performance tests

### Phase 4: Advanced (Tuần 7-8)

- [ ] E2E tests với Playwright
- [ ] Visual regression tests
- [ ] Accessibility tests

## 🎯 Coverage Goals

| Component Type  | Target Coverage | Priority |
| --------------- | --------------- | -------- |
| Core Components | 90%+            | High     |
| Business Logic  | 85%+            | Medium   |
| Integration     | 70%+            | Low      |
| Utils/Helpers   | 95%+            | High     |

## 🔧 Tools & Setup

### Testing Stack

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: c8/v8
- **E2E**: Playwright (future)

### Configuration Files

- `vitest.setup.js` - Global test setup
- `src/utils/testUtils.tsx` - Custom utilities
- `src/msw/` - API mocking

## 📝 Test Template

```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  const defaultProps = {
    // Define default props
  }

  beforeEach(() => {
    // Setup before each test
  })

  describe('Rendering', () => {
    test('should render with default props', () => {
      render(<ComponentName {...defaultProps} />)
      // Assertions
    })
  })

  describe('User Interactions', () => {
    test('should handle user input', async () => {
      const user = userEvent.setup()
      // Test user interactions
    })
  })

  describe('Edge Cases', () => {
    test('should handle error states', () => {
      // Test error scenarios
    })
  })
})
```

## 🚀 Quick Start

1. **Chạy tests**:

   ```bash
   pnpm run test
   ```

2. **Chạy với coverage**:

   ```bash
   pnpm run test:coverage
   ```

3. **Watch mode**:

   ```bash
   pnpm run test:watch
   ```

4. **Test specific file**:
   ```bash
   pnpm run test Input.test.tsx
   ```

## 📚 Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Lưu ý**: Tài liệu này sẽ được cập nhật thường xuyên khi dự án phát triển. Hãy tuân thủ các best practices và ưu tiên theo roadmap đã đề xuất để đạt hiệu quả tối ưu.
