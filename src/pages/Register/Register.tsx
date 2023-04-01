import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import _ from 'lodash'
import { getRules, schema, Schema, registerSchema } from 'src/utils/rules'
import Input from 'src/components/Input'
import authApi from 'src/apis/auth.api'
import { isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponseApi } from 'src/types/utils.type'
import { useContext } from 'react'
import { AppContext } from 'src/contexts/app.context'
import Button from 'src/components/Button'
import path from 'src/constant/path'

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
    getValues,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema)
  }) // return cho chúng ta một cái object, truyền genericType chung cho useForm
  // Tạo một cái rules handle việc validate form

  const registerAccountMutation = useMutation({
    mutationFn: (body: Omit<FormData, 'confirm_password'>) => authApi.registerAccount(body),
    onSuccess: (data) => {
      toast.success('Đăng ký thành công')
    },
    onError: () => {
      toast.error('Đăng ký thất bại')
    }
  })

  // func handleSubmit nó sẽ không chạy khi mà cái formState chúng ta không đúng
  const onSubmit = handleSubmit((data) => {
    const body = _.omit(data, ['confirm_password'])
    registerAccountMutation.mutate(body, {
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
      <div className='container'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <form className='rounded bg-white p-10 shadow-sm' onSubmit={onSubmit} noValidate>
              <div className='text-2xl'>Đăng ký</div>
              <Input
                className='mt-6'
                type='email'
                name='email'
                autoComplete='on'
                register={register}
                placeholder='Email'
                errorMessage={errors.email?.message}
              />
              <Input
                className='mt-2'
                type='password'
                name='password'
                autoComplete='on'
                register={register}
                placeholder='Password'
                errorMessage={errors.password?.message}
              />
              <Input
                className='mt-2'
                type='password'
                name='confirm_password'
                autoComplete='on'
                register={register}
                placeholder='Confirm Password'
                errorMessage={errors.confirm_password?.message}
              />
              {/* Nên cho 1 cái  thẻ div bao bọc bên ngoài để handle lỗi cho dễ */}

              <div className='mt-2'>
                <Button
                  isLoading={registerAccountMutation.isLoading}
                  disabled={registerAccountMutation.isLoading}
                  type='submit'
                  // style={{ backgroundColor: '#ee4d2d' }}
                  className='flex w-full items-center justify-center bg-red-500 py-4 px-2 text-sm uppercase text-white hover:bg-red-600'
                >
                  đăng ký
                </Button>
              </div>
              <div className='mt-6 flex flex-col items-center justify-center' style={{ fontSize: '13px' }}>
                <div className='px-3'>Bằng việc đăng kí, bạn đã đồng ý với Shopee về</div>
                <div>
                  <Link to={path.home} style={{ color: '#ee4d2d' }}>
                    Điều khoản dịch vụ
                  </Link>{' '}
                  &{' '}
                  <Link to={path.home} style={{ color: '#ee4d2d' }}>
                    Chính sách bảo mật
                  </Link>
                </div>
              </div>

              <div className='mt-6 flex items-center justify-center text-center'>
                <span className='mr-1' style={{ color: 'rgba(0,0,0,.26)' }}>
                  Bạn đã có tài khoản?
                </span>
                <Link to={path.login} className='' style={{ color: '#ee4d2d' }}>
                  <span className=''>Đăng nhập</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
