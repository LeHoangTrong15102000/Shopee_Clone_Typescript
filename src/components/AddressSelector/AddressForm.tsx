import { memo, useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Address, AddressFormData, AddressType } from 'src/types/checkout.type'
import addressApi from 'src/apis/address.api'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import {
  vietnamProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  streetSuggestions,
  District,
  Ward
} from 'src/data/vietnamLocations'

interface AddressFormProps {
  address: Address | null
  onClose: () => void
  onSuccess: () => void
}

const addressSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên').max(100, 'Họ tên tối đa 100 ký tự'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
  provinceId: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  districtId: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  wardId: z.string().min(1, 'Vui lòng chọn phường/xã'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  street: z.string().min(1, 'Vui lòng nhập địa chỉ cụ thể').max(200, 'Địa chỉ tối đa 200 ký tự'),
  addressType: z.enum(['home', 'office', 'other']),
  label: z.string().max(50, 'Nhãn tối đa 50 ký tự').optional().default(''),
  isDefault: z.boolean().optional()
})

const FORM_STEPS = [
  { id: 1, title: 'Liên hệ' },
  { id: 2, title: 'Địa chỉ' },
  { id: 3, title: 'Chi tiết' }
]

const ADDRESS_TYPE_OPTIONS: { value: AddressType; label: string; icon: React.ReactNode }[] = [
  {
    value: 'home',
    label: 'Nhà riêng',
    icon: (
      <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
      </svg>
    )
  },
  {
    value: 'office',
    label: 'Văn phòng',
    icon: (
      <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
        <path fillRule='evenodd' d='M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z' clipRule='evenodd' />
      </svg>
    )
  },
  {
    value: 'other',
    label: 'Khác',
    icon: (
      <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
        <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
      </svg>
    )
  }
]

const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 4) return cleaned
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`
}

const AddressForm = memo(function AddressForm({ address, onClose, onSuccess }: AddressFormProps) {
  const isEditing = !!address
  const [currentStep, setCurrentStep] = useState(1)
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false)
  const [isLoadingWards, setIsLoadingWards] = useState(false)
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false)
  const [filteredStreetSuggestions, setFilteredStreetSuggestions] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, touchedFields }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: 'onChange',
    defaultValues: address
      ? {
          fullName: address.fullName,
          phone: address.phone,
          province: address.province,
          provinceId: address.provinceId || '',
          district: address.district,
          districtId: address.districtId || '',
          ward: address.ward,
          wardId: address.wardId || '',
          street: address.street,
          addressType: address.addressType || 'home',
          label: address.label || '',
          isDefault: address.isDefault
        }
      : {
          fullName: '',
          phone: '',
          province: '',
          provinceId: '',
          district: '',
          districtId: '',
          ward: '',
          wardId: '',
          street: '',
          addressType: 'home',
          label: '',
          isDefault: false
        }
  })

  const watchedProvinceId = watch('provinceId')
  const watchedDistrictId = watch('districtId')
  const watchedStreet = watch('street')
  const watchedAddressType = watch('addressType')
  const watchedProvince = watch('province')
  const watchedDistrict = watch('district')
  const watchedWard = watch('ward')
  const watchedFullName = watch('fullName')
  const watchedPhone = watch('phone')

  // Load districts when province changes
  useEffect(() => {
    if (watchedProvinceId) {
      setIsLoadingDistricts(true)
      setTimeout(() => {
        const newDistricts = getDistrictsByProvince(watchedProvinceId)
        setDistricts(newDistricts)
        setIsLoadingDistricts(false)
        if (!isEditing) {
          setValue('districtId', '')
          setValue('district', '')
          setValue('wardId', '')
          setValue('ward', '')
          setWards([])
        }
      }, 300)
    }
  }, [watchedProvinceId, setValue, isEditing])

  // Load wards when district changes
  useEffect(() => {
    if (watchedProvinceId && watchedDistrictId) {
      setIsLoadingWards(true)
      setTimeout(() => {
        const newWards = getWardsByDistrict(watchedProvinceId, watchedDistrictId)
        setWards(newWards)
        setIsLoadingWards(false)
        if (!isEditing) {
          setValue('wardId', '')
          setValue('ward', '')
        }
      }, 300)
    }
  }, [watchedProvinceId, watchedDistrictId, setValue, isEditing])

  // Filter street suggestions
  useEffect(() => {
    if (watchedStreet && watchedStreet.length > 0) {
      const filtered = streetSuggestions.filter((s) =>
        s.toLowerCase().includes(watchedStreet.toLowerCase())
      )
      setFilteredStreetSuggestions(filtered.slice(0, 5))
    } else {
      setFilteredStreetSuggestions(streetSuggestions.slice(0, 5))
    }
  }, [watchedStreet])

  // Initialize districts and wards for editing
  useEffect(() => {
    if (isEditing && address?.provinceId) {
      const initialDistricts = getDistrictsByProvince(address.provinceId)
      setDistricts(initialDistricts)
      if (address.districtId) {
        const initialWards = getWardsByDistrict(address.provinceId, address.districtId)
        setWards(initialWards)
      }
    }
  }, [isEditing, address])

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value
    const province = vietnamProvinces.find((p) => p.id === provinceId)
    setValue('provinceId', provinceId)
    setValue('province', province?.name || '')
    trigger(['provinceId', 'province'])
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value
    const district = districts.find((d) => d.id === districtId)
    setValue('districtId', districtId)
    setValue('district', district?.name || '')
    trigger(['districtId', 'district'])
  }

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value
    const ward = wards.find((w) => w.id === wardId)
    setValue('wardId', wardId)
    setValue('ward', ward?.name || '')
    trigger(['wardId', 'ward'])
  }

  const handleStreetSelect = (street: string) => {
    setValue('street', street)
    setShowStreetSuggestions(false)
    trigger('street')
  }

  const handleTypeSelect = (type: AddressType) => {
    setValue('addressType', type)
    if (type !== 'other') {
      setValue('label', '')
    }
  }

  const addressPreview = [watchedStreet, watchedWard, watchedDistrict, watchedProvince].filter(Boolean).join(', ')

  let stepProgress = 0
  if (watchedFullName && watchedPhone && !errors.fullName && !errors.phone) stepProgress = 1
  if (stepProgress === 1 && watchedProvince && watchedDistrict && watchedWard) stepProgress = 2
  if (stepProgress === 2 && watchedStreet && watchedAddressType) stepProgress = 3

  const canProceedToStep = (step: number) => {
    if (step === 1) return true
    if (step === 2) return watchedFullName && watchedPhone && !errors.fullName && !errors.phone
    if (step === 3) return stepProgress >= 2
    return false
  }

  const createMutation = useMutation({
    mutationFn: (data: AddressFormData) => addressApi.createAddress(data),
    onSuccess: () => {
      onSuccess()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: AddressFormData) => addressApi.updateAddress(address!._id, data),
    onSuccess: () => {
      onSuccess()
    }
  })

  const onSubmit = (data: AddressFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className='my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black/5 dark:ring-white/10'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className='relative bg-gradient-to-r from-orange to-orange/80 px-6 py-5'>
          <div className='absolute inset-0 bg-white/5' style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' }} />
          <div className='relative flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                <svg className='h-5 w-5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                  <path strokeLinecap='round' strokeLinejoin='round' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                </svg>
              </div>
              <div>
                <h3 className='text-xl font-bold text-white'>
                  {isEditing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                </h3>
                <p className='text-sm text-white/80'>Điền thông tin giao hàng của bạn</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-105'
              aria-label='Đóng'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Indicator - Enhanced UI */}
        <div className='border-b border-gray-100 dark:border-slate-700 bg-gradient-to-b from-gray-50/80 dark:from-slate-700/50 to-white dark:to-slate-800 px-4 sm:px-6 py-5 sm:py-6'>
          <div className='flex items-center justify-center'>
            {FORM_STEPS.map((step, index) => {
              const isCompleted = stepProgress >= step.id && currentStep !== step.id
              const isCurrent = currentStep === step.id
              const canClick = canProceedToStep(step.id)

              return (
                <div key={step.id} className='flex items-center'>
                  {/* Step Circle & Label */}
                  <button
                    type='button'
                    onClick={() => canClick && setCurrentStep(step.id)}
                    disabled={!canClick}
                    className='group flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/50 focus-visible:ring-offset-2 rounded-lg p-1'
                    aria-label={`Bước ${step.id}: ${step.title}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {/* Step Circle */}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        boxShadow: isCurrent
                          ? '0 0 0 4px rgba(238, 77, 45, 0.15), 0 4px 12px rgba(238, 77, 45, 0.25)'
                          : isCompleted
                            ? '0 2px 8px rgba(34, 197, 94, 0.3)'
                            : '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-500'
                          : isCurrent
                            ? 'border-orange bg-gradient-to-br from-orange to-orange/90'
                            : canClick
                              ? 'border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 group-hover:border-orange/50 group-hover:bg-orange/5 dark:group-hover:bg-orange/10'
                              : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700'
                      }`}
                    >
                      {/* Completed Checkmark */}
                      {isCompleted && (
                        <motion.svg
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className='h-5 w-5 sm:h-6 sm:w-6 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M5 13l4 4L19 7' />
                        </motion.svg>
                      )}

                      {/* Current/Future Step Number */}
                      {!isCompleted && (
                        <motion.span
                          initial={false}
                          animate={{ scale: isCurrent ? 1 : 0.9 }}
                          className={`text-sm sm:text-base font-bold ${
                            isCurrent
                              ? 'text-white'
                              : canClick
                                ? 'text-gray-500 dark:text-gray-400 group-hover:text-orange'
                                : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {step.id}
                        </motion.span>
                      )}

                      {/* Current Step Indicator - Simple border only */}
                    </motion.div>

                    {/* Step Label */}
                    <motion.span
                      initial={false}
                      animate={{ y: isCurrent ? -2 : 0 }}
                      className={`text-xs sm:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                        isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : isCurrent
                            ? 'text-orange font-semibold'
                            : canClick
                              ? 'text-gray-500 dark:text-gray-400 group-hover:text-orange/80'
                              : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.title}
                    </motion.span>
                  </button>

                  {/* Connecting Line */}
                  {index < FORM_STEPS.length - 1 && (
                    <div className='relative mx-2 sm:mx-4 h-0.5 w-8 sm:w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-600'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: stepProgress > step.id ? '100%' : currentStep > step.id ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className='absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-400'
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='max-h-[60vh] overflow-y-auto px-6 py-5'>
          <AnimatePresence mode='wait'>
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <motion.div
                key='step1'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className='space-y-4'
              >
                <div className='mb-4'>
                  <h4 className='text-lg font-medium text-gray-800 dark:text-gray-100'>Thông tin liên hệ</h4>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Nhập thông tin người nhận hàng</p>
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div>
                    <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Họ và tên <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      type='text'
                      placeholder='Nguyễn Văn A'
                      register={register}
                      name='fullName'
                      errorMessage={errors.fullName?.message}
                      classNameInput={`w-full rounded-lg border px-3 py-2.5 transition-colors focus:outline-none ${
                        errors.fullName
                          ? 'border-red-300 focus:border-red-500'
                          : touchedFields.fullName && !errors.fullName
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 dark:border-slate-600 focus:border-orange dark:bg-slate-700 dark:text-gray-100'
                      }`}
                      classNameError='mt-1 min-h-[1rem] text-xs text-red-500'
                    />
                  </div>

                  <div>
                    <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Số điện thoại <span className='text-red-500'>*</span>
                    </label>
                      <Controller
                        name='phone'
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type='tel'
                            placeholder='0901 234 567'
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value)
                              field.onChange(e.target.value.replace(/\s/g, ''))
                              e.target.value = formatted
                            }}
                            className={`w-full rounded-lg border px-3 py-2.5 transition-colors focus:outline-none ${
                              errors.phone
                                ? 'border-red-300 focus:border-red-500'
                                : touchedFields.phone && !errors.phone
                                  ? 'border-green-300 focus:border-green-500'
                                  : 'border-gray-300 dark:border-slate-600 focus:border-orange dark:bg-slate-700 dark:text-gray-100'
                            }`}
                          />
                        )}
                      />
                    {errors.phone && <p className='mt-1 text-xs text-red-500'>{errors.phone.message}</p>}
                    <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>Định dạng: 0901234567 hoặc +84901234567</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location Selection */}
            {currentStep === 2 && (
              <motion.div
                key='step2'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className='space-y-4'
              >
                <div className='mb-4'>
                  <h4 className='text-lg font-medium text-gray-800 dark:text-gray-100'>Địa chỉ giao hàng</h4>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Chọn khu vực giao hàng của bạn</p>
                </div>

                {/* Cascading Dropdowns */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  {/* Province Select */}
                  <div>
                    <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Tỉnh/Thành phố <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <select
                        value={watchedProvinceId || ''}
                        onChange={handleProvinceChange}
                        className={`w-full appearance-none rounded-lg border bg-white dark:bg-slate-700 px-3 py-2.5 pr-10 transition-colors focus:outline-none dark:text-gray-100 ${
                          errors.provinceId ? 'border-red-300' : 'border-gray-300 dark:border-slate-600 focus:border-orange'
                        }`}
                      >
                        <option value=''>Chọn tỉnh/thành</option>
                        {vietnamProvinces.map((province) => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                        <svg className='h-5 w-5 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                        </svg>
                      </div>
                    </div>
                    {errors.provinceId && <p className='mt-1 text-xs text-red-500'>{errors.provinceId.message}</p>}
                  </div>

                  {/* District Select */}
                  <div>
                    <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Quận/Huyện <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <select
                        value={watchedDistrictId || ''}
                        onChange={handleDistrictChange}
                        disabled={!watchedProvinceId || isLoadingDistricts}
                        className={`w-full appearance-none rounded-lg border bg-white dark:bg-slate-700 px-3 py-2.5 pr-10 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-slate-600 dark:text-gray-100 ${
                          errors.districtId ? 'border-red-300' : 'border-gray-300 dark:border-slate-600 focus:border-orange'
                        }`}
                      >
                        <option value=''>
                          {isLoadingDistricts ? 'Đang tải...' : 'Chọn quận/huyện'}
                        </option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                        {isLoadingDistricts ? (
                          <svg className='h-5 w-5 animate-spin text-orange' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                          </svg>
                        ) : (
                          <svg className='h-5 w-5 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                          </svg>
                        )}
                      </div>
                    </div>
                    {errors.districtId && <p className='mt-1 text-xs text-red-500'>{errors.districtId.message}</p>}
                  </div>

                  {/* Ward Select */}
                  <div>
                    <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                      Phường/Xã <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative'>
                      <select
                        value={watch('wardId') || ''}
                        onChange={handleWardChange}
                        disabled={!watchedDistrictId || isLoadingWards}
                        className={`w-full appearance-none rounded-lg border bg-white dark:bg-slate-700 px-3 py-2.5 pr-10 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-slate-600 dark:text-gray-100 ${
                          errors.wardId ? 'border-red-300' : 'border-gray-300 dark:border-slate-600 focus:border-orange'
                        }`}
                      >
                        <option value=''>
                          {isLoadingWards ? 'Đang tải...' : 'Chọn phường/xã'}
                        </option>
                        {wards.map((ward) => (
                          <option key={ward.id} value={ward.id}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
                        {isLoadingWards ? (
                          <svg className='h-5 w-5 animate-spin text-orange' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                          </svg>
                        ) : (
                          <svg className='h-5 w-5 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                          </svg>
                        )}
                      </div>
                    </div>
                    {errors.wardId && <p className='mt-1 text-xs text-red-500'>{errors.wardId.message}</p>}
                  </div>
                </div>

                {/* Hidden inputs for form values */}
                <input type='hidden' {...register('province')} />
                <input type='hidden' {...register('provinceId')} />
                <input type='hidden' {...register('district')} />
                <input type='hidden' {...register('districtId')} />
                <input type='hidden' {...register('ward')} />
                <input type='hidden' {...register('wardId')} />
              </motion.div>
            )}


            {/* Step 3: Street Address & Details */}
            {currentStep === 3 && (
              <motion.div
                key='step3'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className='space-y-4'
              >
                <div className='mb-4'>
                  <h4 className='text-lg font-medium text-gray-800 dark:text-gray-100'>Chi tiết địa chỉ</h4>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Nhập địa chỉ cụ thể và loại địa chỉ</p>
                </div>

                {/* Street Address with Autocomplete */}
                <div>
                  <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200'>
                    Địa chỉ cụ thể <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      {...register('street')}
                      placeholder='Số nhà, tên đường...'
                      onFocus={() => setShowStreetSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowStreetSuggestions(false), 200)}
                      className={`w-full rounded-lg border px-3 py-2.5 transition-colors focus:outline-none dark:bg-slate-700 dark:text-gray-100 ${
                        errors.street ? 'border-red-300' : 'border-gray-300 dark:border-slate-600 focus:border-orange'
                      }`}
                    />
                    <AnimatePresence>
                      {showStreetSuggestions && filteredStreetSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className='absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-lg'
                        >
                          <div className='p-2 text-xs font-medium text-gray-500 dark:text-gray-400'>Gợi ý địa chỉ</div>
                          {filteredStreetSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type='button'
                              onClick={() => handleStreetSelect(suggestion)}
                              className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-orange/5 dark:hover:bg-orange/10 dark:text-gray-200'
                            >
                              <svg className='h-4 w-4 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                              </svg>
                              {suggestion}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.street && <p className='mt-1 text-xs text-red-500'>{errors.street.message}</p>}
                </div>

                {/* Address Preview */}
                {addressPreview && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='rounded-lg bg-gray-50 dark:bg-slate-700 p-3'
                  >
                    <div className='flex items-start gap-2'>
                      <svg className='mt-0.5 h-5 w-5 flex-shrink-0 text-orange' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
                      </svg>
                      <div>
                        <p className='text-xs font-medium text-gray-500 dark:text-gray-400'>Địa chỉ đầy đủ</p>
                        <p className='text-sm text-gray-700 dark:text-gray-200'>{addressPreview}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Address Type Selection */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200'>Loại địa chỉ</label>
                  <div className='flex flex-wrap gap-2'>
                    {ADDRESS_TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => handleTypeSelect(option.value)}
                        className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                          watchedAddressType === option.value
                            ? 'border-orange bg-orange/5 dark:bg-orange/10 text-orange'
                            : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-500'
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <input type='hidden' {...register('addressType')} />
                </div>

                {/* Custom Label for "Other" type */}
                <AnimatePresence>
                  {watchedAddressType === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200'>Nhãn tùy chỉnh</label>
                      <Input
                        type='text'
                        placeholder='VD: Nhà bà ngoại, Nhà bạn...'
                        register={register}
                        name='label'
                        errorMessage={errors.label?.message}
                        classNameInput='w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 focus:border-orange focus:outline-none dark:bg-slate-700 dark:text-gray-100'
                        classNameError='mt-1 min-h-[1rem] text-xs text-red-500'
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Default Address Checkbox */}
                <div className='flex items-center gap-3 rounded-lg border border-gray-200 dark:border-slate-600 p-3'>
                  <input
                    type='checkbox'
                    id='isDefault'
                    {...register('isDefault')}
                    className='h-5 w-5 rounded border-gray-300 dark:border-slate-500 text-orange focus:ring-orange dark:bg-slate-700'
                  />
                  <label htmlFor='isDefault' className='flex-1'>
                    <span className='block text-sm font-medium text-gray-700 dark:text-gray-200'>Đặt làm địa chỉ mặc định</span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>Địa chỉ này sẽ được chọn tự động khi thanh toán</span>
                  </label>
                </div>

                {/* Map Preview Placeholder */}
                <div className='overflow-hidden rounded-lg border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700'>
                  <div className='flex items-center justify-center p-6'>
                    <div className='text-center'>
                      <svg className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' />
                      </svg>
                      <p className='mt-2 text-sm font-medium text-gray-600 dark:text-gray-300'>Xem trên bản đồ</p>
                      <p className='text-xs text-gray-400 dark:text-gray-500'>Tính năng sẽ sớm ra mắt</p>
                      <button
                        type='button'
                        className='mt-3 inline-flex items-center gap-1 rounded-lg bg-gray-200 dark:bg-slate-600 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300'
                        disabled
                      >
                        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                        </svg>
                        Ghim vị trí
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer with Navigation */}
        <div className='flex items-center justify-between border-t border-gray-100 dark:border-slate-700 bg-gradient-to-b from-white dark:from-slate-800 to-gray-50 dark:to-slate-800/50 px-6 py-4'>
          <div>
            {currentStep > 1 && (
              <Button
                type='button'
                onClick={() => setCurrentStep(currentStep - 1)}
                className='flex items-center gap-1.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-600 hover:shadow'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
                Quay lại
              </Button>
            )}
          </div>
          <div className='flex gap-3'>
            <Button
              type='button'
              onClick={onClose}
              className='rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-600 hover:shadow'
            >
              Hủy
            </Button>
            {currentStep < 3 ? (
              <Button
                type='button'
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToStep(currentStep + 1)}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange to-orange/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange/30 transition-all hover:shadow-xl hover:shadow-orange/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'
              >
                <span className='inline-flex items-center leading-none'>Tiếp tục</span>
                <svg
                  className='h-4 w-4 flex-shrink-0'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </Button>
            ) : (
              <Button
                type='submit'
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                isLoading={isLoading}
                className='flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange to-orange/90 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange/30 transition-all hover:shadow-xl hover:shadow-orange/40 disabled:opacity-50 disabled:shadow-none'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                {isEditing ? 'Cập nhật' : 'Thêm địa chỉ'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

export default AddressForm