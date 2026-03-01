import React, { Fragment, useRef } from 'react'
import config from 'src/constant/config'
import { toast } from 'react-toastify'

interface Props {
  onChange?: (file?: File) => void
}

const InputFile = ({ onChange }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // const [file, setFile] = useState<File>()
  // const previewImage = useMemo(() => {
  //   // Nếu mà có cái file thì gọi đến
  //   return file ? URL.createObjectURL(file) : ''
  // }, [file])

  // Khai báo function handleUpload để control upload file ảnh
  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  // Xử lý file khi upload ảnh
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // lấy file
    const fileFromLocal = event.target.files?.[0]
    // Nếu như mà vượt quá kích thước và không có type là `image` thì sẽ toast nó lên
    if (fileFromLocal && (fileFromLocal?.size >= config.maxSizeUploadAvatar || !fileFromLocal.type.includes('image'))) {
      toast.error('Dung lượng file hoặc định dạng không đúng quy định', { autoClose: 1000, position: 'top-center' })
    } else {
      onChange && onChange(fileFromLocal) // Cái fileFromLocal giá trị có thể là Undefined
    }
  }

  return (
    <Fragment>
      <input
        type='file'
        className='hidden'
        accept='.jpg,.jpeg,.png'
        ref={fileInputRef}
        onChange={onFileChange}
        onClick={(event) => {
          ;(event.target as any).value = null
        }}
      />
      <button
        type='button'
        className='flex h-9 min-w-[70px] items-center justify-center rounded-xs border border-gray-300 bg-white px-4 text-xs text-[#555] capitalize outline-hidden transition-colors hover:bg-gray-50 md:h-10 md:min-w-[90px] md:px-5 md:text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
        onClick={handleUpload}
      >
        chọn ảnh
      </button>
    </Fragment>
  )
}

export default InputFile
