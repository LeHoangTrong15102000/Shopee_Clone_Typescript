import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import userApi, { BodyUpdateProfile } from 'src/apis/user.api'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import InputNumber from 'src/components/InputNumber'
import { User } from 'src/types/user.type'
import { UserSchema, userSchema } from 'src/utils/rules'
import DateSelect from '../../components/DateSelect'

// Khai báo 1 cái type là FormData để khi mà gửi api thay đổi thông tin
type FormData = Pick<UserSchema, 'name' | 'address' | 'phone' | 'date_of_birth' | 'avatar'>

const profileSchema = userSchema.pick(['name', 'address', 'phone', 'date_of_birth', 'avatar']) // Dùng cho yup.resolvers rồi

const Profile = () => {
  // Khai báo useForm
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      date_of_birth: new Date(1990, 0, 1), // giá trị khởi tạo là Date() nên khởi tọa theo như vậy
      avatar: ''
    },
    resolver: yupResolver(profileSchema) // để profileSchema vào
  })
  // useQuery để lấy ra cái getProfile
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile()
  })
  const profile = profileData?.data.data

  // Sử dụng useEffect() để đổ dữ liệu vào formProfile
  useEffect(() => {
    // set lại cái value cho thằng form
    if (profile) {
      setValue('name', profile.name)
      setValue('address', profile.address)
      setValue('phone', profile.phone)
      setValue('avatar', profile.avatar)
      setValue('date_of_birth', profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(1990, 0, 1)) // date_of_birth nó sẽ có định dạng string kiểu ISO8601, tại vì ban đầu khi tạo tài khoản thì nó chưa có thuộc tính date_of_birth
    }
  }, [profile, setValue])

  // Khai báo 1 cái mutation update
  const updateProfileMutation = useMutation({
    mutationFn: (body: BodyUpdateProfile) => userApi.updateProfile(body)
  })

  // Func Submit xử lý lưu thông tin User
  // Khi mà Submit cái form sẽ nhận được dữ liệu từ Form
  const onSubmit = handleSubmit(async (data) => {
    // Muốn xử lý những cái sự kiện sau cái update này thì dùng await
    console.log(data)
    // await updateProfileMutation.mutateAsync()
  })

  return (
    <div className='rounded-md bg-white px-2 pb-10 shadow md:px-7 md:pb-20'>
      {/* Tiêu đề */}
      <div className='border-b border-b-gray-100 py-6 text-center sm:text-left'>
        <h1 className='text-lg font-medium capitalize text-gray-700'>Hồ sơ của tôi</h1>
        <div className='mt-[0.1875rem] text-[.875rem]'>Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
      </div>
      {/* Form và Avatar */}
      <form className='mt-8 flex flex-col-reverse md:flex-row md:items-start' onSubmit={onSubmit}>
        {/* Form */}
        <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
          {/* flex-wrap đừng cho nó rớt ra bên ngoài */}
          {/* Tên đăng nhập */}
          {/* Email */}
          <div className='flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Email</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <div className='pt-3 text-gray-500'>{profile?.email}</div>
            </div>
          </div>
          {/* Tên */}
          <div className='mt-6 flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Tên</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                register={register}
                name='name'
                placeholder='Tên'
                errorMessage={errors.name?.message}
                autoComplete='on'
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-gray-500'
              />
            </div>
          </div>
          {/* Số điện thoại */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[20%] sm:text-right'>
              Số điện thoại
            </div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Controller
                control={control}
                name='phone'
                render={({ field }) => {
                  return (
                    <InputNumber
                      type='text'
                      className='grow'
                      placeholder='Số điện thoại'
                      errorMessage={errors.phone?.message}
                      classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-gray-500'
                      {...field}
                      onChange={(event) => field.onChange(event)}
                    />
                  )
                }}
              />
            </div>
          </div>
          {/* Địa chỉ */}
          <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[20%] sm:text-right'>Địa chỉ</div>
            <div className='sm:w-[80%] sm:pl-5'>
              <Input
                register={register}
                name='address'
                placeholder='Địa chỉ'
                errorMessage={errors.address?.message}
                autoComplete='on'
                classNameInput='w-full rounded-sm border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-gray-500'
              />
            </div>
          </div>
          {/* Ngày sinh, Nên cho thằng thành 1 cái component */}
          <Controller
            control={control}
            name='date_of_birth'
            render={({ field }) => {
              // Trong cái {...field} đã có value={field.value} rồi
              return (
                <DateSelect
                  errorMessage={errors.date_of_birth?.message}
                  // Khi mà thằng profile.date_of_birth có giá trị thì nó sẽ truyền vào cho thằng field để xuất ra giá trị cho thằng value
                  // Do giá trị bên ngoài ban đầu có nên nó sẽ lấy giá trị b ên ngoài để hiện ra date_of_birth(render lần đầu khi mà Component chạy)
                  value={field.value}
                  onChange={field.onChange}
                />
              )
            }}
          />

          {/* button lưu thay đổi */}
          <div className='mt-7 flex flex-col flex-wrap sm:flex-row'>
            <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[20%] sm:text-right' />
            <div className='w-[100%] sm:w-[80%] sm:pl-5'>
              <Button
                type='submit'
                className='hover:bg[#ee4d2d]/70 flex h-10 min-w-[70px] max-w-[220px] items-center justify-center rounded-sm bg-[#ee4d2d] px-5 text-center text-sm text-white'
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
        {/* Avatar */}
        <div className='flex items-center justify-center md:w-72 md:border-l md:border-l-gray-100'>
          {/* flex-col cho nó dàn hàng ngang */}
          <div className='flex flex-col items-center'>
            {/* Avatar */}
            <div className='my-5 h-[105px] w-[105px] flex-shrink-0 overflow-hidden rounded-full border border-black/10'>
              <img
                src='https://down-vn.img.susercontent.com/file/b34a1e6b65aaa8ba6474c7886dc59df2_tn'
                alt='Avatar'
                className='h-full w-full object-cover'
              />
            </div>
            {/* Input file */}
            <input type='file' className='hidden' accept='.jpg,.jpeg,.png' />
            <button
              type='button'
              className='m-w-[70px] flex h-10 items-center justify-center rounded-sm border bg-white px-[20px] capitalize text-[#555] outline-none'
            >
              chọn ảnh
            </button>
            <div className='mt-2'>
              <div className='text-[0.875rem] text-[#999]'>Dung lượng file tối đa 1 MB</div>
              <div className='text-[0.875rem] text-[#999]'>Định dạng:.JPEG,.PNG</div>
              <div></div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Profile
