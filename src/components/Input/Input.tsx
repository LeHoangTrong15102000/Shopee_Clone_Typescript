// Khi mà dùng function thì hả nên import React
import { InputHTMLAttributes, useState } from 'react'
import type { UseFormRegister, RegisterOptions, FieldValues, FieldPath } from 'react-hook-form'

// Mặc định là chúng ta sẽ lấy là FieldValues để nó không có báo lỗi nữa
// TFieldValue nó kế thừa từ FieldValues mặc định chúng ta sẽ lấy TFieldValues, giá trị mặc định có thể gán hoặc không gán đều không sao cả

// Thằng TFieldValues bên trong interface này thì nó chỉ được dùng trong phạm vi của interface thôi
// interface Props<TFieldValues extends FieldValues = FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
//   errorMessage?: string
//   // name: string // để truyền vào tham số thứ nhất cho register
//   classNameInput?: string
//   classNameError?: string
//   classNameEye?: string
//   register?: UseFormRegister<TFieldValues> // có hay không cũng được
//   rules?: RegisterOptions // Là những options trong tham số thứ 2 của register{...}
//   // autoComplete?: string
//   name: FieldPath<TFieldValues>
// }

interface Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string
  // name: string // để truyền vào tham số thứ nhất cho register
  classNameInput?: string
  classNameError?: string
  classNameEye?: string
  register?: UseFormRegister<TFieldValues> // có hay không cũng được
  rules?: RegisterOptions // Là những options trong tham số thứ 2 của register{...}
  // autoComplete?: string
  name: TName
}

// Cái Generic Type nó vẫn đóng vai trò là cầu nối dữ liệu giũa `nane` và `register`

// arrow function thì phải viết Generic type như thế này, muốn chặt chẽ hơn thì cho thêm = FieldValues vào
const Input = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  errorMessage,
  className,
  name,
  register,
  rules,
  classNameInput = 'w-full rounded-sm border border-gray-300 p-3 shadow-sm outline-none focus:border-gray-500',
  classNameError = 'mt-1 min-h-[1.25rem] text-sm text-red-600',
  classNameEye = 'absolute right-[8px] top-[9px] h-6 w-6 cursor-pointer',
  ...rest
}: // TFieldValues ở đây truyền thông qua
Props<TFieldValues, TName>) => {
  // state để lưu trữ việc hiển thị con mắt
  const [openEye, setOpenEye] = useState(false)
  const registerResult = register && name ? register(name, rules as any) : null // {} // làm như này để tái sử dụng component Input ở các nơi khác nhau

  // func toggle eye
  const handleToggleEye = () => {
    setOpenEye((prev) => !prev)
  }

  // func handle việc hiển thị giá trị ô Input khi mà toggleEye
  const handleTypeToggleEye = () => {
    if (rest.type === 'password') {
      return openEye ? 'text' : 'password'
    }
    // Còn không phải là `password` thì return lại rest.type
    return rest.type
  }

  // Tính toán className với border đỏ khi có error
  const getInputClassName = () => {
    if (errorMessage) {
      return classNameInput.replace('border-gray-300', 'border-red-600')
    }
    return classNameInput
  }

  // Tạo unique ID cho error message
  const errorId = errorMessage ? `${name}-error` : undefined

  return (
    <div className={className}>
      {rest.value && (
        <label
          className='absolute top-[-12px] left-[8px] block animate-slide-top-sm bg-white px-1 py-1 text-[12px] italic text-gray-700 transition-all duration-300 ease-out'
          htmlFor={name}
        >
          {name?.slice(0, 1).toUpperCase() + name?.slice(1)}
        </label>
      )}
      <input
        className={getInputClassName()}
        // Tự sinh ra cho chúng ta với name là email, nó sẽ tự sinh ra cho chúng ta nên không cần truyền vào
        {...registerResult}
        {...rest}
        // Ensure name and type are passed through properly
        name={name}
        type={handleTypeToggleEye()}
        // ARIA attributes for accessibility
        aria-invalid={errorMessage ? 'true' : 'false'}
        aria-describedby={errorId}
      />
      {/* Eye-open */}
      {rest.type === 'password' && openEye && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className={classNameEye}
          onClick={handleToggleEye}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
          />
          <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
        </svg>
      )}
      {rest.type === 'password' && !openEye && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className={classNameEye}
          onClick={handleToggleEye}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
          />
        </svg>
      )}
      {/* Eye-close */}
      {/* cho m-height để khi mà không có lỗi thì nó vẫn chiếm được vị trí ở đó */}
      <div className={classNameError} id={errorId}>
        {errorMessage}
      </div>
    </div>
  )
}

export default Input
