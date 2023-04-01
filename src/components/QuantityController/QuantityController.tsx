import { useState } from 'react'
import InputNumber, { InputNumberProps } from 'src/components/InputNumber'

// Ngoài những thuộc tính có sẵn chúng ta sẽ thêm các thuộc tính khác thuộc trường Quantity
interface Props extends InputNumberProps {
  max?: number
  onIncrease?: (value: number) => void
  onDecrease?: (value: number) => void
  onType?: (value: number) => void
  onFocusOut?: (value: number) => void
  classNameWrapper?: string
}

const QuantityController = ({
  max,
  onIncrease,
  onDecrease,
  onFocusOut,
  onType,
  classNameWrapper = 'ml-10',
  value, // Lấy ra value là thuộc tính của thẻ Input
  ...rest
}: Props) => {
  const [localValue, setLocalValue] = useState<number>(Number(value || 0))
  // Đã check chữ trong InputNumber component rồi nên không cần phải check nữa -> chỉ cần truyền giá trị vào
  // Hàm handleChange này dùng để truyền vào onChange gốc của chúng ta
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let _value = Number(event.target.value)
    if (max !== undefined && _value > max) {
      _value = max
    } else if (_value < 1) {
      _value = 1
    }

    // Khi mà có onType thì chúng ta sẽ truyền vào onType như này
    onType && onType(_value)
    // Cập nhật localValue tại đây luôn
    setLocalValue(_value)
  }

  // func tăng sản phẩm
  const increase = () => {
    let _value = Number(value || localValue) + 1
    if (max !== undefined && _value > max) {
      _value = max
    }

    onIncrease && onIncrease(_value)
    setLocalValue(_value)
  }

  // fucn giảm sản phẩm
  const decrease = () => {
    let _value = Number(value || localValue) - 1
    if (_value < 1) {
      _value = 1 // reset lại giá trị value
    }

    onDecrease && onDecrease(_value)
    setLocalValue(_value)
  }

  // func handle blur
  const handleBlur = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    const _value = Number(event.target.value)
    onFocusOut && onFocusOut(_value)
  }

  return (
    <div className={'flex items-center ' + classNameWrapper}>
      <button
        className='flex h-8 w-8 items-center justify-center rounded-l-md border border-[rgba(0,0,0,.09)]'
        onClick={decrease}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-4 w-4'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 12h-15' />
        </svg>
      </button>
      <InputNumber
        classNameError='hidden'
        classNameInput='h-8 w-14 p-1 text-center'
        className='grow'
        type='text'
        onChange={handleChange}
        onBlur={handleBlur}
        value={value || localValue} // value chính là từ bên ngoài truyền vào
        {...rest}
      />
      <button
        className='flex h-8 w-8 items-center justify-center rounded-r-md border border-[rgba(0,0,0,.09)]'
        onClick={increase}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-4 w-4'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
        </svg>
      </button>
    </div>
  )
}

export default QuantityController
