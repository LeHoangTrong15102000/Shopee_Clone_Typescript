import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Input from 'src/components/Input'
import Button from 'src/components/Button'
import path from 'src/constant/path'
import passwordResetApi from 'src/apis/password-reset.api'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { staggerContainer, staggerItem, STAGGER_DELAY } from 'src/styles/animations'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

type FormData = z.infer<typeof resetPasswordSchema>

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [isSuccess, setIsSuccess] = useState(false)
  const reducedMotion = useReducedMotion()
  const containerVariants = staggerContainer(STAGGER_DELAY.normal)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    mode: 'onTouched',
    resolver: zodResolver(resetPasswordSchema)
  })

  const watchPassword = watch('password', '')
  const watchConfirmPassword = watch('confirmPassword', '')

  const resetPasswordMutation = useMutation({
    mutationFn: (body: FormData) => passwordResetApi.resetPassword(token!, body.password, body.confirmPassword)
  })

  const onSubmit = handleSubmit((data) => {
    if (!token) return
    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        setIsSuccess(true)
        toast.success('Đặt lại mật khẩu thành công', { autoClose: 3000 })
      },
      onError: () => {
        toast.error('Có lỗi xảy ra, vui lòng thử lại', { autoClose: 2000 })
      }
    })
  })

  // Redirect to login after 3 seconds on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate(path.login)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate])

  return (
    <div className='relative bg-orange'>
      <div
        className='absolute inset-0 hidden lg:block'
        style={{
          backgroundImage: 'url(https://cf.shopee.vn/file/sg-11134004-23020-75qwyq2a7snv15)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center center'
        }}
      />
      <Helmet>
        <title>Đặt lại mật khẩu | Shopee Clone</title>
        <meta name='description' content='Đặt lại mật khẩu - Shopee Clone' />
      </Helmet>
      <div className='relative container min-h-[60vh] lg:min-h-[773.94px]'>
        <div className='grid grid-cols-1 py-8 md:grid-cols-3 md:py-16 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='mt-10 md:col-span-3 md:mx-auto md:w-full md:max-w-md lg:col-span-2 lg:col-start-4 lg:mx-0 lg:max-w-none'>
            <motion.div
              className='rounded-sm bg-white p-10 shadow-xs dark:bg-slate-800 dark:shadow-slate-900/50'
              variants={reducedMotion ? undefined : containerVariants}
              initial={reducedMotion ? undefined : 'hidden'}
              animate={reducedMotion ? undefined : 'visible'}
            >
              {!token ? (
                <div className='text-center'>
                  <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
                    <svg className='h-8 w-8 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                    Link đặt lại mật khẩu không hợp lệ
                  </h3>
                  <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                    Link đã hết hạn hoặc không hợp lệ
                  </p>
                  <div className='mt-6'>
                    <Link to={path.forgotPassword} className='text-sm text-orange dark:text-orange-400'>
                      Yêu cầu đặt lại mật khẩu mới
                    </Link>
                  </div>
                </div>
              ) : isSuccess ? (
                <motion.div
                  initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
                  animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  className='text-center'
                >
                  <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                    <svg className='h-8 w-8 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                    Đặt lại mật khẩu thành công
                  </h3>
                  <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                    Đang chuyển hướng đến trang đăng nhập...
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <motion.div variants={reducedMotion ? undefined : staggerItem}>
                    <div className='text-2xl text-gray-900 dark:text-gray-100'>Đặt lại mật khẩu</div>
                  </motion.div>

                  <motion.div variants={reducedMotion ? undefined : staggerItem}>
                    <Input
                      className='relative mt-6'
                      classNameInput='w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-3 shadow-xs dark:shadow-slate-900/30 outline-hidden focus:border-gray-500 dark:focus:border-slate-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500'
                      type='password'
                      name='password'
                      value={watchPassword}
                      autoComplete='new-password'
                      register={register}
                      placeholder='Mật khẩu mới'
                      errorMessage={errors.password?.message}
                    />
                  </motion.div>

                  <motion.div variants={reducedMotion ? undefined : staggerItem}>
                    <Input
                      className='relative mt-2'
                      classNameInput='w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-3 shadow-xs dark:shadow-slate-900/30 outline-hidden focus:border-gray-500 dark:focus:border-slate-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500'
                      type='password'
                      name='confirmPassword'
                      value={watchConfirmPassword}
                      autoComplete='new-password'
                      register={register}
                      placeholder='Xác nhận mật khẩu'
                      errorMessage={errors.confirmPassword?.message}
                    />
                  </motion.div>

                  <motion.div variants={reducedMotion ? undefined : staggerItem}>
                    <div className='mt-4'>
                      <Button
                        isLoading={resetPasswordMutation.isPending}
                        disabled={resetPasswordMutation.isPending}
                        type='submit'
                        className='flex w-full items-center justify-center bg-red-500 px-2 py-4 text-center text-sm text-white uppercase hover:bg-red-600'
                      >
                        Đặt lại mật khẩu
                      </Button>
                    </div>
                  </motion.div>

                  <motion.div variants={reducedMotion ? undefined : staggerItem}>
                    <div className='mt-6 text-center'>
                      <Link to={path.login} className='text-sm text-orange dark:text-orange-400'>
                        Quay lại đăng nhập
                      </Link>
                    </div>
                  </motion.div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

