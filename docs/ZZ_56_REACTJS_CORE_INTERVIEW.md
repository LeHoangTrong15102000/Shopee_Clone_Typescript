# PHỎNG VẤN REACTJS CORE — Middle Frontend Developer (3-5 năm)

> **Ngày nghiên cứu**: 2026-04-15
> **Phạm vi**: ReactJS Core Concepts, Hooks, State Management, Component Patterns, Performance, Testing
> **Căn cứ từ JD**: React.js, HTML5/CSS3, JavaScript ES6+, RESTful API, SSR/SSG/CSR, Responsive Design
> **Đối tượng**: Vietnamese Frontend Developer chuẩn bị phỏng vấn Middle-level

---

## MỤC LỤC

- [PHẦN 1: React Core Concepts](#phần-1-react-core-concepts)
  - [1.1 Virtual DOM, Reconciliation, Fiber](#11-virtual-dom-reconciliation-fiber)
  - [1.2 JSX và React Elements](#12-jsx-và-react-elements)
- [PHẦN 2: React Hooks](#phần-2-react-hooks)
  - [2.1 useState](#21-usestate)
  - [2.2 useEffect](#22-useeffect)
  - [2.3 useMemo và useCallback](#23-usememo-và-usecallback)
  - [2.4 useRef](#24-useref)
  - [2.5 useReducer](#25-usereducer)
  - [2.6 useContext](#26-usecontext)
  - [2.7 Custom Hooks](#27-custom-hooks)
  - [2.8 useLayoutEffect và useEffect](#28-uselayouteffect-vs-useeffect)
  - [2.9 Stale Closure](#29-stale-closure)
- [PHẦN 3: State Management](#phần-3-state-management)
  - [3.1 Context API](#31-context-api)
  - [3.2 Redux Toolkit vs Zustand](#32-redux-toolkit-vs-zustand)
  - [3.3 TanStack Query (React Query)](#33-tanstack-query-react-query)
- [PHẦN 4: Component Patterns](#phần-4-component-patterns)
  - [4.1 HOC](#41-higher-order-component-hoc)
  - [4.2 Render Props](#42-render-props)
  - [4.3 Compound Components](#43-compound-components)
  - [4.4 Controlled vs Uncontrolled](#44-controlled-vs-uncontrolled)
- [PHẦN 5: Performance Optimization](#phần-5-performance-optimization)
  - [5.1 React.memo](#51-reactmemo)
  - [5.2 Code Splitting và Lazy Loading](#52-code-splitting-và-lazy-loading)
  - [5.3 Virtualization](#53-virtualization)
- [PHẦN 6: React Lifecycle và Rendering](#phần-6-react-lifecycle-và-rendering)
- [PHẦN 7: Error Boundaries](#phần-7-error-boundaries)
- [PHẦN 8: React 18/19 Features](#phần-8-react-1819-features)
- [PHẦN 9: Testing](#phần-9-testing)

---

# PHẦN 1: React Core Concepts

## 1.1 Virtual DOM, Reconciliation, Fiber

---

### Q: Virtual DOM là gì? Tại sao React sử dụng Virtual DOM thay vì thao tác trực tiếp Real DOM?

**Trả lời:**

Virtual DOM (VDOM) là một bản sao nhẹ (lightweight copy) của Real DOM, được React lưu trữ trong bộ nhớ dưới dạng JavaScript object tree. Khi state hoặc props thay đổi, React tạo VDOM mới, so sánh (diff) với VDOM cũ, và chỉ cập nhật những phần thực sự thay đổi lên Real DOM.

**Lý do sử dụng VDOM:**
- Thao tác trực tiếp Real DOM rất **chậm** vì mỗi lần thay đổi DOM trình duyệt phải recalculate layout, repaint, reflow
- VDOM cho phép **batch updates** — gộp nhiều thay đổi lại thành một lần cập nhật DOM duy nhất
- Giảm thiểu số lượng DOM operations xuống mức tối thiểu thông qua thuật toán diffing

```jsx
// Khi setState được gọi:
// 1. React tạo VDOM tree mới
// 2. So sánh (diff) VDOM mới vs VDOM cũ  
// 3. Tính toán minimal changes (changeset)
// 4. Batch update lên Real DOM

const [count, setCount] = useState(0);
// Khi gọi setCount(1):
// - React tạo VDOM mới với count = 1
// - Diff: chỉ text node thay đổi "0" → "1"
// - Chỉ cập nhật text node đó trên Real DOM
```

---

### Q: Reconciliation là gì? Giải thích thuật toán Diffing của React.

**Trả lời:**

Reconciliation là quá trình React so sánh VDOM tree mới với VDOM tree cũ để xác định những thay đổi cần áp dụng lên Real DOM. React sử dụng thuật toán **heuristic O(n)** dựa trên 2 giả định:

1. **Hai element khác type** → unmount cây cũ, mount cây mới hoàn toàn
2. **Key prop** giúp React xác định element nào ổn định qua các lần render

**Quy trình Diffing:**

```
Bước 1: So sánh root element
  - Khác type (vd: <div> → <span>) → Xóa cây cũ, tạo cây mới
  - Cùng type → Giữ DOM node, chỉ cập nhật attributes thay đổi

Bước 2: Đệ quy xuống children
  - Sử dụng "key" prop để match children giữa 2 lần render
  - Không có key → React so sánh tuần tự (index-based), kém hiệu quả
```

```jsx
// ❌ Sai: Dùng index làm key → bug khi reorder
{items.map((item, index) => (
  <ListItem key={index} data={item} />
))}

// ✅ Đúng: Dùng unique ID làm key
{items.map((item) => (
  <ListItem key={item.id} data={item} />
))}
```

---

### Q: React Fiber là gì? Nó giải quyết vấn đề gì so với stack reconciler cũ?

**Trả lời:**

React Fiber là bản viết lại hoàn toàn của core algorithm (reconciler) từ React 16.

**Vấn đề của Stack Reconciler cũ:**
- Render đồng bộ, **không thể interrupt** — nếu component tree lớn, UI bị "đóng băng" (jank)
- Không có khả năng ưu tiên (priority) cho các update khác nhau

**Fiber giải quyết:**
- **Incremental rendering**: Chia nhỏ công việc render thành các "units of work" (fiber nodes)
- **Pause/Resume**: Có thể tạm dừng render, xử lý việc khẩn cấp hơn (user input), rồi quay lại
- **Priority-based scheduling**: Ưu tiên user interaction (click, type) cao hơn background update
- **Concurrent rendering**: Chuẩn bị nhiều phiên bản UI cùng lúc mà không block main thread

```
Stack Reconciler (cũ):
  Render A → Render B → Render C → Commit tất cả → [UI blocked toàn bộ]

Fiber (mới):
  Render A → [User click] → PAUSE → Handle click → Resume → Render B → Commit
```

---

### Q: Tại sao key prop lại quan trọng? Điều gì xảy ra nếu dùng index làm key?

**Trả lời:**

`key` giúp React xác định danh tính (identity) của mỗi element trong list qua các lần render.

**Hậu quả dùng index làm key:**
- Khi thêm item vào đầu list: tất cả index shift → React nghĩ mọi item đều thay đổi → re-render toàn bộ
- State của component bị gán sai (input value bị đổi chỗ)
- Component không unmount/mount đúng cách

```jsx
// Ví dụ lỗi với index key:
// Ban đầu: ["A", "B", "C"] → keys: [0, 1, 2]
// Thêm "X" vào đầu: ["X", "A", "B", "C"] → keys: [0, 1, 2, 3]
// React nghĩ: item key=0 đổi từ "A" → "X", key=1 đổi từ "B" → "A"...
// → Re-render TẤT CẢ items thay vì chỉ thêm 1 item mới

// ✅ Correct: dùng stable unique ID
{items.map(item => <Item key={item.id} {...item} />)}
```

**Khi nào AN TOÀN dùng index**: List tĩnh không thay đổi thứ tự, không add/remove items.

---

## 1.2 JSX và React Elements

---

### Q: JSX là gì? Nó được compiled thành gì?

**Trả lời:**

JSX là cú pháp extension của JavaScript cho phép viết HTML-like code trong JS. Babel compile JSX thành `React.createElement()` calls.

```jsx
// JSX:
const element = <h1 className="title">Hello, {name}!</h1>;

// Sau khi compile (React 17- dùng React.createElement):
const element = React.createElement(
  'h1',
  { className: 'title' },
  'Hello, ',
  name,
  '!'
);

// React 17+ (new JSX transform - không cần import React):
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx('h1', { className: 'title', children: ['Hello, ', name, '!'] });
```

**Tại sao React 17+ không cần `import React from 'react'`?** Vì new JSX transform tự động import từ `react/jsx-runtime`.

---

# PHẦN 2: React Hooks

## 2.1 useState

---

### Q: useState hoạt động như thế nào? Giải thích functional update và lazy initialization.

**Trả lời:**

`useState` thêm local state vào functional component. Trả về `[stateValue, setterFunction]`.

**Functional Update (CỰC KỲ QUAN TRỌNG):**

```jsx
// ❌ Sai khi update dựa trên state trước đó:
const [count, setCount] = useState(0);
const handleClick = () => {
  setCount(count + 1); // count vẫn là 0 trong closure
  setCount(count + 1); // vẫn set thành 1, không phải 2!
};

// ✅ Đúng: dùng functional update
const handleClick = () => {
  setCount(prev => prev + 1); // prev = 0 → 1
  setCount(prev => prev + 1); // prev = 1 → 2 ✓
};
```

**Lazy Initialization:**

```jsx
// ❌ Tính toán nặng mỗi lần render:
const [data, setData] = useState(expensiveComputation());

// ✅ Chỉ tính 1 lần khi mount (lazy init):
const [data, setData] = useState(() => expensiveComputation());
```

**Lưu ý**: `setState` là **asynchronous** — React batch nhiều `setState` lại thành 1 lần re-render (React 18+ automatic batching hoạt động mọi nơi, kể cả trong setTimeout và Promise).

---

### Q: React 18 Automatic Batching là gì? Khác gì React 17?

**Trả lời:**

**Batching** = Gộp nhiều state update thành 1 lần re-render.

```jsx
// React 17: Chỉ batch trong React event handlers
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // → 1 re-render (batched ✓)
}

// React 17: KHÔNG batch trong async code
setTimeout(() => {
  setCount(c => c + 1); // → re-render 1
  setFlag(f => !f);     // → re-render 2 (KHÔNG batched!)
}, 1000);

// React 18: Automatic Batching — batch MỌI NƠI
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // → 1 re-render (automatic batching ✓)
}, 1000);

// Nếu muốn opt-out batching (hiếm):
import { flushSync } from 'react-dom';
flushSync(() => { setCount(c => c + 1); }); // Re-render ngay
flushSync(() => { setFlag(f => !f); });      // Re-render lần 2
```

---

## 2.2 useEffect

---

### Q: useEffect hoạt động thế nào? Giải thích dependency array và cleanup function.

**Trả lời:**

`useEffect` xử lý **side effects** trong functional component (data fetching, subscriptions, DOM mutation).

**3 kiểu dependency array:**

```jsx
// 1. Không có dependency → chạy SAU MỌI lần render
useEffect(() => {
  console.log('Chạy mỗi render');
});

// 2. Empty array [] → chạy 1 lần sau mount (như componentDidMount)
useEffect(() => {
  console.log('Chạy 1 lần khi mount');
}, []);

// 3. Có dependencies → chạy khi dependency thay đổi
useEffect(() => {
  console.log(`userId changed: ${userId}`);
}, [userId]);
```

**Cleanup function (LUÔN được hỏi):**

```jsx
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData);

  // Cleanup chạy khi: component unmount HOẶC dependency thay đổi
  return () => {
    controller.abort(); // Cancel request tránh memory leak
  };
}, [userId]);

// Ví dụ khác: subscription
useEffect(() => {
  const subscription = eventBus.subscribe('event', handler);
  return () => subscription.unsubscribe(); // Cleanup
}, []);
```

---

### Q: Khi nào không nên fetch data trong useEffect? Alternative là gì?

**Trả lời:**

`useEffect` cho data fetching có nhiều vấn đề:
- Race condition khi deps thay đổi nhanh
- Không có caching
- Boilerplate nhiều (loading, error states)
- Không hỗ trợ SSR tốt

**Alternative tốt hơn:**

```jsx
// TanStack Query (React Query) — giải quyết tất cả vấn đề trên
const { data, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000,
});

// SWR (Vercel)
const { data, error, isLoading } = useSWR(
  `/api/user/${userId}`,
  fetcher
);

// Next.js App Router: fetch trực tiếp trong Server Component
// (không cần useEffect)
async function UserProfile({ userId }) {
  const user = await fetchUser(userId); // server-side
  return <div>{user.name}</div>;
}
```

---

## 2.3 useMemo và useCallback

---

### Q: Sự khác biệt giữa useMemo và useCallback là gì? Khi nào KHÔNG nên dùng?

**Trả lời:**

| | `useMemo` | `useCallback` |
|---|---|---|
| **Memoize** | Kết quả tính toán (value) | Hàm (function reference) |
| **Trả về** | Giá trị đã tính | Chính hàm đó (memoized) |
| **Dùng khi** | Tính toán nặng | Truyền callback xuống child có React.memo |

```jsx
// useMemo: Memoize expensive calculation
const filteredList = useMemo(() => {
  return items.filter(item => item.name.includes(search));
}, [items, search]); // Chỉ tính lại khi items hoặc search thay đổi

// useCallback: Memoize function reference
const handleClick = useCallback((id) => {
  setSelectedId(id);
}, []);
// handleClick giữ cùng reference qua các lần render
// → ChildComponent wrapped bằng React.memo sẽ KHÔNG re-render

// useCallback(fn, deps) ≡ useMemo(() => fn, deps)
```

**Khi nào KHÔNG nên dùng:**

```jsx
// ❌ KHÔNG cần: Component nhẹ, tính toán đơn giản
const doubled = useMemo(() => count * 2, [count]); // Phí bộ nhớ vô ích

// ❌ KHÔNG cần: Không truyền xuống memoized child
const handleClick = useCallback(() => {
  setOpen(true);
}, []); // Overhead memoization > cost of re-creating function

// ✅ CẦN: Truyền callback xuống React.memo child
const MemoChild = React.memo(({ onClick }) => <button onClick={onClick}>Click</button>);
const handleClick = useCallback(() => doSomething(), []);
<MemoChild onClick={handleClick} />
```

**Quy tắc thực tế**: Đừng memoize mọi thứ. Chỉ memoize khi có bằng chứng performance issue (đo bằng React Profiler trước).

---

## 2.4 useRef

---

### Q: useRef dùng để làm gì? Khác gì so với useState?

**Trả lời:**

`useRef` tạo một mutable object `{ current: value }` tồn tại suốt lifecycle. **Thay đổi `.current` KHÔNG gây re-render**.

**3 use case chính:**

```jsx
// 1. Truy cập DOM element trực tiếp
function AutoFocusInput() {
  const inputRef = useRef(null);
  
  useEffect(() => {
    inputRef.current.focus(); // Focus input khi mount
  }, []);

  return <input ref={inputRef} />;
}

// 2. Lưu giá trị mutable không cần re-render (timer ID, previous value)
function Timer() {
  const intervalRef = useRef(null);
  
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      console.log('tick');
    }, 1000);
  };
  
  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </>
  );
}

// 3. Track previous value
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

| | `useState` | `useRef` |
|---|---|---|
| Thay đổi giá trị | Gây re-render | KHÔNG gây re-render |
| Dùng khi | Data hiển thị trên UI | DOM access, timer ID, previous value |
| Persist qua render | Có | Có |

---

## 2.5 useReducer

---

### Q: Khi nào dùng useState, khi nào dùng useReducer?

**Trả lời:**

| Tiêu chí | `useState` | `useReducer` |
|---|---|---|
| State đơn giản (boolean, string) | ✅ Phù hợp | ❌ Overkill |
| State phức tạp (object lồng nhau) | ❌ Khó quản lý | ✅ Phù hợp |
| Cần test logic state riêng biệt | Khó tách | ✅ Reducer là pure function |

```jsx
// useState: toggle modal
const [isOpen, setIsOpen] = useState(false);

// useReducer: form phức tạp
const initialState = { name: '', email: '', errors: {}, isSubmitting: false };

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: action.error } };
    case 'SUBMIT':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return { ...initialState };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(formReducer, initialState);
dispatch({ type: 'SET_FIELD', field: 'name', value: 'John' });
```

---

## 2.6 useContext

---

### Q: Context API có vấn đề gì về performance? Cách khắc phục?

**Trả lời:**

**Vấn đề**: Khi `value` của Provider thay đổi, **TẤT CẢ** component dùng `useContext` sẽ re-render, bất kể chúng có dùng phần data thay đổi hay không.

```jsx
// ❌ Vấn đề: Mọi consumer re-render khi BẤT KỲ field nào đổi
const AppContext = createContext();
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  return (
    <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}
// Khi setTheme('dark') → component chỉ dùng user CŨNG re-render!
```

**Cách khắc phục:**

```jsx
// ✅ FIX 1: Tách context theo domain
const UserContext = createContext();
const ThemeContext = createContext();

// ✅ FIX 2: Memoize value object
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ✅ FIX 3: Dùng Zustand/Jotai thay vì Context cho high-frequency state
// Zustand chỉ re-render component subscribe vào phần state đã thay đổi
```

**Khi nào dùng Context**: Static/semi-static data (theme, locale, user session). Tránh dùng cho frequently-changing state.

---

## 2.7 Custom Hooks

---

### Q: Custom Hooks là gì? Viết một custom hook useFetch với đầy đủ tính năng.

**Trả lời:**

Custom Hook là function bắt đầu bằng `use`, cho phép **tái sử dụng logic có state** giữa các component.

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort(); // Cleanup: cancel on unmount
  }, [url]);

  return { data, loading, error };
}

// Sử dụng:
function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  return <div>{data.name}</div>;
}
```

**Các custom hook thường được yêu cầu trong phỏng vấn:**
- `useDebounce` — delay giá trị
- `useLocalStorage` — sync state với localStorage
- `useMediaQuery` — theo dõi breakpoint
- `usePrevious` — lấy giá trị state trước đó
- `useClickOutside` — detect click ngoài element

---

### Q: Viết useDebounce từ đầu.

**Trả lời:**

```jsx
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer); // Cleanup: reset timer nếu value thay đổi
  }, [value, delay]);

  return debouncedValue;
}

// Sử dụng cho search input:
function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery); // Chỉ gọi khi user dừng gõ 300ms
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Tìm kiếm..."
    />
  );
}
```

---

## 2.8 useLayoutEffect vs useEffect

---

### Q: Phân biệt useEffect và useLayoutEffect. Khi nào dùng useLayoutEffect?

**Trả lời:**

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| **Timing** | Chạy **sau** browser paint | Chạy **trước** browser paint |
| **Blocking** | Không block rendering | Block rendering |
| **Dùng khi** | Data fetching, subscriptions | Đo lường DOM, tránh flickering |

```jsx
function Tooltip({ targetRef }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // ✅ useLayoutEffect: đo DOM trước khi paint → không bị nhấp nháy
  useLayoutEffect(() => {
    const rect = targetRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom, left: rect.left });
  }, [targetRef]);

  return <div style={{ position: 'absolute', ...position }}>Tooltip</div>;
}

// Nếu dùng useEffect ở đây → tooltip hiện ở vị trí sai rồi nhảy đúng vị trí (flicker)
```

**Quy tắc**: Mặc định dùng `useEffect`. Chỉ dùng `useLayoutEffect` khi cần **đo hoặc thay đổi DOM synchronously** trước paint.

---

## 2.9 Stale Closure

---

### Q: Stale Closure là gì? Cho ví dụ và cách khắc phục.

**Trả lời:**

Stale closure xảy ra khi callback trong `useEffect` hoặc `useCallback` "bắt" giá trị state/props cũ vì dependency array thiếu.

```jsx
// ❌ BUG: Stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // Luôn in 0! (stale closure)
      setCount(count + 1); // Luôn set 1!
    }, 1000);
    return () => clearInterval(id);
  }, []); // count không có trong deps → closure bắt giá trị count = 0

  return <div>{count}</div>;
}

// ✅ FIX 1: Thêm count vào dependency array
// (nhưng interval bị reset mỗi lần count đổi)
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);

// ✅ FIX 2 (TỐT NHẤT): Dùng functional update
useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // Không cần count trong closure
  }, 1000);
  return () => clearInterval(id);
}, []); // Deps rỗng OK

// ✅ FIX 3: Dùng useRef để giữ latest value
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
});
useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current); // Luôn lấy giá trị mới nhất
  }, 1000);
  return () => clearInterval(id);
}, []);
```

---

# PHẦN 3: State Management

## 3.1 Context API

Xem [Phần 2.6 useContext](#26-usecontext) ở trên.

---

## 3.2 Redux Toolkit vs Zustand

---

### Q: So sánh Context API, Redux Toolkit, và Zustand. Khi nào dùng cái nào?

**Trả lời:**

| Tiêu chí | Context API | Redux Toolkit | Zustand |
|---|---|---|---|
| **Dùng cho** | Static data (theme, locale) | Complex global state, large app | Simple global UI state |
| **Boilerplate** | Thấp | Trung bình | Rất thấp |
| **Bundle size** | 0 KB (built-in) | ~11 KB | ~1.1 KB |
| **Provider** | Bắt buộc | Bắt buộc | KHÔNG cần |
| **Performance** | ❌ Re-render TẤT CẢ consumers | ✅ Selective subscription | ✅ Selective subscription |
| **DevTools** | Không | Có (Redux DevTools) | Có (middleware) |

```jsx
// Context API: Theme (dùng tốt vì ít thay đổi)
const ThemeContext = createContext('light');

// Zustand: Cart state (ít boilerplate, performance tốt)
import { create } from 'zustand';
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ 
    items: state.items.filter(i => i.id !== id) 
  })),
}));
// Sử dụng: const { items, addItem } = useCartStore();

// Redux Toolkit: Slice
import { createSlice, configureStore } from '@reduxjs/toolkit';
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => { state.items.push(action.payload); }, // Immer (mutable OK)
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
  },
});
```

**Quy tắc chọn**:
- **Context API**: Auth session, theme, locale (thay đổi ít)
- **Zustand**: Cart, UI state, modal state (cần performance)
- **Redux Toolkit**: Enterprise app, cần time-travel debugging, team lớn, complex async logic (RTK Query)

---

## 3.3 TanStack Query (React Query)

---

### Q: React Query giải quyết vấn đề gì? So sánh với Redux cho server state.

**Trả lời:**

**Server State vs Client State (câu hỏi then chốt):**

| | Server State | Client State |
|---|---|---|
| **Nguồn gốc** | API/Database | UI local |
| **Đặc điểm** | Async, shared, có thể stale | Sync, local, luôn up-to-date |
| **Tool** | TanStack Query, SWR, RTK Query | useState, Zustand, Redux |
| **Ví dụ** | User list, product data | Modal open/close, theme, form draft |

```jsx
// ❌ Cách cũ: Manual fetching (boilerplate nhiều)
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Không có: caching, refetch on focus, retry, deduplication...
}

// ✅ TanStack Query: tất cả được xử lý tự động
function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // Data "fresh" trong 5 phút
    retry: 3,
    // Tự động có: caching, background refetch, retry, deduplication,
    // window focus refetching, garbage collection...
  });
}

// Mutation (create/update/delete)
const createProductMutation = useMutation({
  mutationFn: (data) => fetch('/api/products', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }).then(r => r.json()),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh list
  },
});
```

---

# PHẦN 4: Component Patterns

## 4.1 Higher-Order Component (HOC)

---

### Q: HOC là gì? Cho ví dụ thực tế. Nhược điểm là gì?

**Trả lời:**

HOC là function nhận vào một Component, trả về một Component mới đã được "enhance".

**Pattern**: `const EnhancedComponent = withSomething(OriginalComponent)`

```jsx
// HOC: withAuth — chỉ cho user đã login xem component
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user } = useAuth();
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return <WrappedComponent {...props} user={user} />;
  };
}

// Sử dụng:
const ProtectedDashboard = withAuth(Dashboard);

// HOC: withLoading
function withLoading(WrappedComponent) {
  return function LoadingComponent({ isLoading, ...props }) {
    if (isLoading) return <Spinner />;
    return <WrappedComponent {...props} />;
  };
}
```

**Nhược điểm HOC:**
- "Wrapper Hell" — nhiều HOC lồng nhau khó debug
- Naming collision (props trùng tên)
- Khó trace luồng data
- **Thay thế hiện đại**: Custom Hooks (ít wrapper, dễ TypeScript, dễ debug hơn)

---

## 4.2 Render Props

---

### Q: Render Props pattern là gì? So sánh với HOC và Custom Hooks.

**Trả lời:**

Render Props là pattern truyền một **function as prop** để component con quyết định render gì.

```jsx
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return render(position);
}

// Sử dụng:
<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />
```

**So sánh 3 pattern:**

| | HOC | Render Props | Custom Hooks |
|---|---|---|---|
| Wrapper Hell | ❌ Nhiều wrapper | ❌ Callback nesting | ✅ Không wrapper |
| TypeScript | Khó type | Khá OK | ✅ Dễ type nhất |
| Debug | Khó | Trung bình | ✅ Dễ nhất |
| **Khuyến nghị 2026** | Legacy code | Headless UI libs | ✅ Mặc định |

---

## 4.3 Compound Components

---

### Q: Compound Components pattern là gì? Cho ví dụ Tabs component.

**Trả lời:**

Compound Components là pattern nhiều component hoạt động cùng nhau như một unit, chia sẻ state ngầm qua Context.

```jsx
const TabsContext = createContext();

function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

// API sử dụng cực kỳ linh hoạt và declarative:
<Tabs defaultTab="profile">
  <TabList>
    <Tab value="profile">Hồ sơ</Tab>
    <Tab value="settings">Cài đặt</Tab>
  </TabList>
  <TabPanel value="profile"><ProfileContent /></TabPanel>
  <TabPanel value="settings"><SettingsContent /></TabPanel>
</Tabs>
```

Pattern này được dùng bởi Radix UI, Headless UI, Reach UI, MUI.

---

## 4.4 Controlled vs Uncontrolled

---

### Q: Controlled vs Uncontrolled Component — khác biệt và khi nào dùng?

**Trả lời:**

| | Controlled | Uncontrolled |
|---|---|---|
| **Nguồn dữ liệu** | React state | DOM |
| **Truy cập giá trị** | `value` + `onChange` | `useRef` |
| **Validation** | Real-time | Khi submit |
| **Khi nào dùng** | Form phức tạp, conditional logic | Form đơn giản, file input |

```jsx
// Controlled: React quản lý value
function ControlledForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (!e.target.value.includes('@')) {
      setError('Email không hợp lệ');
    } else {
      setError('');
    }
  };

  return (
    <>
      <input value={email} onChange={handleChange} />
      {error && <span className="error">{error}</span>}
    </>
  );
}

// Uncontrolled: DOM quản lý value
function UncontrolledForm() {
  const emailRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(emailRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={emailRef} defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Lưu ý**: `<input type="file" />` trong React **luôn là uncontrolled** vì browser security.

---

# PHẦN 5: Performance Optimization

## 5.1 React.memo

---

### Q: React.memo là gì? Khi nào nó KHÔNG hoạt động?

**Trả lời:**

`React.memo` ngăn re-render nếu props **không thay đổi** (shallow comparison).

```jsx
const ExpensiveList = React.memo(function ExpensiveList({ items, onItemClick }) {
  console.log('Rendering ExpensiveList'); // Chỉ log khi props thực sự đổi
  return items.map(item => (
    <div key={item.id} onClick={() => onItemClick(item.id)}>
      {item.name}
    </div>
  ));
});
```

**Khi nào React.memo KHÔNG hoạt động (hay bị hỏi nhất):**

```jsx
// ❌ React.memo VÔ DỤNG vì object/function tạo mới mỗi render
function Parent() {
  const style = { color: 'red' };           // Tạo mới mỗi render!
  const handleClick = () => console.log('click'); // Tạo mới mỗi render!
  
  return <MemoChild style={style} onClick={handleClick} />;
  // { color: 'red' } !== { color: 'red' } (khác reference) → ALWAYS re-render
}

// ✅ FIX: Memoize props
function Parent() {
  const style = useMemo(() => ({ color: 'red' }), []);
  const handleClick = useCallback(() => console.log('click'), []);
  
  return <MemoChild style={style} onClick={handleClick} />;
}
```

---

## 5.2 Code Splitting và Lazy Loading

---

### Q: Code Splitting và Lazy Loading trong React hoạt động thế nào?

**Trả lời:**

```jsx
import { lazy, Suspense } from 'react';

// Lazy load component — chỉ load khi được render lần đầu
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Advanced: Prefetch khi hover
function NavLink({ to, children }) {
  const prefetch = () => {
    if (to === '/dashboard') import('./pages/Dashboard');
  };

  return (
    <Link to={to} onMouseEnter={prefetch}>
      {children}
    </Link>
  );
}
```

**Chiến lược splitting:**
- **Route-based**: Mỗi route là một chunk (phổ biến nhất)
- **Component-based**: Modal, Drawer, Chart chỉ load khi mở
- **Library-based**: Heavy libraries tách riêng

---

## 5.3 Virtualization

---

### Q: Làm sao render danh sách 10,000 items hiệu quả?

**Trả lời:**

Dùng **virtualization (windowing)** — chỉ render items visible trong viewport.

```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="row">
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}          // Chiều cao viewport
      width="100%"
      itemCount={items.length}  // 10,000
      itemSize={50}          // Chiều cao mỗi row
    >
      {Row}
    </FixedSizeList>
  );
  // Chỉ render ~12-15 DOM nodes thay vì 10,000!
}
```

**Thư viện**: `react-window` (nhẹ, ~6KB) hoặc `@tanstack/react-virtual` (headless, mới hơn).

**Follow-up**: "Nếu items có chiều cao khác nhau?" → `VariableSizeList` + đo chiều cao bằng `ResizeObserver`.

---

# PHẦN 6: React Lifecycle và Rendering

---

### Q: Component re-render khi nào? Liệt kê tất cả trigger.

**Trả lời:**

Component React re-render khi:

1. **State thay đổi** — `setState` / `dispatch` được gọi
2. **Props thay đổi** — Parent truyền props mới xuống
3. **Parent re-render** — Khi parent re-render, TẤT CẢ children cũng re-render (trừ khi dùng React.memo)
4. **Context value thay đổi** — Tất cả consumers re-render
5. **forceUpdate()** — Class component only (hiếm dùng)

```jsx
// Ví dụ: Parent re-render → Child CŨNG re-render dù props không đổi
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <Child name="static" /> {/* RE-RENDER mỗi lần count đổi! */}
    </div>
  );
}

// FIX: React.memo
const Child = React.memo(function Child({ name }) {
  return <div>{name}</div>;
});
```

**Lưu ý quan trọng**: Re-render ≠ DOM update. React re-render tạo VDOM mới, nhưng chỉ commit (update Real DOM) nếu output thay đổi.

---

### Q: Giải thích React rendering phases: Render Phase vs Commit Phase.

**Trả lời:**

```
RENDER PHASE (Pure, có thể bị interrupt bởi Fiber)
├── React gọi component function
├── Tạo VDOM mới
├── Diff VDOM mới vs VDOM cũ
└── Tính toán danh sách DOM changes cần thực hiện

COMMIT PHASE (Synchronous, không thể interrupt)
├── Áp dụng changes lên Real DOM
├── Chạy useLayoutEffect (sync, trước paint)
├── Browser paints pixels lên màn hình
└── Chạy useEffect (async, sau paint)
```

**Tại sao phân biệt quan trọng:**
- Render Phase **có thể bị gọi nhiều lần** (React Strict Mode gọi 2 lần để phát hiện side effects) → Không nên có side effects trong render
- Commit Phase **chỉ chạy 1 lần** → Side effects an toàn (DOM manipulation, subscription)

---

# PHẦN 7: Error Boundaries

---

### Q: Error Boundary là gì? Tại sao phải dùng class component?

**Trả lời:**

Error Boundary là component bắt JavaScript errors trong **child component tree**, log error, và hiển thị fallback UI thay vì crash toàn bộ app.

**Phải dùng class component** vì React chưa cung cấp hook equivalents cho `getDerivedStateFromError` và `componentDidCatch`.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error lên Sentry, LogRocket...
    errorService.log(error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Đã xảy ra lỗi</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Sử dụng:
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>

// Thực tế: Dùng thư viện react-error-boundary
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => logToSentry(error, info)}
  onReset={() => queryClient.invalidateQueries()}
  resetKeys={[userId]}
>
  <UserProfile />
</ErrorBoundary>
```

---

### Q: Error Boundary KHÔNG bắt được lỗi nào?

**Trả lời:**

| Loại lỗi | Cách xử lý |
|---|---|
| **Event handlers** | `try/catch` trong handler |
| **Async code** (setTimeout, fetch) | `try/catch` + state |
| **Server-side rendering** | SSR error handling riêng |
| **Lỗi trong chính Error Boundary** | Nested boundary |

```jsx
// ❌ Error Boundary KHÔNG bắt lỗi trong event handler
function BuggyButton() {
  const handleClick = () => {
    throw new Error('Crash!'); // Error Boundary KHÔNG bắt!
  };
  return <button onClick={handleClick}>Click me</button>;
}

// ✅ Cách xử lý lỗi trong event handler
function SafeButton() {
  const [error, setError] = useState(null);
  
  const handleClick = () => {
    try {
      riskyOperation();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <p>Lỗi: {error}</p>;
  return <button onClick={handleClick}>Click me</button>;
}
```

---

# PHẦN 8: React 18/19 Features

---

### Q: Concurrent Rendering là gì? Khác gì Synchronous Rendering?

**Trả lời:**

**Synchronous**: React render toàn bộ tree liên tục, không thể interrupt. Nếu tree lớn → UI bị "đóng băng".

**Concurrent (React 18+)**: React có thể **tạm dừng** render, xử lý việc quan trọng hơn (user input), rồi quay lại.

```
Synchronous:
  [====== Render heavy list ======][User click wait...][Handle click]
  → User phải đợi render xong mới click được

Concurrent:
  [=== Render ===][PAUSE → Handle click][=== Resume render ===]
  → User click được ngay lập tức
```

**Concurrent KHÔNG tự bật** — phải opt-in bằng concurrent features:
- `useTransition` — đánh dấu update là "non-urgent"
- `useDeferredValue` — defer một value
- `<Suspense>` — loading boundary

---

### Q: useTransition là gì? Cho ví dụ thực tế.

**Trả lời:**

`useTransition` cho phép đánh dấu một state update là **"non-urgent"**, giúp UI vẫn responsive trong khi xử lý update nặng.

```jsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e) => {
    const value = e.target.value;
    
    // Update input ngay lập tức (urgent)
    setQuery(value);
    
    // Update kết quả search là non-urgent (transition)
    startTransition(() => {
      const filtered = heavyFilterOperation(allProducts, value);
      setResults(filtered); // React có thể interrupt nếu user tiếp tục gõ
    });
  };

  return (
    <div>
      <input value={query} onChange={handleSearch} />
      {isPending && <Spinner />}
      <ProductList items={results} />
    </div>
  );
}
```

**Key insight**: Input luôn responsive (urgent update), kết quả filter có thể delay (transition). Nếu user gõ tiếp, React **hủy** transition cũ và bắt đầu transition mới.

---

### Q: useDeferredValue khác gì useTransition?

**Trả lời:**

| | `useTransition` | `useDeferredValue` |
|---|---|---|
| **Control** | Wrap **setState call** | Wrap **value** |
| **Khi dùng** | Bạn control được setState | Nhận value từ props (không control setState) |

```jsx
// useTransition: bạn control setState
const [isPending, startTransition] = useTransition();
startTransition(() => setSearchResults(results));

// useDeferredValue: bạn KHÔNG control setState (props từ parent)
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  // deferredQuery sẽ "lag behind" query khi update nhanh
  
  const results = useMemo(() => {
    return heavySearch(deferredQuery);
  }, [deferredQuery]);

  return (
    <div style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}>
      {results.map(r => <ResultItem key={r.id} data={r} />)}
    </div>
  );
}
```

---

### Q: React 19 có những tính năng mới gì?

**Trả lời:**

- **React Compiler** — Tự động memoize, giảm nhu cầu useMemo/useCallback thủ công
- **Actions (`useActionState`, `useFormStatus`, `useOptimistic`)** — form handling hiện đại
- **`use()` hook** — Đọc resources (Promises, Context) trong render
- **`ref` as prop** — Không cần `forwardRef` nữa
- **Document Metadata** — `<title>`, `<meta>` trong component JSX

```jsx
// React 19: useOptimistic
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, addOptimistic] = useOptimistic(likes);

  const handleLike = async () => {
    addOptimistic(prev => prev + 1); // UI update ngay lập tức
    await api.likePost(postId);      // Gửi request
    setLikes(prev => prev + 1);      // Confirm từ server
  };

  return <button onClick={handleLike}>❤️ {optimisticLikes}</button>;
}

// React 19: ref as prop (không cần forwardRef)
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

---

# PHẦN 9: Testing

---

### Q: Triết lý testing của React Testing Library (RTL) khác Enzyme thế nào?

**Trả lời:**

| | Enzyme | React Testing Library |
|---|---|---|
| **Triết lý** | Test implementation details | Test behavior (user perspective) |
| **Truy cập** | Component state, methods | DOM output (text, role, label) |
| **Xu hướng 2026** | ❌ Deprecated | ✅ Standard |

> *"The more your tests resemble the way your software is used, the more confidence they can give you."* — Kent C. Dodds

```jsx
// ❌ Enzyme style: test implementation details
expect(wrapper.state('count')).toBe(0);
wrapper.instance().handleClick();

// ✅ RTL style: test behavior
render(<Counter />);
expect(screen.getByText('Count: 0')).toBeInTheDocument();
await userEvent.click(screen.getByRole('button', { name: 'Increment' }));
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

---

### Q: Viết test cho component có API call.

**Trả lời:**

```jsx
// UserProfile.test.jsx
import { render, screen } from '@testing-library/react';
import * as api from './api';
import UserProfile from './UserProfile';

jest.mock('./api');

describe('UserProfile', () => {
  it('shows loading then user name', async () => {
    api.getUser.mockResolvedValue({ name: 'Nguyễn Văn A' });
    
    render(<UserProfile userId={1} />);
    
    // Loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Đợi data load xong
    expect(await screen.findByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    api.getUser.mockRejectedValue(new Error('Network Error'));
    
    render(<UserProfile userId={1} />);
    
    expect(await screen.findByRole('alert')).toHaveTextContent('Error: Network Error');
  });
});
```

---

### Q: RTL query priority — nên dùng query nào?

**Trả lời:**

```
Thứ tự ưu tiên (theo official docs):
1. getByRole         ← ƯU TIÊN NHẤT (accessible, giống user tương tác)
2. getByLabelText    ← Form elements
3. getByPlaceholderText
4. getByText         ← Non-interactive elements
5. getByAltText      ← Images
6. getByTestId       ← CUỐI CÙNG (escape hatch)
```

```jsx
// ✅ Tốt nhất: getByRole
screen.getByRole('button', { name: 'Submit' });
screen.getByRole('textbox', { name: 'Email' });
screen.getByRole('heading', { level: 1 });

// ✅ Form inputs
screen.getByLabelText('Email address');

// ❌ Tránh nếu có thể (test implementation detail)
screen.getByTestId('submit-button');
```

---

# CÂU HỎI BONUS THƯỜNG GẶP

---

### Q: Portals trong React là gì? Khi nào dùng?

```jsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal-overlay">{children}</div>,
    document.getElementById('modal-root')
  );
}
// Dùng cho: modal, tooltip, toast — render ngoài DOM tree bình thường
```

---

### Q: forwardRef dùng khi nào? React 19 có gì thay đổi?

```jsx
// React 18 và trước: Cần forwardRef
const FancyInput = forwardRef((props, ref) => (
  <input ref={ref} className="fancy" {...props} />
));

// Parent:
const inputRef = useRef();
<FancyInput ref={inputRef} />

// React 19: ref là prop bình thường, không cần forwardRef
function FancyInput({ ref, ...props }) {
  return <input ref={ref} className="fancy" {...props} />;
}
```

---

### Q: React.Fragment dùng để làm gì?

```jsx
// Giải quyết vấn đề: "JSX requires single root element"
// nhưng không muốn thêm DOM node thừa

// ❌ Dư một <div>
return (
  <div>
    <td>Cell 1</td>
    <td>Cell 2</td>
  </div>
);

// ✅ Fragment (không render DOM node)
return (
  <>
    <td>Cell 1</td>
    <td>Cell 2</td>
  </>
);

// Khi cần key: dùng <Fragment key={id}> thay vì shorthand <></>
{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </Fragment>
))}
```

---

### Q: Giải thích sự khác biệt giữa props và state?

| | Props | State |
|---|---|---|
| Nguồn gốc | Nhận từ parent | Quản lý nội bộ component |
| Mutable | Immutable (read-only) | Mutable (via setState) |
| Owner | Parent component | Component hiện tại |
| Khi thay đổi | Parent quyết định | Component tự quyết định |

---

# TÓM TẮT — PRIORITY MATRIX CHO PHỎNG VẤN REACTJS

| Mức độ | Chủ đề | Lý do |
|---|---|---|
| **PHẢI BIẾT** | useState, useEffect (functional update, cleanup, deps) | Hỏi 100% |
| **PHẢI BIẾT** | Virtual DOM, Reconciliation, key prop | Hỏi 90% |
| **PHẢI BIẾT** | useMemo, useCallback — khi nào cần/không cần | Hỏi 85% |
| **PHẢI BIẾT** | React.memo — khi nào KHÔNG hoạt động | Hỏi 80% |
| **PHẢI BIẾT** | Custom Hook (useDebounce, useFetch) | Live coding 70% |
| **NÊN BIẾT** | Context API + performance issue | Hỏi 70% |
| **NÊN BIẾT** | Zustand vs Redux vs React Query | Hỏi 65% |
| **NÊN BIẾT** | Error Boundary | Hỏi 60% |
| **NÊN BIẾT** | useTransition, useDeferredValue | Hỏi 50% |
| **NÊN BIẾT** | Compound Components, HOC, Render Props | Hỏi 40% |
| **BONUS** | React Fiber, Render Phase vs Commit Phase | Senior-level |

## Tips phỏng vấn

1. **Giải thích trade-offs** — Interviewer muốn nghe "khi nào dùng và khi nào không dùng", không chỉ định nghĩa
2. **Code ví dụ cụ thể** — Luôn minh họa bằng code ngắn gọn
3. **Kết nối với thực tế** — "Ở dự án tôi đang làm, tôi gặp vấn đề X và giải quyết bằng Y"
4. **Tránh over-engineer** — Đừng dùng Redux cho mọi thứ, đừng memoize mọi function

---

*Tiếp theo: Xem [ZZ_57_NEXTJS_INTERVIEW.md](./ZZ_57_NEXTJS_INTERVIEW.md) cho Next.js, và [ZZ_58_JS_CSS_INTERVIEW.md](./ZZ_58_JS_CSS_INTERVIEW.md) cho JavaScript/CSS/API/Git*
