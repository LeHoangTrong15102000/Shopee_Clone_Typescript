import _ from 'lodash'
import { useState } from 'react'

interface Props {
  onChange?: (value: Date) => void
  value?: Date
  errorMessage?: string
}

const DateSelect = ({ onChange, value, errorMessage }: Props) => {
  const [date, setDate] = useState({
    date: 1,
    month: 0,
    year: 1990
  })

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = event.target
  }
  return (
    <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
      <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Ngày sinh</div>
      <div className='sm:w-[80%] sm:pl-5'>
        <div className='flex justify-between'>
          <select
            onChange={handleChange}
            name='date'
            className='h-10 w-[32%] cursor-pointer rounded-sm border border-black/10 px-3 hover:border-[#ee4d2d]'
          >
            <option disabled>Ngày</option>
            {/* Những option khác sẽ generate ra */}
            {_.range(1, 32).map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            onChange={handleChange}
            name='month'
            className='h-10 w-[32%] cursor-pointer rounded-sm border border-black/10 px-3 hover:border-[#ee4d2d]'
          >
            <option disabled>Tháng</option>
            {_.range(0, 12).map((item) => (
              <option value={item} key={item}>
                {item + 1}
              </option>
            ))}
          </select>
          <select
            onChange={handleChange}
            name='year'
            className='h-10 w-[32%] cursor-pointer rounded-sm border border-black/10 px-3 hover:border-[#ee4d2d]'
          >
            <option disabled>Năm</option>
            {_.range(1990, 2024).map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Thẻ div show lỗi */}
      <div className='mt-1 min-h-[1.25rem] text-sm text-red-600'>{}</div>
    </div>
  )
}

export default DateSelect
