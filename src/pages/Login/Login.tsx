import React, { useEffect, useMemo, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { yupResolver } from '@hookform/resolvers/yup'

import { toast } from 'react-toastify'
import Input from 'src/components/Input'
import { LoginSchema, getRules, loginSchema } from 'src/utils/rules'
import authApi from 'src/apis/auth.api'
import { generateNameId, isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponseApi } from 'src/types/utils.type'
import { AppContext } from 'src/contexts/app.context'
import Button from 'src/components/Button'
import path from 'src/constant/path'
import classNames from 'classnames'
import { Helmet } from 'react-helmet-async'

type FormData = LoginSchema

const Login = () => {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()
  // console.log(location)

  const purchaseIdFromLocation = useMemo(
    () => (location.state as { purchaseId: string } | null)?.purchaseId,
    [location]
  )
  const purchaseNameFromLocation = useMemo(
    () => (location.state as { purchaseName: string } | null)?.purchaseName,
    [location]
  )
  // console.log('CHOOSENPURCHASEHREF FROM LOCATION', choosenPurchaseHrefFromLocation)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    getValues, // lấy ra giá trị của mỗi ô input trong react hook form
    formState: { errors }
  } = useForm<FormData>({
    mode: 'onTouched',
    resolver: yupResolver(loginSchema)
  }) // return cho chúng ta một cái object
  // const rules = getRules(getValues)

  const watchEmail = watch('email', '')
  const watchPassword = watch('password', '')

  const loginAccountMutation = useMutation({
    mutationFn: (body: FormData) => authApi.loginAccount(body),
    onSuccess: () => {
      toast.success('Đăng nhập thành công', { autoClose: 1000 })
    },
    onError: () => {
      toast.error('Đăng nhập thất bại', { autoClose: 1000 })
    }
  })

  // data chính là giá trị trả ra khi mà onSubmit thành công
  const onSubmit = handleSubmit((data) => {
    // handleSubmit return về một callback
    // console.log(data)
    loginAccountMutation.mutate(data, {
      // data onSuccess là object do sv trả về
      onSuccess: (data) => {
        // console.log(data) // data đầu tiên là axiosRes trả về, data thứ 2 là Successapi sv trả về
        setIsAuthenticated(true)
        setProfile(data.data.data.user)
        navigate(
          purchaseIdFromLocation
            ? `${path.home}${generateNameId({
                name: purchaseNameFromLocation as string,
                id: purchaseIdFromLocation
              })}`
            : '/'
        )
      },
      onError: (error) => {
        //  isAxiosUn...<truyền vào kiểu type của data khi api lỗi>
        if (isAxiosUnprocessableEntityError<ErrorResponseApi<FormData>>(error)) {
          const formError = error.response?.data.data
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key as keyof FormData],
                type: 'Server'
              })
            })
          }
        }
        // console.log(error)
      }
    })
  })

  // Viết các hàm sau cho có thể tái sử dụng được

  useEffect(() => {
    return () => {
      history.replaceState(null, '') // hàm history.replaceState là hàm có sẵn ở trên trình duyệt
    }
  }, [])

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
        <title>Đăng nhập | Shopee Clone</title>
        <meta name='description' content='Đăng nhập vào dự án Shopee Clone' />
      </Helmet>
      <div className='container' style={{ height: '773.94px' }}>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-32 lg:pr-10'>
          <div className='mt-10 lg:col-span-2 lg:col-start-4'>
            <form className='rounded bg-white p-10 shadow-sm' onSubmit={onSubmit} noValidate>
              <div className='text-2xl'>Đăng nhập</div>
              {/* Nên cho 1 cái  thẻ div bao bọc bên ngoài để handle lỗi cho dễ */}
              {/*  Input ở đây truyền hay không truyền generic type đều được, nếu mà không truyền generic type thì xóa register đi thì nó sẽ không gợi ý nữa */}
              <Input
                className='relative mt-6'
                classNameInput={classNames(
                  'w-full rounded-md border border-gray-300 p-3 shadow-sm outline-none focus:border-gray-500',
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
              <Input<FormData>
                className='relative mt-2'
                classNameInput={classNames(
                  'w-full rounded-md border border-gray-300 p-3 shadow-sm outline-none focus:border-gray-500',
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

              <div className='mt-2'>
                <Button
                  // data-testid='button-element'
                  // role='button'
                  isLoading={loginAccountMutation.isLoading}
                  disabled={loginAccountMutation.isLoading}
                  type='submit'
                  className='flex w-full items-center justify-center bg-red-500 py-4 px-2 text-center text-sm uppercase text-white hover:bg-red-600'
                >
                  đăng nhập
                </Button>
              </div>

              <div className='mt-6 flex items-center justify-center text-center'>
                <span className='mr-1' style={{ color: 'rgba(0,0,0,.26)' }}>
                  Bạn mới biết đến Shopee?
                </span>
                <Link to={path.register} className='' style={{ color: '#ee4d2d' }}>
                  <span className=''>Đăng ký</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
