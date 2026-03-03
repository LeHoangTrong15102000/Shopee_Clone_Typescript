import { motion } from 'framer-motion'
import { Controller, UseFormReturn } from 'react-hook-form'
import Input from 'src/components/Input'
import { AddressSchemaFormData, formatPhoneNumber } from '../addressForm.constants'

interface ContactInfoStepProps {
  form: UseFormReturn<AddressSchemaFormData>
}

export default function ContactInfoStep({ form }: ContactInfoStepProps) {
  const {
    register,
    control,
    formState: { errors, touchedFields }
  } = form

  return (
    <motion.div key='step1' initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-4'>
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
            classNameInput={`w-full rounded-lg border px-3 py-2.5 transition-colors focus:outline-hidden ${
              errors.fullName
                ? 'border-red-300 focus:border-red-500'
                : touchedFields.fullName && !errors.fullName
                  ? 'border-green-300 focus:border-green-500'
                  : 'border-gray-300 dark:border-slate-600 focus:border-orange dark:bg-slate-700 dark:text-gray-100'
            }`}
            classNameError='mt-1 min-h-4 text-xs text-red-500'
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
                className={`w-full rounded-lg border px-3 py-2.5 transition-colors focus:outline-hidden ${
                  errors.phone
                    ? 'border-red-300 focus:border-red-500'
                    : touchedFields.phone && !errors.phone
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-300 focus:border-orange dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100'
                }`}
              />
            )}
          />
          {errors.phone && <p className='mt-1 text-xs text-red-500'>{errors.phone.message}</p>}
          <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
            Định dạng: 0901234567 hoặc +84901234567
          </p>
        </div>
      </div>
    </motion.div>
  )
}

