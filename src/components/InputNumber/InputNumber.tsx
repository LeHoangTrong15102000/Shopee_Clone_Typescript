import { InputHTMLAttributes, forwardRef, useState } from 'react'

export interface InputNumberProps extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string
  // name: string // để truyền vào tham số thứ nhất cho register
  classNameInput?: string
  classNameError?: string
  maxValue?: string
  // autoComplete?: string
}

const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumberInner(
  {
    maxValue,
    errorMessage,
    className,
    classNameInput = 'w-full rounded-sm border border-gray-300 p-3 shadow-sm outline-none focus:border-gray-500',
    classNameError = 'mt-1 min-h-[1.25rem] text-sm text-red-600',
    onChange, // lấy ra onChange là sự kiện trong thẻ Input\
    value = '', // Nên có giá trị khởi tạo là value rỗng không thì nó sẽ là undefined, undefined mà truyền vào input thì nó không được
    ...rest
  },
  ref
) {
  const [localValue, setLocalValue] = useState<string>(value as string) //
  // Khi người dùng gõ số thì hàm onChange nó sẽ chạy
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target
    if (value === '0') return

    if (maxValue && +value >= +maxValue) {
      value = maxValue
      event.target.value = maxValue
    }

    if (/^\d+$/.test(value) || value === '') {
      // Thực thi onChange callback từ bên ngoài truyền vào props
      onChange && onChange(event) // Ở đây chúng ta xuất ra cái event thì onChange bên ngoài nhận vào cái event(value thì nhận vào cái value)
      // cập nhật localValue state
      setLocalValue(value)
    }
  }
  return (
    <div className={className}>
      <input
        className={classNameInput}
        // Tự sinh ra cho chúng ta với name là email
        onChange={handleChange} // khi hàm onChange props truyền vào chạy thì onChange <input /> nó sẽ chạy
        ref={ref}
        value={value || localValue}
        {...rest}
      />
      {/* cho m-height để khi mà không có lỗi thì nó vẫn chiếm được vị trí ở đó */}
      <div className={classNameError}>{errorMessage}</div>
    </div>
  )
})

export default InputNumber
