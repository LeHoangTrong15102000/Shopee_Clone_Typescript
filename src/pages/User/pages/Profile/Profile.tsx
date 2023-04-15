import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import { Controller, useForm, FormProvider, useFormContext } from 'react-hook-form'
import userApi, { BodyUpdateProfile } from 'src/apis/user.api'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import InputNumber from 'src/components/InputNumber'
import { User } from 'src/types/user.type'
import { UserSchema, userSchema } from 'src/utils/rules'
import DateSelect from '../../components/DateSelect'
import { toast } from 'react-toastify'
import { AppContext } from 'src/contexts/app.context'
import { setProfileToLS } from 'src/utils/auth'
import { getAvatarUrl, isAxiosUnprocessableEntityError } from 'src/utils/utils'
import { ErrorResponseApi } from 'src/types/utils.type'
import InputFile from 'src/components/InputFile'

// Khai báo 1 cái component Info
function Info() {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<FormData>()
  return (
    <Fragment>
      {/* Tên */}
      <div className='mt-6 flex flex-col flex-wrap sm:flex-row'>
        <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right'>Tên</div>
        <div className='sm:w-[70%] sm:pl-5'>
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
        <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right'>Số điện thoại</div>
        <div className='sm:w-[70%] sm:pl-5'>
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
    </Fragment>
  )
}

// Khai báo 1 cái type là FormData để khi mà gửi api thay đổi thông tin
type FormData = Pick<UserSchema, 'name' | 'address' | 'phone' | 'date_of_birth' | 'avatar'>
// Type FormError
type FormDataError = Omit<FormData, 'date_of_birth'> & {
  date_of_birth: string
}

const profileSchema = userSchema.pick(['name', 'address', 'phone', 'date_of_birth', 'avatar']) // Dùng cho yup.resolvers rồi
// URL.createObjectURL(file)

const Profile = () => {
  const { setProfile } = useContext(AppContext)
  const [file, setFile] = useState<File>()
  // file này ban đầu không có giá trị gì hết
  const queryClient = useQueryClient()

  const previewImage = useMemo(() => {
    // Nếu mà có cái file thì gọi đến
    return file ? URL.createObjectURL(file) : ''
  }, [file])

  // Khai báo useForm
  const methods = useForm<FormData>({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      date_of_birth: new Date(1990, 0, 1), // giá trị khởi tạo là Date() nên khởi tọa theo như vậy
      avatar: ''
    },
    resolver: yupResolver(profileSchema) // để profileSchema vào
  })
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { errors }
  } = methods
  // theo dõi giá trị của Avatar mỗi lần changed
  const avatar = watch('avatar') // dùng watch() theo dõi giá trị của Avatar

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

  // uploadAvatar
  const uploadAvatarMutation = useMutation({
    mutationFn: userApi.uploadAvatar
  })

  // Func HandleChange File và truyền xuống cho component InputFile
  const handleChangeFile = (file?: File) => {
    setFile(file)
  }

  // Func Submit xử lý lưu thông tin User
  // Khi mà Submit cái form sẽ nhận được dữ liệu từ Form, Do chung 1 cái handleSubmit
  const onSubmit = handleSubmit(async (data) => {
    // Muốn xử lý những cái sự kiện sau cái update này thì dùng await
    try {
      // Khai báo 1 cái giá trị avatarName để khi mà người dùng có thay đổi avatar
      let avatarName = avatar
      if (file) {
        // Nếu như có file thì sẽ gửi lên cái FormData cho nó
        const formData = new FormData() // FormData là Api của js
        formData.append('image', file)
        const uploadRes = await uploadAvatarMutation.mutateAsync(formData) // Khi nhấn vào lưu thì sẽ nhận về được 1 cái đoạn string
        avatarName = uploadRes.data.data // lấy được tên bức ảnh do sv trả về, Sau khi đã chọn được bức ảnh
        setValue('avatar', avatarName) // Chỉ nên đưa cái name ảnh từ server trả về vào thuộc tính `avatar` của updateProfile
      }
      //  Res này khi mà gọi Api thành công thì nó sẽ trả lại Profile có đầy đủ thuộc tính được khai báo Type User
      const res = await updateProfileMutation.mutateAsync(
        // Sev cần file ảnh định dạng là ISOString nên chúng ta cần phải chuyển nó về ISOString
        { ...data, date_of_birth: data.date_of_birth?.toISOString(), avatar: avatarName },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
          }
        }
      )
      if (res) {
        // console.log(res.data.data)
        setProfile(res.data.data)
        setProfileToLS(res.data.data)
        toast.success(res.data?.message, { autoClose: 1000, position: 'top-center' })
      }
    } catch (error) {
      // Xử lý lỗi từ phía server
      if (isAxiosUnprocessableEntityError<ErrorResponseApi<FormDataError>>(error)) {
        // Lấy lỗi và set vào RHF setError
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            // Ép kiểu cho key luôn
            setError(key as keyof FormDataError, {
              message: formError[key as keyof FormDataError],
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
        <h1 className='text-lg font-medium capitalize text-gray-700'>Hồ sơ của tôi</h1>
        <div className='mt-[0.1875rem] text-[.875rem]'>Quản lý thông tin hồ sơ để bảo mật tài khoản</div>
      </div>
      {/* Form và Avatar */}
      <FormProvider {...methods}>
        <form className='mt-8 flex flex-col-reverse md:flex-row md:items-start' onSubmit={onSubmit}>
          {/* Form */}
          <div className='mt-6 flex-grow md:mt-0 md:pr-12'>
            {/* flex-wrap đừng cho nó rớt ra bên ngoài */}
            {/* Email */}
            <div className='flex flex-col flex-wrap sm:flex-row'>
              <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right'>Email</div>
              <div className='sm:w-[70%] sm:pl-5'>
                <div className='pt-3 text-gray-500'>{profile?.email}</div>
              </div>
            </div>
            {/* Tên đăng nhập */}
            <div className='mt-4 flex flex-col flex-wrap sm:flex-row'>
              <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right'>
                Tên đăng nhập
              </div>
              <div className='sm:w-[70%] sm:pl-5'>
                <div className='pt-3 text-gray-500'>{profile?.name}</div>
              </div>
            </div>
            {/* Info thông tin người dùng */}
            <Info />
            {/* Địa chỉ */}
            <div className='mt-2 flex flex-col flex-wrap sm:flex-row'>
              <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right'>Địa chỉ</div>
              <div className='sm:w-[70%] sm:pl-5'>
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
                    onChange={field.onChange} // khi nhận được cái value từ DateSelect xong rồi thằng field.value nó sẽ lấy ra giá trị mới
                  />
                )
              }}
            />

            {/* button lưu thay đổi */}
            <div className='mt-3 flex flex-col flex-wrap sm:flex-row'>
              <div className='text-[rgba(85,85,85, .6)] truncate pt-3 capitalize sm:w-[30%] sm:text-right' />
              <div className='w-[100%] sm:w-[70%] sm:pl-5'>
                <Button
                  type='submit'
                  className='flex h-10 min-w-[70px] max-w-[220px] items-center justify-center rounded-sm bg-[#ee4d2d] px-5 text-center text-sm text-white hover:bg-[#ee4d2d]/90'
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
              <div className='my-5 h-[115px] w-[115px] flex-shrink-0 overflow-hidden rounded-full border border-black/10'>
                <img
                  src={previewImage || getAvatarUrl(profile?.avatar)}
                  alt='Avatar'
                  className='h-full w-full object-cover'
                />
              </div>
              {/* Input file */}
              <InputFile onChange={(value) => handleChangeFile(value)} />
              <div className='mt-2'>
                <div className='text-[0.875rem] text-[#999]'>Dung lượng file tối đa 1 MB</div>
                <div className='text-[0.875rem] text-[#999]'>Định dạng:.JPEG,.PNG</div>
                <div></div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default Profile
