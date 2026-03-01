# 🛒 Shopping Cart & Performance - Shopee Clone

## 🎯 Mục Lục

- [Chương 21: Shopping Cart](#chương-21-shopping-cart)
- [Chương 22: User Profile](#chương-22-user-profile)
- [Chương 23: Performance Optimization](#chương-23-performance-optimization)

---

## 🛒 Chương 21: Shopping Cart

### 🎬 Video 196: Cập nhật InputNumber & QuantityController

#### 🔧 Local State Management

```typescript
// InputNumber với local state khi không có props
const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ value, onChange, ...rest }, ref) => {
    const [localValue, setLocalValue] = useState(Number(value) || 0);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (/^\d+$/.test(value) || value === '') {
        // Update local state
        setLocalValue(Number(value));
        // Call external onChange if provided
        onChange && onChange(event);
      }
    };

    return (
      <input
        {...rest}
        ref={ref}
        value={value !== undefined ? value : localValue}
        onChange={handleChange}
      />
    );
  }
);
```

#### 🎮 QuantityController Enhancement

```typescript
// Enhanced QuantityController với local state
const QuantityController = ({ value, onChange, ...rest }: QuantityControllerProps) => {
  const [localValue, setLocalValue] = useState(Number(value) || 0);

  const increase = () => {
    const _value = Number(value || localValue) + 1;
    setLocalValue(_value);
    onChange && onChange(_value);
  };

  const decrease = () => {
    let _value = Number(value || localValue) - 1;
    if (_value < 1) _value = 1;
    setLocalValue(_value);
    onChange && onChange(_value);
  };

  return (
    <div className="flex items-center">
      <button onClick={decrease}>-</button>
      <InputNumber
        value={value !== undefined ? value : localValue}
        onChange={(e) => {
          const _value = Number(e.target.value);
          setLocalValue(_value);
          onChange && onChange(_value);
        }}
      />
      <button onClick={increase}>+</button>
    </div>
  );
};
```

### 🎬 Video 197: InputV2 với useController

#### 🎛️ Generic Type Integration

```typescript
// Demonstration: Generic types với function dependency
interface GenericExample<TFunc extends () => string, TLastName extends ReturnType<TFunc>> {
  person: {
    getName: TFunc;
  };
  lastName: TLastName;
}

// InputV2 với useController và generic types
interface InputV2Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName>, InputNumberProps {}

const InputV2 = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  type,
  onChange,
  className,
  classNameInput,
  classNameError,
  value = '',
  ...rest
}: InputV2Props<TFieldValues, TName>) => {
  const { field, fieldState } = useController(rest);
  const [localValue, setLocalValue] = useState<string>(field.value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valueFromInput = event.target.value;
    const numberCondition = type === 'number' && (/^\d+$/.test(valueFromInput) || valueFromInput === '');

    if (numberCondition || type !== 'number') {
      setLocalValue(valueFromInput);
      field.onChange(event);
      onChange && onChange(event);
    }
  };

  return (
    <div className={className}>
      <input
        {...field}
        className={classNameInput}
        onChange={handleChange}
        value={value || localValue}
      />
      <div className={classNameError}>{fieldState.error?.message}</div>
    </div>
  );
};
```

### 🎬 Video 198: Purchase API & Logout Fix

#### 🛒 Purchase API Definitions

```typescript
// Purchase API endpoints
const purchaseApi = {
  addToCart: (body: { product_id: string; buy_count: number }) =>
    http.post<SuccessResponse<Purchase>>('/purchases/add-to-cart', body),

  getPurchases: (params: { status: PurchaseStatus }) => http.get<SuccessResponse<Purchase[]>>('/purchases', { params }),

  buyProducts: (body: { product_id: string; buy_count: number }[]) =>
    http.post<SuccessResponse<Purchase[]>>('/purchases/buy-products', body),

  updatePurchase: (body: { product_id: string; buy_count: number }) =>
    http.put<SuccessResponse<Purchase>>('/purchases/update-purchase', body),

  deletePurchases: (purchaseIds: string[]) =>
    http.delete<SuccessResponse<{ deleted_count: number }>>('/purchases', {
      data: purchaseIds
    })
}

// Purchase status constants
export const purchaseStatus = {
  inCart: -1,
  waitForConfirmation: 1,
  waitForGetting: 2,
  inProgress: 3,
  delivered: 4,
  cancelled: 5
} as const
```

#### 🚪 Logout Query Cleanup

```typescript
// Clear React Query cache on logout
const logoutMutation = useMutation({
  mutationFn: authApi.logout,
  onSuccess: () => {
    queryClient.removeQueries({
      queryKey: ['purchases', { status: purchaseStatus.inCart }],
      exact: true
    })
    // Clear other user-specific queries...
  }
})
```

### 🎬 Video 199: Cart UI Implementation

#### 🎨 Cart Layout Structure

```typescript
// Cart với sticky summary
const Cart = () => {
  return (
    <div className="bg-neutral-100 py-16">
      <div className="container">
        {/* Cart Items */}
        <div className="overflow-auto">
          <div className="min-w-[1000px]">
            {/* Header */}
            <div className="grid grid-cols-12 rounded-sm bg-white py-5 px-9 text-sm capitalize text-gray-500 shadow">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2">Đơn giá</div>
              <div className="col-span-2">Số lượng</div>
              <div className="col-span-1">Số tiền</div>
              <div className="col-span-1">Thao tác</div>
            </div>

            {/* Cart Items */}
            {extendedPurchases.map((purchase, index) => (
              <CartItem key={purchase._id} purchase={purchase} index={index} />
            ))}
          </div>
        </div>

        {/* Sticky Summary */}
        <div className="sticky bottom-0 z-10 mt-8 flex flex-col rounded-sm border border-gray-100 bg-white p-5 shadow sm:flex-row sm:items-center">
          <div className="flex items-center">
            <div className="flex flex-shrink-0 items-center justify-center pr-3">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={isAllChecked}
                onChange={handleCheckAll}
              />
            </div>
            <button className="mx-3 border-none bg-none">Chọn tất cả ({extendedPurchases.length})</button>
            <button className="mx-3 border-none bg-none" onClick={handleDeleteManyPurchases}>
              Xóa
            </button>
          </div>

          <div className="mt-5 flex flex-col sm:ml-auto sm:mt-0 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center sm:justify-end">
                <div>Tổng thanh toán ({checkedPurchasesCount} sản phẩm):</div>
                <div className="ml-2 text-2xl text-orange">₫{formatCurrency(totalCheckedPurchasePrice)}</div>
              </div>
              <div className="flex items-center text-sm sm:justify-end">
                <div className="text-gray-500">Tiết kiệm</div>
                <div className="ml-6 text-orange">₫{formatCurrency(totalCheckedPurchaseSavingPrice)}</div>
              </div>
            </div>
            <Button
              className="mt-5 flex h-10 w-52 items-center justify-center bg-red-500 text-sm uppercase text-white hover:bg-red-600 sm:ml-4 sm:mt-0"
              onClick={handleBuyPurchases}
              disabled={buyPurchasesMutation.isLoading}
            >
              Mua hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 🎬 Video 200: Checked State với Immer.js

#### 🔄 Extended Purchase Type

```typescript
// Extended Purchase với checked và disabled state
export interface ExtendedPurchase extends Purchase {
  disabled: boolean
  checked: boolean
}

// Context state cho extended purchases
interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  extendedPurchases: ExtendedPurchase[]
  setExtendedPurchases: React.Dispatch<React.SetStateAction<ExtendedPurchase[]>>
  reset: () => void
}
```

#### 🔧 Immer.js cho State Updates

```typescript
import { produce } from 'immer'

// Initialize extended purchases from API data
useEffect(() => {
  setExtendedPurchases((prev) => {
    const extendedPurchasesObject = keyBy(prev, '_id')
    return (
      purchasesInCart?.map((purchase) => ({
        ...purchase,
        disabled: false,
        checked: Boolean(extendedPurchasesObject[purchase._id]?.checked)
      })) || []
    )
  })
}, [purchasesInCart])

// Handle individual item check
const handleCheck = (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
  setExtendedPurchases(
    produce((draft) => {
      draft[purchaseIndex].checked = event.target.checked
    })
  )
}

// Handle check all
const handleCheckAll = () => {
  setExtendedPurchases((prev) =>
    prev.map((purchase) => ({
      ...purchase,
      checked: !isAllChecked
    }))
  )
}

// Computed values
const isAllChecked = useMemo(() => extendedPurchases.every((purchase) => purchase.checked), [extendedPurchases])

const checkedPurchases = useMemo(() => extendedPurchases.filter((purchase) => purchase.checked), [extendedPurchases])
```

### 🎬 Video 201: Update Cart Logic

#### 🔄 Update Purchase Mutation

```typescript
// Update purchase quantity
const updatePurchaseMutation = useMutation({
  mutationFn: purchaseApi.updatePurchase,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['purchases', { status: purchaseStatus.inCart }]
    })
  }
})

// Handle quantity change
const handleQuantity = (purchaseIndex: number, value: number, enabled: boolean) => {
  if (enabled) {
    const purchase = extendedPurchases[purchaseIndex]

    // Disable item during update
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].disabled = true
      })
    )

    // Update quantity
    updatePurchaseMutation.mutate({
      product_id: purchase.product._id,
      buy_count: value
    })
  }
}

// QuantityController event handlers
const handleTypeQuantity = (purchaseIndex: number) => (value: number) => {
  setExtendedPurchases(
    produce((draft) => {
      draft[purchaseIndex].buy_count = value
    })
  )
}

const handleQuantityFocusOut = (purchaseIndex: number, value: number) => {
  handleQuantity(purchaseIndex, value, value !== (purchasesInCart as Purchase[])[purchaseIndex]?.buy_count)
}
```

#### 🎮 Quantity Controls

```typescript
// Enhanced QuantityController với onFocusOut
<QuantityController
  max={purchase.product.quantity}
  value={purchase.buy_count}
  classNameWrapper="flex items-center"
  onIncrease={(value) => handleQuantity(index, value, value <= purchase.product.quantity)}
  onDecrease={(value) => handleQuantity(index, value, value >= 1)}
  onType={handleTypeQuantity(index)}
  onFocusOut={(value) => handleQuantityFocusOut(index, value)}
  disabled={purchase.disabled}
/>
```

### 🎬 Video 202: Delete & Buy Functions

#### 🗑️ Delete Purchases

```typescript
// Delete mutation
const deletePurchasesMutation = useMutation({
  mutationFn: purchaseApi.deletePurchases,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['purchases', { status: purchaseStatus.inCart }]
    })
  }
})

// Delete handlers
const handleDelete = (purchaseIndex: number) => () => {
  const purchaseId = extendedPurchases[purchaseIndex]._id
  deletePurchasesMutation.mutate([purchaseId])
}

const handleDeleteManyPurchases = () => {
  const purchaseIds = checkedPurchases.map((purchase) => purchase._id)
  deletePurchasesMutation.mutate(purchaseIds)
}
```

#### 💰 Price Calculations

```typescript
// Memoized calculations cho performance
const checkedPurchasesCount = useMemo(() => checkedPurchases.length, [checkedPurchases])

const totalCheckedPurchasePrice = useMemo(
  () =>
    checkedPurchases.reduce((result, current) => {
      return result + current.product.price * current.buy_count
    }, 0),
  [checkedPurchases]
)

const totalCheckedPurchaseSavingPrice = useMemo(
  () =>
    checkedPurchases.reduce((result, current) => {
      return result + (current.product.price_before_discount - current.product.price) * current.buy_count
    }, 0),
  [checkedPurchases]
)
```

#### 🛒 Buy Products

```typescript
// Buy products mutation
const buyPurchasesMutation = useMutation({
  mutationFn: purchaseApi.buyProducts,
  onSuccess: (data) => {
    queryClient.invalidateQueries({
      queryKey: ['purchases', { status: purchaseStatus.inCart }]
    })
    toast.success(`Mua ${data.data.data.length} sản phẩm thành công`)
  }
})

// Handle buy
const handleBuyPurchases = () => {
  if (checkedPurchases.length > 0) {
    const body = checkedPurchases.map((purchase) => ({
      product_id: purchase.product._id,
      buy_count: purchase.buy_count
    }))
    buyPurchasesMutation.mutate(body)
  }
}
```

### 🎬 Video 203: CartHeader & Search Hook

#### 🎨 Cart Layout Component

```typescript
// CartLayout với custom header
const CartLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <CartHeader />
      {children}
      <Footer />
    </div>
  );
};

// CartHeader component
const CartHeader = () => {
  const { onSubmitSearch, register } = useSearchProducts();

  return (
    <div className="border-b-4 border-b-orange">
      <div className="bg-orange text-white">
        <div className="container">
          <nav className="flex items-center justify-between py-2">
            <Link to="/" className="flex items-center">
              <svg className="mr-4 h-8 w-8 lg:h-11 lg:w-11" viewBox="0 0 192 65">
                {/* Logo SVG */}
              </svg>
              <div className="mx-4 h-6 w-[1px] bg-orange-300 lg:h-8" />
              <div className="capitalize text-orange-300 lg:text-xl">Giỏ hàng</div>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};
```

#### 🔍 Custom Search Hook

```typescript
// useSearchProducts hook cho reusability
const useSearchProducts = () => {
  const queryConfig = useQueryConfig()
  const navigate = useNavigate()

  const { register, handleSubmit } = useForm<{ name: string }>({
    defaultValues: {
      name: ''
    }
  })

  const onSubmitSearch = handleSubmit((data) => {
    const config = queryConfig.order ? omit(queryConfig, ['order']) : queryConfig

    navigate({
      pathname: path.home,
      search: createSearchParams({
        ...config,
        name: data.name
      }).toString()
    })
  })

  return {
    register,
    onSubmitSearch
  }
}
```

### 🎬 Video 204: Buy Now Feature

#### 🛒 Router State Navigation

```typescript
// Buy now implementation với router state
const handleBuyNow = async () => {
  const res = await addToCartMutation.mutateAsync({
    buy_count: buyCount,
    product_id: product?._id as string
  })

  const purchase = res.data.data
  navigate('/cart', {
    state: {
      purchaseId: purchase._id
    }
  })
}

// Cart component - Handle router state
const location = useLocation()
const choosenPurchaseIdFromLocation = (location.state as { purchaseId: string } | null)?.purchaseId

useEffect(() => {
  setExtendedPurchases((prev) => {
    const extendedPurchasesObject = keyBy(prev, '_id')
    return (
      purchasesInCart?.map((purchase) => {
        const isChoosenPurchaseFromLocation = choosenPurchaseIdFromLocation === purchase._id
        return {
          ...purchase,
          disabled: false,
          checked: isChoosenPurchaseFromLocation || Boolean(extendedPurchasesObject[purchase._id]?.checked)
        }
      }) || []
    )
  })
}, [purchasesInCart, choosenPurchaseIdFromLocation])

// Clear router state để tránh persist khi F5
useEffect(() => {
  return () => {
    history.replaceState(null, '')
  }
}, [])
```

#### 🎯 Context Integration

```typescript
// Move extendedPurchases to AppContext for global state
const AppContext = createContext<AppContextInterface>({
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  extendedPurchases: [],
  setExtendedPurchases: () => null,
  reset: () => null
})

// Performance optimization với useMemo
const contextValue = useMemo(
  () => ({
    isAuthenticated,
    setIsAuthenticated,
    profile,
    setProfile,
    extendedPurchases,
    setExtendedPurchases,
    reset
  }),
  [isAuthenticated, profile, extendedPurchases]
)
```

---

## 👤 Chương 22: User Profile

### 🎬 Video 205: Token Expiration Handling

#### 🔒 Access Token Expiry Logic

```typescript
// EventTarget cho global event handling
const eventTarget = new EventTarget()

// Clear localStorage và dispatch event
export const clearLS = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('profile')

  // Dispatch custom event
  const clearLSEvent = new Event('clearLS')
  eventTarget.dispatchEvent(clearLSEvent)
}

// Listen for clearLS event trong App component
useEffect(() => {
  const handleClearLS = () => {
    reset() // Reset AppContext state
  }

  eventTarget.addEventListener('clearLS', handleClearLS)

  return () => {
    eventTarget.removeEventListener('clearLS', handleClearLS)
  }
}, [reset])
```

#### 🔄 Axios Interceptor cho 401 Handling

```typescript
// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      clearLS()
      // Optional: Show error message
      toast.error('Phiên đăng nhập đã hết hạn')
    }

    return Promise.reject(error)
  }
)
```

### 🎬 Video 206: Nested Routes cho User Layout

#### 🧭 User Routes Structure

```typescript
// Nested routes configuration
{
  path: path.user,
  element: (
    <MainLayout>
      <UserLayout />
    </MainLayout>
  ),
  children: [
    {
      path: path.profile,
      element: <Profile />
    },
    {
      path: path.changePassword,
      element: <ChangePassword />
    },
    {
      path: path.historyPurchases,
      element: <HistoryPurchases />
    }
  ]
}

// UserLayout với Outlet
const UserLayout = () => {
  return (
    <div className="bg-neutral-100 py-16 text-sm text-gray-600">
      <div className="container">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-3 lg:col-span-2">
            <UserSideNav />
          </div>
          <div className="md:col-span-9 lg:col-span-10">
            <Outlet /> {/* Render child routes */}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 🎬 Video 207: UserSideNav UI

#### 🎨 Side Navigation Component

```typescript
const UserSideNav = () => {
  return (
    <div>
      <div className="flex items-center border-b border-b-gray-200 py-4">
        <Link to={path.profile} className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border">
          <img
            src="https://cf.shopee.vn/file/d04ea22afab6e6d250a370d7ccc2e675_tn"
            alt="avatar"
            className="h-full w-full object-cover"
          />
        </Link>
        <div className="flex-grow pl-4">
          <div className="mb-1 truncate font-semibold text-gray-600">duthanhduoc</div>
          <Link to={path.profile} className="flex items-center capitalize text-gray-500">
            <svg className="mr-1 h-3 w-3" viewBox="0 0 12 12">
              {/* Edit icon */}
            </svg>
            Sửa hồ sơ
          </Link>
        </div>
      </div>

      <div className="mt-7">
        <NavLink
          to={path.profile}
          className="flex items-center capitalize transition-colors"
        >
          <div className="mr-3 h-[22px] w-[22px]">
            <img src="https://cf.shopee.vn/file/ba61750a46794d8847c3f463c5e71cc4" alt="" />
          </div>
          Tài khoản của tôi
        </NavLink>

        <NavLink
          to={path.changePassword}
          className="mt-4 flex items-center capitalize transition-colors"
        >
          <div className="mr-3 h-[22px] w-[22px]">
            <img src="https://cf.shopee.vn/file/ba61750a46794d8847c3f463c5e71cc4" alt="" />
          </div>
          Đổi mật khẩu
        </NavLink>

        <NavLink
          to={path.historyPurchases}
          className="mt-4 flex items-center capitalize transition-colors"
        >
          <div className="mr-3 h-[22px] w-[22px]">
            <img src="https://cf.shopee.vn/file/f0049e9df4e536bc3e7f140d071e9078" alt="" />
          </div>
          Đơn mua
        </NavLink>
      </div>
    </div>
  );
};
```

### 🎬 Video 208: Profile Form UI

#### 📝 Profile Form Layout

```typescript
const Profile = () => {
  return (
    <div className="rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20">
      <div className="border-b border-b-gray-200 py-6">
        <h1 className="text-lg font-medium capitalize text-gray-900">Hồ Sơ Của Tôi</h1>
        <div className="mt-1 text-sm text-gray-700">Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
      </div>

      <div className="mt-8 flex flex-col-reverse md:flex-row md:items-start">
        <form className="mt-6 flex-grow md:mt-0 md:pr-12">
          {/* Form fields */}
          <div className="mt-6 flex flex-col flex-wrap sm:flex-row">
            <div className="truncate pt-3 capitalize sm:w-[20%] sm:text-right">Tên</div>
            <div className="sm:w-[80%] sm:pl-5">
              <Input
                classNameInput="w-full rounded-sm border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:shadow-sm"
                name="name"
                placeholder="Tên"
                register={register}
                errorMessage={errors.name?.message}
              />
            </div>
          </div>

          {/* More form fields... */}

          <div className="mt-2 flex flex-col flex-wrap sm:flex-row">
            <div className="truncate pt-3 capitalize sm:w-[20%] sm:text-right" />
            <div className="sm:w-[80%] sm:pl-5">
              <Button
                className="flex h-9 items-center bg-orange px-5 text-center text-sm text-white hover:bg-orange/80"
                type="submit"
              >
                Lưu
              </Button>
            </div>
          </div>
        </form>

        {/* Avatar section */}
        <div className="flex justify-center md:w-72 md:border-l md:border-l-gray-200">
          <div className="flex flex-col items-center">
            <div className="my-5 h-24 w-24">
              <img
                src="https://cf.shopee.vn/file/d04ea22afab6e6d250a370d7ccc2e675_tn"
                alt="avatar"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <input className="hidden" type="file" accept=".jpg,.jpeg,.png" />
            <button
              className="flex h-10 items-center justify-end rounded-sm border bg-white px-6 text-sm text-gray-600 shadow-sm"
              type="button"
            >
              Chọn ảnh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 🎬 Video 209: User API Declaration

#### 🔗 User API Types & Endpoints

```typescript
// User types
interface User {
  _id: string
  roles: string[]
  email: string
  name?: string
  date_of_birth?: string // ISO string format
  avatar?: string
  address?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

// Body types cho API calls
type BodyUpdateProfile = Omit<User, '_id' | 'roles' | 'createdAt' | 'updatedAt' | 'email'> & {
  password?: string
  new_password?: string
}

// User API endpoints
const userApi = {
  getProfile: () => http.get<SuccessResponse<User>>('/me'),

  updateProfile: (body: BodyUpdateProfile) => http.put<SuccessResponse<User>>('/user', body),

  uploadAvatar: (body: FormData) =>
    http.post<SuccessResponse<string>>('/user/upload-avatar', body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
}
```

### 🎬 Video 210: Profile Form Implementation P1

#### 🎯 Multi-page Form Strategy

> ⚠️ **Lưu ý**: Project hiện tại đã migrate sang Zod. Các ví dụ Yup bên dưới chỉ mang tính tham khảo lịch sử. Xem `src/utils/rules.ts` để tham khảo cách sử dụng Zod với baseSchema pattern và .superRefine() cho cross-field validation.

```typescript
// Use FormProvider cho complex forms
import { FormProvider, useFormContext } from 'react-hook-form';

// User schema với Yup (ví dụ cũ - chỉ tham khảo)
const userSchema = yup.object({
  name: yup.string().max(160, 'Độ dài tối đa là 160 ký tự'),
  phone: yup.string().max(20, 'Độ dài tối đa là 20 ký tự'),
  address: yup.string().max(160, 'Độ dài tối đa là 160 ký tự'),
  date_of_birth: yup.date().max(new Date(), 'Hãy chọn một ngày trong quá khứ'),
  avatar: yup.string().max(1000, 'Độ dài tối đa là 1000 ký tự'),
  password: schema.fields['password'] as yup.StringSchema<string | undefined, yup.AnyObject, undefined, "">,
  new_password: schema.fields['password'] as yup.StringSchema<string | undefined, yup.AnyObject, undefined, "">,
  confirm_password: passwordSchema.fields['confirm_password'] as yup.StringSchema<string | undefined, yup.AnyObject, undefined, "">
});

type FormData = Pick<User, 'name' | 'avatar' | 'phone' | 'address' | 'date_of_birth'> & {
  password?: string;
  new_password?: string;
  confirm_password?: string;
};

// Profile component với API integration
const Profile = () => {
  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile
  });

  const profile = profileData?.data.data;

  const methods = useForm<FormData>({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      avatar: '',
      date_of_birth: new Date(1990, 0, 1),
      password: '',
      new_password: '',
      confirm_password: ''
    },
    resolver: yupResolver(userSchema)
  });

  const { handleSubmit, setValue, watch, setError } = methods;

  // Set form values khi có data từ API
  useEffect(() => {
    if (profile) {
      setValue('name', profile.name || '');
      setValue('phone', profile.phone || '');
      setValue('address', profile.address || '');
      setValue('avatar', profile.avatar || '');
      if (profile.date_of_birth) {
        setValue('date_of_birth', new Date(profile.date_of_birth));
      }
    }
  }, [profile, setValue]);

  return (
    <div className="rounded-sm bg-white px-2 pb-10 shadow md:px-7 md:pb-20">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form content */}
        </form>
      </FormProvider>
    </div>
  );
};
```

---

## ⚡ Chương 23: Performance Optimization

### 🎯 Key Performance Concepts

#### 🧠 Memoization Strategies

```typescript
// useMemo cho expensive calculations
const expensiveCalculation = useMemo(() => {
  return purchasesInCart.reduce((total, purchase) => {
    return total + purchase.price * purchase.buy_count;
  }, 0);
}, [purchasesInCart]);

// useCallback cho event handlers
const handleItemClick = useCallback((id: string) => {
  return () => {
    // Handle click logic
  };
}, []);

// React.memo cho component optimization
const ExpensiveComponent = React.memo(({ data }: { data: ComplexData }) => {
  return (
    <div>
      {/* Expensive rendering logic */}
    </div>
  );
});
```

#### 🔄 React Query Optimization

```typescript
// Stale time strategy
const { data } = useQuery({
  queryKey: ['products', queryConfig],
  queryFn: () => productApi.getProducts(queryConfig),
  staleTime: 5 * 60 * 1000, // 5 minutes
  keepPreviousData: true, // Smooth transitions
  select: (data) => data.data.data // Data transformation
})

// Parallel queries
const [{ data: productsData }, { data: categoriesData }] = useQueries([
  {
    queryKey: ['products'],
    queryFn: productApi.getProducts
  },
  {
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories
  }
])
```

#### 🎨 Virtual DOM Optimization

```typescript
// Key props cho list rendering
{items.map((item, index) => (
  <Item
    key={item.id} // Stable, unique key
    data={item}
    onClick={handleItemClick(item.id)}
  />
))}

// Avoid inline objects trong props
// ❌ Bad
<Component style={{ marginTop: 10 }} />

// ✅ Good
const styles = { marginTop: 10 };
<Component style={styles} />
```

#### 📦 Bundle Optimization

```typescript
// Code splitting với React.lazy
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));

// Route-based code splitting
const router = createBrowserRouter([
  {
    path: '/product/:id',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProductDetail />
      </Suspense>
    )
  }
]);

// Dynamic imports cho utilities
const loadLodash = () => import('lodash');

// Tree shaking với named imports
import { debounce } from 'lodash'; // ✅ Good
import _ from 'lodash'; // ❌ Bad for bundle size
```

---

## 📝 Tổng Kết

### 🎯 **Core Achievements trong Các Chương**

#### 🛒 **Shopping Cart (Chương 21)**

- ✅ **State Management**: Immer.js cho complex state updates
- ✅ **Local State Strategy**: InputNumber với fallback state
- ✅ **Generic Types**: Advanced TypeScript với useController
- ✅ **API Integration**: CRUD operations cho cart management
- ✅ **UI/UX**: Sticky summary, loading states, optimistic updates

#### 👤 **User Profile (Chương 22)**

- ✅ **Authentication Flow**: Token expiry với EventTarget pattern
- ✅ **Nested Routing**: Clean route structure với React Router v6
- ✅ **Form Handling**: Multi-step forms với React Hook Form
- ✅ **File Upload**: Avatar upload với FormData
- ✅ **Validation**: Complex cross-field validation với Zod (đã migrate từ Yup)

#### ⚡ **Performance (Chương 23)**

- ✅ **Memoization**: Strategic use của useMemo/useCallback
- ✅ **React Query**: Advanced caching và data synchronization
- ✅ **Code Splitting**: Route-based lazy loading
- ✅ **Bundle Analysis**: Webpack bundle analyzer insights
- ✅ **Virtual DOM**: Optimization patterns cho re-renders

### 🚀 **Advanced Patterns Applied**

#### 🏗️ **Architecture Patterns**

- **Compound Components**: Flexible component composition
- **Render Props**: Data sharing giữa components
- **Custom Hooks**: Logic reuse và separation of concerns
- **Context + Reducer**: Global state management
- **Error Boundaries**: Graceful error handling

#### 🎨 **UI/UX Best Practices**

- **Progressive Enhancement**: Mobile-first responsive design
- **Loading States**: Skeleton screens, spinner components
- **Optimistic Updates**: Immediate UI feedback
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Image optimization, lazy loading

#### 🔒 **Security & Data**

- **XSS Prevention**: DOMPurify cho HTML sanitization
- **Type Safety**: Strict TypeScript configuration
- **Data Validation**: Client + server-side validation
- **Token Management**: Secure storage và refresh strategies

### 📈 **Production Considerations**

#### 🔧 **Development Tools**

- **TypeScript**: Advanced types với utility types
- **ESLint/Prettier**: Code quality và formatting
- **Storybook**: Component development và documentation
- **Testing**: Unit tests với Vitest
- **Bundle Analysis**: Performance monitoring

#### 🚀 **Deployment & Optimization**

- **Build Optimization**: Code splitting và tree shaking
- **Caching Strategy**: React Query với appropriate stale times
- **SEO**: Meta tags, structured data
- **Performance**: Core Web Vitals optimization
- **Monitoring**: Error tracking và performance metrics

Dự án này đã cover được hầu hết các khía cạnh quan trọng của một ứng dụng React production-ready, từ architecture design đến performance optimization! 🎉
