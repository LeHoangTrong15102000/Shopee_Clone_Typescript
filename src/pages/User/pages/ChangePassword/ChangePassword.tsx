import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import omit from 'lodash/omit'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import userApi, { BodyUpdateProfile } from 'src/apis/user.api'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import { ErrorResponseApi } from 'src/types/utils.type'
import { UserSchema, schema, userSchema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'

type FormData = Pick<UserSchema, 'password' | 'new_password' | 'confirm_password'>

const changePasswordSchema = userSchema.pick(['password', 'new_password', 'confirm_password'])

const ChangePassword = () => {
  // Khai báo useForm
  const {
    register,
    handleSubmit,
    reset,
    setError, // thường dùng setError do sv trả về
    formState: { errors } // thường setError với schema của yup
  } = useForm<FormData>({
    defaultValues: {
      password: '',
      new_password: '',
      confirm_password: ''
    },
    resolver: yupResolver(changePasswordSchema) // để profileSchema vào
  })

  // updateProfile
  const updateProfileMutation = useMutation({
    mutationFn: (body: BodyUpdateProfile) => userApi.updateProfile(body)
  })

  // Func xử lý sự kiện thay đổi mật khẩu
  const onSubmit = handleSubmit(async (data) => {
    try {
      // omit thằng confirm_password đi
      const res = await updateProfileMutation.mutateAsync(omit(data, ['confirm_password']))
      toast.success(res.data.message)
      // reset lại cái Form
      reset()
    } catch (error) {
      // // Xử lý lỗi từ phía server
      if (isAxiosUnprocessableEntityError<ErrorResponseApi<FormData>>(error)) {
        // Lấy lỗi và set vào RHF setError
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            // Ép kiểu cho key luôn
            setError(key as keyof FormData, {
              message: formError[key as keyof FormData],
              type: 'Server'
            })
          })
        }
      }
    }
  })

  return (
    <div className='rounded-md bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      {/* Tiêu đề */}
      <div className='border-b border-b-gray-100 py-6 text-center sm:text-left'>
        <h1 className='text-lg font-medium capitalize text-gray-700'>Thêm mật khẩu</h1>
        <div className='mt-[0.1875rem] text-[.875rem]'>
          Để bảo mật tài khoản, vui lòng không chia sẻ tài khoản cho người khác
        </div>
      </div>
      {/* Form mật khẩu */}
      <form className='mt-8 flex flex-col-reverse md:flex-row md:items-start' onSubmit={onSubmit}>
        {/* Form */}
        <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
          {/* flex-wrap đừng cho nó rớt ra bên ngoài */}
          {/* Mật khẩu cũ */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right'>
              Mật khẩu cũ
            </div>
            <div className='sm:w-[40%] sm:pl-5'>
              <Input
                register={register}
                name='password'
                type='password'
                errorMessage={errors.password?.message}
                autoComplete='on'
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-gray-500'
                className='relative'
              />
            </div>
          </div>
          {/* Mật khẩu mới */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right'>
              Mật khẩu mới
            </div>
            <div className='sm:w-[40%] sm:pl-5'>
              <Input
                register={register}
                name='new_password'
                type='password'
                errorMessage={errors.new_password?.message}
                autoComplete='on'
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-gray-500'
                className='relative'
              />
            </div>
          </div>
          {/* Nhập lại mật khẩu mới */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right'>
              Nhập lại mật khẩu mới
            </div>
            <div className='sm:w-[40%] sm:pl-5'>
              <Input
                register={register}
                name='confirm_password'
                type='password'
                errorMessage={errors.confirm_password?.message}
                autoComplete='on'
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-gray-500'
                className='relative'
              />
            </div>
          </div>
          {/* button lưu thay đổi */}
          <div className='mt-3 flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right' />
            <div className='w-[100%] sm:w-[70%] sm:pl-5'>
              <Button
                type='submit'
                className='flex h-10 min-w-[70px] max-w-[220px] items-center justify-center rounded-sm bg-[#ee4d2d] px-5 text-center text-sm text-white hover:bg-[#ee4d2d]/90'
              >
                Xác Nhận
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChangePassword
