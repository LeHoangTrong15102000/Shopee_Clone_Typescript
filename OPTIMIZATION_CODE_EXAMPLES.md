# ANIMATION OPTIMIZATION GUIDE - CODE EXAMPLES

## ISSUE #1: ProductList Stagger Animation

### Current Code (SLOW):
```typescript
// src/pages/ProductList/ProductList.tsx line 26-34
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03  // 600-1800ms for 20-60 items!
    }
  }
}
```

### Recommended Fix #1 - Reduce Stagger:
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.01  // 200-600ms instead
    }
  }
}
```

### Recommended Fix #2 - Disable for Grid View:
```typescript
const containerVariants = (viewMode: string) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: viewMode === 'grid' ? 0 : 0.03
    }
  }
})

// Usage:
<motion.div
  variants={containerVariants(viewMode)}
  initial='hidden'
  animate='visible'
>
```

### Recommended Fix #3 - Use CSS Instead:
```typescript
// Disable framer-motion stagger, use CSS animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
  className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
>
  {products.map((product, index) => (
    <div
      key={product._id}
      className='col-span-1 animate-fade-in-up'
      style={{ animationDelay: `${index * 0.02}s` }}
    >
      <Product product={product} />
    </div>
  ))}
</motion.div>
```

---

## ISSUE #2: Product Card Hover Animations

### Current Code (MULTIPLE ANIMATIONS):
```typescript
// src/pages/ProductList/components/Product/Product.tsx
<motion.div
  whileHover={{
    y: -5,
    transition: { duration: 0.2 }
  }}
>
  <div className='...'>
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <OptimizedImage ... />
    </motion.div>
  </div>
</motion.div>
```

### Recommended Fix - Use CSS for Scale:
```typescript
<motion.div
  whileHover={{
    y: -5,
    transition: { duration: 0.2 }
  }}
>
  <div className='...'>
    <div className='relative w-full overflow-hidden hover:scale-110 transition-transform duration-300'>
      <OptimizedImage ... />
    </div>
  </div>
</motion.div>
```

---

## ISSUE #3: No Virtualization

### Current Code:
```typescript
// src/pages/ProductList/index.ts
const USE_INFINITE_SCROLL = false  // Disabled!
```

### Recommended Fix #1 - Enable Infinite Scroll:
```typescript
const USE_INFINITE_SCROLL = true  // Enable infinite scroll
```

### Recommended Fix #2 - Implement Virtualization:
```typescript
import { FixedSizeList as List } from 'react-window'

<List
  height={600}
  itemCount={products.length}
  itemSize={250}
  width='100%'
>
  {({ index, style }) => (
    <div style={style}>
      <Product product={products[index]} />
    </div>
  )}
</List>
```

---

## OPTIMIZATION CHECKLIST

### Performance:
- [ ] Reduce ProductList stagger to 0.01s
- [ ] Replace Product card scale with CSS
- [ ] Enable infinite scroll or virtualization
- [ ] Monitor Core Web Vitals

### Accessibility:
- [ ] Test prefers-reduced-motion
- [ ] Verify keyboard navigation
- [ ] Test with screen readers

### Testing:
- [ ] Lighthouse audit
- [ ] Device throttling test
- [ ] Mobile browser testing
- [ ] Low-end device testing

---

## MONITORING RECOMMENDATIONS

### Add Performance Metrics:
```typescript
// src/utils/performanceMonitor.ts
export const monitorAnimationPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 100) {
        console.warn(`Slow animation: ${entry.name} (${entry.duration}ms)`)
      }
    })
  })
  observer.observe({ entryTypes: ['measure'] })
}
```

### Track Web Vitals:
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```


