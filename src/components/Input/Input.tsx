// Khi mà dùng function thì hả nên import React
import { InputHTMLAttributes } from 'react'
import type { UseFormRegister, RegisterOptions } from 'react-hook-form'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string
  // name: string // để truyền vào tham số thứ nhất cho register
  classNameInput?: string
  classNameError?: string
  register?: UseFormRegister<any> // có hay không cũng được
  rules?: RegisterOptions // Là những options trong tham số thứ 2 của register{...}
  // autoComplete?: string
}

const Input = ({
  errorMessage,
  className,
  name,
  register,
  rules,
  classNameInput = 'w-full rounded-sm border border-gray-300 p-3 shadow-sm outline-none focus:border-gray-500',
  classNameError = 'mt-1 min-h-[1.25rem] text-sm text-red-600',
  ...rest
}: Props) => {
  const registerResult = register && name ? register(name, rules) : null // {} // làm như này để tái sử dụng component Input ở các nơi khác nhau
  return (
    <div className={className}>
      <input
        className={classNameInput}
        // Tự sinh ra cho chúng ta với name là email, nó sẽ tự sinh ra cho chúng ta nên không cần truyền vào
        {...registerResult}
        {...rest}
      />
      {/* cho m-height để khi mà không có lỗi thì nó vẫn chiếm được vị trí ở đó */}
      <div className={classNameError}>{errorMessage}</div>
    </div>
  )
}

export default Input
