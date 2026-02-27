import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import omit from 'lodash/omit'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import userApi, { BodyUpdateProfile } from 'src/apis/user.api'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import PasswordStrengthMeter from 'src/components/PasswordStrengthMeter'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { ErrorResponseApi } from 'src/types/utils.type'
import { UserSchema, baseUserSchema } from 'src/utils/rules'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { z } from 'zod'

type FormData = Pick<UserSchema, 'password' | 'new_password' | 'confirm_password'>

const changePasswordSchema = baseUserSchema
  .pick({ password: true, new_password: true, confirm_password: true })
  .superRefine((data, ctx) => {
    if (data.new_password && data.confirm_password !== data.new_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nhập lại password không khớp!!',
        path: ['confirm_password']
      })
    }
  })

const ChangePassword = () => {
  // Khai báo useForm
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError, // thường dùng setError do sv trả về
    formState: { errors } // thường setError với schema của zod
  } = useForm<FormData>({
    defaultValues: {
      password: '',
      new_password: '',
      confirm_password: ''
    },
    resolver: zodResolver(changePasswordSchema)
  })

  const watchedNewPassword = watch('new_password', '')

  // updateProfile
  const updateProfileMutation = useMutation({
    mutationFn: (body: BodyUpdateProfile) => userApi.updateProfile(body)
  })

  const reducedMotion = useReducedMotion()

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

  // Password requirements for security tips card
  const passwordRequirements = [
    { label: 'Ít nhất 6 ký tự', check: (watchedNewPassword?.length ?? 0) >= 6 },
    {
      label: 'Chứa ít nhất 1 chữ hoa',
      check: /[A-Z]/.test(watchedNewPassword ?? '')
    },
    {
      label: 'Chứa ít nhất 1 chữ thường',
      check: /[a-z]/.test(watchedNewPassword ?? '')
    },
    { label: 'Chứa ít nhất 1 số', check: /\d/.test(watchedNewPassword ?? '') },
    {
      label: 'Chứa ký tự đặc biệt (!@#$...)',
      check: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(watchedNewPassword ?? '')
    }
  ]

  return (
    <motion.div
      className='rounded-md bg-white dark:bg-slate-800 px-2 pb-10 shadow md:px-7 md:pb-20'
      initial={reducedMotion ? undefined : { opacity: 0, y: 15 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Tiêu đề */}
      <motion.div
        className='border-b border-b-gray-100 dark:border-b-slate-600 py-6 text-center sm:text-left'
        initial={reducedMotion ? undefined : { opacity: 0, x: -10 }}
        animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className='flex items-center justify-center sm:justify-start gap-3'>
          {/* Shield Lock Icon */}
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange/10 dark:bg-orange-400/10'>
            <svg
              className='h-5 w-5 text-orange dark:text-orange-400'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth={1.5}
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z'
              />
            </svg>
          </div>
          <div>
            <h1 className='text-lg font-medium capitalize text-gray-700 dark:text-gray-200'>Đổi mật khẩu</h1>
            <div className='mt-[0.1875rem] text-[.875rem] text-gray-500 dark:text-gray-400'>
              Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
            </div>
          </div>
        </div>
        {/* Gradient accent line */}
        <div className='mt-4 h-0.5 bg-gradient-to-r from-orange/60 via-orange/20 to-transparent dark:from-orange-400/50 dark:via-orange-400/10 dark:to-transparent' />
      </motion.div>
      {/* Form mật khẩu */}
      <form className='mt-8 flex flex-col-reverse md:flex-row md:items-start' onSubmit={onSubmit}>
        {/* Left: Form fields */}
        <motion.div
          className='mt-6 flex-grow md:mt-0 md:pr-12'
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* flex-wrap đừng cho nó rớt ra bên ngoài */}
          {/* Mật khẩu cũ */}
          <motion.div
            className='mt-2 flex flex-col flex-wrap sm:flex-row'
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className='text-gray-500 dark:text-gray-400 truncate pt-3 capitalize sm:w-[30%] sm:text-right'>
              <span className='inline-flex items-center gap-1.5'>
                <svg
                  className='h-4 w-4 text-gray-400 dark:text-gray-500'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={1.5}
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z'
                  />
                </svg>
                <span>Mật khẩu cũ</span>
              </span>
            </div>
            <div className='sm:w-[70%] sm:pl-5'>
              <Input
                register={register}
                name='password'
                type='password'
                errorMessage={errors.password?.message}
                autoComplete='on'
                classNameInput='w-full rounded-sm border border-gray-300 dark:border-slate-600 px-3 py-2 shadow-sm outline-none focus:border-gray-500 dark:focus:border-gray-400 dark:bg-slate-900 dark:text-gray-100'
                className='relative'
              />
            </div>
          </motion.div>
          {/* Mật khẩu mới */}
          <motion.div
            className='mt-2 flex flex-col flex-wrap sm:flex-row'
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <div className='text-gray-500 dark:text-gray-400 truncate pt-3 capitalize sm:w-[30%] sm:text-right'>
              <span className='inline-flex items-center gap-1.5'>
                <svg
                  className='h-4 w-4 text-gray-400 dark:text-gray-500'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={1.5}
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z'
                  />
                </svg>
                <span>Mật khẩu mới</span>
              </span>
            </div>
            <div className='sm:w-[70%] sm:pl-5'>
              <Input
                register={register}
                name='new_password'
                type='password'
                errorMessage={errors.new_password?.message}
                autoComplete='on'
                classNameInput='w-full rounded-sm border border-gray-300 dark:border-slate-600 px-3 py-2 shadow-sm outline-none focus:border-gray-500 dark:focus:border-gray-400 dark:bg-slate-900 dark:text-gray-100'
                className='relative'
              />
            </div>
          </motion.div>
          {/* Nhập lại mật khẩu mới */}
          <motion.div
            className='mt-2 flex flex-col flex-wrap sm:flex-row'
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <div className='text-gray-500 dark:text-gray-400 truncate pt-3 capitalize sm:w-[30%] sm:text-right'>
              <span className='inline-flex items-center gap-1.5'>
                <svg
                  className='h-4 w-4 text-gray-400 dark:text-gray-500'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={1.5}
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
                  />
                </svg>
                <span>Nhập lại mật khẩu mới</span>
              </span>
            </div>
            <div className='sm:w-[70%] sm:pl-5'>
              <Input
                register={register}
                name='confirm_password'
                type='password'
                errorMessage={errors.confirm_password?.message}
                autoComplete='on'
                classNameInput='w-full rounded-sm border border-gray-300 dark:border-slate-600 px-3 py-2 shadow-sm outline-none focus:border-gray-500 dark:focus:border-gray-400 dark:bg-slate-900 dark:text-gray-100'
                className='relative'
              />
              <PasswordStrengthMeter password={watchedNewPassword ?? ''} className='mt-2' />
            </div>
          </motion.div>
          {/* button lưu thay đổi */}
          <motion.div
            className='mt-5 flex flex-col flex-wrap sm:flex-row'
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            <div className='truncate pt-3 capitalize sm:w-[30%] sm:text-right' />
            <div className='w-[100%] sm:w-[70%] sm:pl-5'>
              <Button
                type='submit'
                variant='primary'
                size='md'
                isLoading={updateProfileMutation.isPending}
                className='flex h-11 min-w-[140px] items-center justify-center rounded-md px-8 text-sm font-medium shadow-sm hover:shadow-md transition-shadow'
              >
                {updateProfileMutation.isPending ? 'Đang xử lý...' : 'Xác Nhận'}
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Security Tips Card */}
        <motion.div
          className='md:w-[320px] flex-shrink-0 mb-6 md:mb-0'
          initial={reducedMotion ? undefined : { opacity: 0, x: 10 }}
          animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className='rounded-lg border border-blue-100 dark:border-slate-600 bg-blue-50/50 dark:bg-slate-700/50 p-5'>
            <div className='flex items-center gap-2 mb-3'>
              <svg
                className='h-5 w-5 text-blue-500 dark:text-blue-400'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={1.5}
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
                />
              </svg>
              <h3 className='text-sm font-semibold text-blue-700 dark:text-blue-300'>Yêu cầu mật khẩu</h3>
            </div>
            <ul className='space-y-2 text-xs text-gray-600 dark:text-gray-300' aria-label='Danh sách yêu cầu mật khẩu'>
              {passwordRequirements.map((req, index) => (
                <li
                  key={index}
                  className='flex items-center gap-2'
                  aria-label={`${req.label}: ${req.check ? 'Đã đạt' : 'Chưa đạt'}`}
                >
                  {req.check ? (
                    <svg
                      className='h-3.5 w-3.5 text-green-500 dark:text-green-400 flex-shrink-0'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth={2}
                      aria-hidden='true'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 12.75l6 6 9-13.5' />
                    </svg>
                  ) : (
                    <svg
                      className='h-3.5 w-3.5 text-gray-300 dark:text-gray-500 flex-shrink-0'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth={2}
                      aria-hidden='true'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v12m6-6H6' />
                    </svg>
                  )}
                  <span className={req.check ? 'text-green-600 dark:text-green-400 line-through opacity-70' : ''}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
            {/* Security tip */}
            <div className='mt-4 pt-3 border-t border-blue-100 dark:border-slate-600'>
              <p className='text-xs text-gray-500 dark:text-gray-400 italic'>
                💡 Mẹo: Sử dụng mật khẩu khác nhau cho mỗi tài khoản để tăng cường bảo mật.
              </p>
            </div>
          </div>
        </motion.div>
      </form>
    </motion.div>
  )
}

export default ChangePassword
