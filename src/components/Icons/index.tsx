// Centralized Icons để tối ưu hóa bundle size
// React 19 tự động tối ưu hóa nên không cần memo()

interface IconProps {
  className?: string
  viewBox?: string
  fill?: string
}

export const CartIcon = ({ className = 'h-5 w-5', viewBox = '0 0 24 24', fill = 'currentColor' }: IconProps) => (
  <svg className={className} viewBox={viewBox} fill={fill}>
    <path d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z' />
  </svg>
)

export const SearchIcon = ({ className = 'h-5 w-5', viewBox = '0 0 24 24', fill = 'currentColor' }: IconProps) => (
  <svg className={className} viewBox={viewBox} fill={fill}>
    <path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' />
  </svg>
)

export const FilterIcon = ({ className = 'h-4 w-3', viewBox = '0 0 15 15', fill = 'currentColor' }: IconProps) => (
  <svg className={className} viewBox={viewBox} fill={fill}>
    <g>
      <polyline
        fill='none'
        points='5.5 13.2 5.5 5.8 1.5 1.2 13.5 1.2 9.5 5.8 9.5 10.2'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeMiterlimit={10}
      />
    </g>
  </svg>
)

export const CategoryIcon = ({ className = 'h-4 w-3', viewBox = '0 0 12 10', fill = 'currentColor' }: IconProps) => (
  <svg className={className} viewBox={viewBox} fill={fill}>
    <g fillRule='evenodd' stroke='none' strokeWidth={1}>
      <g transform='translate(-373 -208)'>
        <g transform='translate(155 191)'>
          <g transform='translate(218 17)'>
            <path d='m0 2h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
            <path d='m0 6h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
            <path d='m0 10h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
          </g>
        </g>
      </g>
    </g>
  </svg>
)

export const ArrowIcon = ({ className = 'h-2 w-2', viewBox = '0 0 4 7', fill = 'currentColor' }: IconProps) => (
  <svg className={className} viewBox={viewBox} fill={fill}>
    <polygon points='4 3.5 0 0 0 7' />
  </svg>
)
