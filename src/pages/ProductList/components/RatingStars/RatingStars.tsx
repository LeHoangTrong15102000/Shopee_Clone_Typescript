import { createSearchParams, useNavigate } from 'react-router-dom'
import path from 'src/constant/path'
import { QueryConfig } from 'src/hooks/useQueryConfig'

interface Props {
  queryConfig: QueryConfig
}

const RatingStars = ({ queryConfig }: Props) => {
  const navigate = useNavigate()

  const handleFilterStar = (ratingFilterNumber: number) => {
    navigate({
      pathname: path.products,
      search: createSearchParams({
        ...queryConfig,
        rating_filter: String(ratingFilterNumber)
      }).toString()
    })
  }

  return (
    <ul className='my-3'>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <li className='py-1 pl-2' key={index}>
            {/* Thường là những sự kiện như onClick thì Eslint nó bắt các thẻ để click nên là button,... */}
            <div
              className='flex cursor-pointer items-center text-sm'
              onClick={() => handleFilterStar(5 - index)}
              tabIndex={0}
              role='button'
              aria-hidden='true'
            >
              {Array(5)
                .fill(0)
                .map((_, indexStar) => {
                  // Xử lý thuật toán in ra ngôi sao theo đánh giá sao
                  if (indexStar < 5 - index) {
                    return (
                      <svg viewBox='0 0 9.5 8' className='mr-[1.7px] h-4 w-[16px] fill-current' key={indexStar}>
                        <defs>
                          <linearGradient id='ratingStarGradient' x1='50%' x2='50%' y1='0%' y2='100%'>
                            <stop offset={0} stopColor='#ffca11' />
                            <stop offset={1} stopColor='#ffad27' />
                          </linearGradient>
                          <polygon
                            id='ratingStar'
                            points='14.910357 6.35294118 12.4209136 7.66171903 12.896355 4.88968305 10.8823529 2.92651626 13.6656353 2.52208166 14.910357 0 16.1550787 2.52208166 18.9383611 2.92651626 16.924359 4.88968305 17.3998004 7.66171903'
                          />
                        </defs>
                        <g fill='url(#ratingStarGradient)' fillRule='evenodd' stroke='none' strokeWidth={1}>
                          <g transform='translate(-876 -1270)'>
                            <g transform='translate(155 992)'>
                              <g transform='translate(600 29)'>
                                <g transform='translate(10 239)'>
                                  <g transform='translate(101 10)'>
                                    <use stroke='#ffa727' strokeWidth='.5' xlinkHref='#ratingStar' />
                                  </g>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                    )
                  }
                  // Còn không return về ngôi sao màu trắng
                  return (
                    <svg viewBox='0 0 30 30' className='mr-[1.7px] h-4 w-[16px] fill-current' key={indexStar}>
                      <defs>
                        <linearGradient id='star__hollow' x1='50%' x2='50%' y1='0%' y2='99.0177926%'>
                          <stop offset='0%' stopColor='#FFD211' />
                          <stop offset='100%' stopColor='#FFAD27' />
                        </linearGradient>
                      </defs>
                      <path
                        fill='none'
                        fillRule='evenodd'
                        stroke='url(#star__hollow)'
                        strokeWidth={2}
                        d='M23.226809 28.390899l-1.543364-9.5505903 6.600997-6.8291523-9.116272-1.4059447-4.01304-8.63019038-4.013041 8.63019038-9.116271 1.4059447 6.600997 6.8291523-1.543364 9.5505903 8.071679-4.5038874 8.071679 4.5038874z'
                      />
                    </svg>
                  )
                })}
              {index !== 0 && <span className='ml-1'>trở lên</span>}
            </div>
          </li>
        ))}
    </ul>
  )
}

export default RatingStars
