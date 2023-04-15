import React from 'react'
import ReactDOM from 'react-dom'
import { Product } from 'src/types/product.type'

interface Props {
  children?: React.ReactNode
  open: boolean
  product: Product
  handleIsAgree: () => void
  handleIsCancel: () => void
}

const root = document.querySelector('body') as HTMLElement

const DeleteModal = ({ open = false, handleIsAgree, handleIsCancel, product }: Props) => {
  // Thường ok và cancel chúng ta sẽ thực hiện cái function mà chúng ta truyền vào
  // Xử lý Ok
  const handleDelete = () => {
    handleIsAgree()
    handleIsCancel() // Sau khi delete thành công thì set lại open là false
    // console.log(open)
  }

  // Xử lý cancel, từ cái function bên trên truyền xuống
  const handleCancel = () => {
    handleIsCancel()
  }

  // kiểm tra xem open có đang mở hay không
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.removeProperty('overflow') // hoặc là .style.overflow = ''
  }

  if (typeof document === 'undefined') return <div className='modal'></div>
  return ReactDOM.createPortal(
    <div
      className={`modal fixed inset-0 z-50 flex items-center justify-center p-5 ${open ? '' : 'invisible opacity-0'}`}
    >
      <div className='overlay absolute inset-0 bg-black/40'></div>
      <div className='modal-content relative z-50 h-full max-h-[317px] w-full max-w-[540px] rounded-md bg-white p-5 shadow-sm'>
        {/* Tiêu đề */}
        <div className='mt-8 text-[24px] text-[#ee4d2d]'>Bạn chắc chắn muốn bỏ sản phẩm này?</div>
        {/* Tên sản phẩm */}
        <div className='mt-10 text-base text-black/80'>{product?.name}</div>
        {/* button */}
        <div className='mt-[80px] flex items-center justify-between'>
          <button
            onClick={handleDelete}
            className='h-[40px] min-w-[70px] max-w-[220px] flex-grow rounded border bg-[#ee4d2d] px-5 text-[14px] text-white shadow-sm outline-none hover:bg-opacity-90'
          >
            Có
          </button>
          <button
            onClick={handleCancel}
            className='h-[40px] min-w-[70px] max-w-[220px] flex-grow rounded border bg-white text-[14px] text-black shadow-sm hover:bg-gray-500/5'
          >
            Không
          </button>
        </div>
      </div>
    </div>,
    root
  )
}

export default DeleteModal
