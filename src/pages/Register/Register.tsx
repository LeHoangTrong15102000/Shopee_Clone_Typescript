import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import omit from 'lodash/omit'
import { motion } from 'framer-motion'
import { Schema, registerSchema } from 'src/utils/rules'
import Input from 'src/components/Input'
import PasswordStrengthMeter from 'src/components/PasswordStrengthMeter'
import authApi from 'src/apis/auth.api'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponseApi } from 'src/types/utils.type'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import Button from 'src/components/Button'
import path from 'src/constant/path'
import classNames from 'classnames'
import { Helmet } from 'react-helmet-async'
import { useReducedMotion } from 'src/hooks/useReducedMotion'
import { staggerContainer, staggerItem, STAGGER_DELAY } from 'src/styles/animations'

type FormData = Schema
// co ra sau thì ra chứ t vẫn đứng ở đây mà thôi có gì mà đâu mà phải sợ

const Register = () => {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()
  const {
    register, // Dùng register để cung cấp thông tin cho react-hook-form, {...register('truyền cho nó 1 cái name chính là key của chúng ta')}
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    mode: 'onTouched',
    resolver: zodResolver(registerSchema)
  }) // return cho chúng ta một cái object, truyền genericType chung cho useForm
  // Tạo một cái rules handle việc validate form

  const watchEmail = watch('email', '')
  const watchPassword = watch('password', '')
  const watchConfirmPassword = watch('confirm_password', '')

  const reducedMotion = useReducedMotion()
  const containerVariants = staggerContainer(STAGGER_DELAY.normal)

  const registerAccountMutation = useMutation({
    mutationFn: (body: Omit<FormData, 'confirm_password'>) => authApi.registerAccount(body),
    onSuccess: (_) => {
      toast.success('Đăng ký thành công', { autoClose: 1000 })
    },
    onError: () => {
      toast.error('Đăng ký thất bại', { autoClose: 1000 })
    }
  })

  // func handleSubmit nó sẽ không chạy khi mà cái formState chúng ta không đúng
  const onSubmit = handleSubmit((data) => {
    // confirm_password chỉ thực hiện validate ở FE mà thôi còn lên trên server thì không cần
    const body = omit(data, ['confirm_password'])
    registerAccountMutation.mutate(body as any, {
      onSuccess: (data) => {
        // console.log(data)
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
        navigate('/')
      },
      onError: (error) => {
        // console.log('error', error)
        if (isAxiosUnprocessableEntityError<ErrorResponseApi<Omit<FormData, 'confirm_password'>>>(error)) {
          // Lấy lỗi và set vào RHF setError
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              // Ép kiểu cho key luôn
              setError(key as keyof Omit<FormData, 'confirm_password'>, {
                message: formError[key as keyof Omit<FormData, 'confirm_password'>],
                type: 'Server'
              })
            })
          }
          // if (formError?.email) {
          //   setError('email', {
          //     message: formError.email,
          //     type: 'Server'
          //   })
          // }
          // if (formError?.password) {
          //   setError('password', {
          //     message: formError.password,
          //     type: 'Server'
          //   })
          // }
        }
      }
    })
  })

  return (
    <div
      className='bg-orange'
      style={{
        backgroundImage: 'url(https://cf.shopee.vn/file/sg-11134004-23020-75qwyq2a7snv15)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center center'
      }}
    >
      <Helmet>
        <title>Đăng ký | Shopee Clone</title>
        <meta name='description' content='Đăng ký tài khoản vào dự án Shopee Clone' />
      </Helmet>
      <div className='container min-h-[60vh]'>
        <div className='grid grid-cols-1 py-8 md:grid-cols-3 md:py-16 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <motion.form
              className='rounded bg-white dark:bg-slate-800 p-10 shadow-sm dark:shadow-slate-900/50'
              onSubmit={onSubmit}
              noValidate
              variants={reducedMotion ? undefined : containerVariants}
              initial={reducedMotion ? undefined : 'hidden'}
              animate={reducedMotion ? undefined : 'visible'}
            >
              <motion.div variants={reducedMotion ? undefined : staggerItem}>
                <div className='text-2xl text-gray-900 dark:text-gray-100'>Đăng ký</div>
              </motion.div>
              <motion.div variants={reducedMotion ? undefined : staggerItem}>
                <Input
                  className='relative mt-6'
                  classNameInput={classNames(
                    'w-full rounded-md border border-gray-300 dark:border-slate-600 p-3 shadow-sm dark:shadow-slate-900/30 outline-none focus:border-gray-500 dark:focus:border-slate-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
                    {
                      'border-red-500 focus:ring-1 focus:border-red-500 text-red-500 focus:ring-red-600':
                        errors.email && errors.email.message
                    }
                  )}
                  type='email'
                  name='email'
                  value={watchEmail}
                  autoComplete='on'
                  register={register}
                  placeholder='Email'
                  errorMessage={errors.email?.message}
                />
              </motion.div>
              <motion.div variants={reducedMotion ? undefined : staggerItem}>
                <Input
                  className='relative mt-2'
                  classNameInput={classNames(
                    'w-full rounded-md border border-gray-300 dark:border-slate-600 p-3 shadow-sm dark:shadow-slate-900/30 outline-none focus:border-gray-500 dark:focus:border-slate-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
                    {
                      'border-red-500 focus:ring-1 focus:border-red-500 text-red-500 focus:ring-red-600':
                        errors.password && errors.password.message
                    }
                  )}
                  type='password'
                  name='password'
                  value={watchPassword}
                  autoComplete='on'
                  register={register}
                  placeholder='Password'
                  errorMessage={errors.password?.message}
                />
                <PasswordStrengthMeter password={watchPassword} />
              </motion.div>
              <motion.div variants={reducedMotion ? undefined : staggerItem}>
                <Input
                  className='relative mt-2'
                  classNameInput={classNames(
                    'w-full rounded-md border border-gray-300 dark:border-slate-600 p-3 shadow-sm dark:shadow-slate-900/30 outline-none focus:border-gray-500 dark:focus:border-slate-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
                    {
                      'border-red-500 focus:ring-1 focus:border-red-500 text-red-500 focus:ring-red-600':
                        errors.confirm_password && errors.confirm_password.message
                    }
                  )}
                  type='password'
                  name='confirm_password'
                  value={watchConfirmPassword}
                  autoComplete='on'
                  register={register}
                  placeholder='Confirm Password'
                  errorMessage={errors.confirm_password?.message}
                />
              </motion.div>
              {/* Nên cho 1 cái  thẻ div bao bọc bên ngoài để handle lỗi cho dễ */}

              <motion.div variants={reducedMotion ? undefined : staggerItem}>
                <div className='mt-2'>
                  <Button
                    isLoading={registerAccountMutation.isPending}
                    disabled={registerAccountMutation.isPending}
                    type='submit'
                    className='flex w-full items-center justify-center bg-red-500 py-4 px-2 text-sm uppercase text-white hover:bg-red-600'
                  >
                    đăng ký
                  </Button>
                </div>
              </motion.div>
              <motion.div variants={reducedMotion ? undefined : staggerItem}>
                <div className='mt-6 flex flex-col items-center justify-center text-[13px] text-gray-700 dark:text-gray-300'>
                  <div className='px-3'>Bằng việc đăng kí, bạn đã đồng ý với Shopee về</div>
                  <div>
                    <Link to={path.home} className='text-orange dark:text-orange-400'>
                      Điều khoản dịch vụ
                    </Link>{' '}
                    &{' '}
                    <Link to={path.home} className='text-orange dark:text-orange-400'>
                      Chính sách bảo mật
                    </Link>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={reducedMotion ? undefined : staggerItem}>
                <div className='mt-6 flex items-center justify-center text-center'>
                  <span className='mr-1 text-black/25 dark:text-gray-400'>Bạn đã có tài khoản?</span>
                  <Link to={path.login} className='text-orange dark:text-orange-400'>
                    <span className=''>Đăng nhập</span>
                  </Link>
                </div>
              </motion.div>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
