 import type { RegisterOptions, UseFormGetValues, FieldValues } from 'react-hook-form' // * tips Chỉ import được những cái type(interface) thôi, không thể import được hằng số, biến hay function
 import { z } from 'zod'

type Rules = { [key in 'email' | 'password' | 'confirm_password']?: RegisterOptions } // khai báo thêm dấu ?: có hay không có cũng được

// Kiểu trả về của error func là Rules, Nếu chưa biết arg useFormGetValues truyền vào gì thì cứ tạm thời truyền vào any
// func getRules return về một object, và response của getRules là Rules
export const getRules = (getValues?: UseFormGetValues<FieldValues>): Rules => ({
  email: {
    required: {
      value: true,
      message: 'Email là bắt buộc'
    },
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      // value:
      //   /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
      message: 'Email không đúng định dạng'
    },
    // /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    maxLength: {
      value: 160,
      message: 'Độ dài từ 5 đến 160 ký tự'
    },
    minLength: {
      value: 5,
      message: 'Độ dài từ 5 đến 160 ký tự'
    }
  },
  password: {
    required: {
      value: true,
      message: 'Password là bắt buộc'
    },
    maxLength: {
      value: 160,
      message: 'Độ dài từ 6 đến 160 ký tự'
    },
    minLength: {
      value: 6,
      message: 'Độ dài từ 6 đến 160 ký tự'
    }
  },
  // Thiếu 1 cái rule nữa là so sánh với password phiếu trước
  confirm_password: {
    required: {
      value: true,
      message: 'Nhập lại password là bắt buộc'
    },
    maxLength: {
      value: 160,
      message: 'Độ dài từ 5 đến 160 ký tự'
    },
    minLength: {
      value: 5,
      message: 'Độ dài từ 5 đến 160 ký tự'
    },
    // phải kiểm tra getValues có thay không trong trường hợp người dùng ko truyền getValues thì không có options validate(validate === udefined)
    validate:
      typeof getValues === 'function'
        ? (value) => value === getValues('password') || 'Nhập lại password không đúng'
        : undefined
  }
})

 // Zod base schema (không có refinements, dùng để .pick() tạo sub-schemas)
 export const baseSchema = z.object({
   email: z
     .string()
     .min(1, 'Email là bắt buộc')
     .email('Email không đúng định dạng')
     .min(5, 'Độ dài từ 5 đến 160 ký tự')
     .max(160, 'Độ dài từ 5 đến 160 ký tự'),
   password: z
     .string()
     .min(1, 'Password là bắt buộc')
     .min(6, 'Độ dài từ 6 đến 160 ký tự')
     .max(160, 'Độ dài từ 6 đến 160 ký tự'),
   confirm_password: z
     .string()
     .min(1, 'Confirm password là bắt buộc')
     .min(6, 'Độ dài từ 6 đến 160 ký tự')
     .max(160, 'Độ dài từ 6 đến 160 ký tự'),
   price_min: z.string().optional(),
   price_max: z.string().optional(),
   name: z.string().trim().min(1, 'Tên sản phẩm là bắt buộc')
 })

 // Schema đầy đủ với refinements (dùng cho full form nếu cần)
 export const schema = baseSchema.superRefine((data, ctx) => {
   // Validate confirm_password matches password
   if (data.confirm_password !== data.password) {
     ctx.addIssue({
       code: z.ZodIssueCode.custom,
       message: 'Nhập lại password không khớp!!',
       path: ['confirm_password']
     })
   }
   // Validate price_min / price_max
   if (data.price_min !== undefined && data.price_min !== '' && data.price_max !== undefined && data.price_max !== '') {
     if (Number(data.price_max) < Number(data.price_min)) {
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: 'Giá không phù hợp',
         path: ['price_min']
       })
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: 'Giá không phù hợp',
         path: ['price_max']
       })
     }
   } else if (
     (data.price_min === undefined || data.price_min === '') &&
     (data.price_max === undefined || data.price_max === '')
   ) {
     ctx.addIssue({
       code: z.ZodIssueCode.custom,
       message: 'Giá không phù hợp',
       path: ['price_min']
     })
     ctx.addIssue({
       code: z.ZodIssueCode.custom,
       message: 'Giá không phù hợp',
       path: ['price_max']
     })
   }
 })
 
 // Zod base user schema (không có refinements, dùng để .pick() tạo sub-schemas)
 export const baseUserSchema = z.object({
   name: z.string().max(160, 'Độ dài tối đa là 160 ký tự').optional(),
   phone: z.string().max(20, 'Độ dài tối đa là 20 ký tự').optional(),
   address: z.string().max(160, 'Độ dài tối đa là 160 ký tự ').optional(),
   avatar: z.string().max(1000, 'Độ dài tối đa là 1000 ký tự').optional(),
   date_of_birth: z.date().max(new Date(), 'Ngày không hợp lệ, vui lòng chỉnh ngày chính xác').optional(),
   password: z
     .string()
     .min(6, 'Độ dài từ 6 đến 160 ký tự')
     .max(160, 'Độ dài từ 6 đến 160 ký tự')
     .optional()
     .or(z.literal('')),
   new_password: z
     .string()
     .min(6, 'Độ dài từ 6 đến 160 ký tự')
     .max(160, 'Độ dài từ 6 đến 160 ký tự')
     .optional()
     .or(z.literal('')),
   confirm_password: z
     .string()
     .min(6, 'Độ dài từ 6 đến 160 ký tự')
     .max(160, 'Độ dài từ 6 đến 160 ký tự')
     .optional()
     .or(z.literal(''))
 })

 // Schema đầy đủ với refinements (dùng cho full form nếu cần)
 export const userSchema = baseUserSchema.superRefine((data, ctx) => {
   if (data.new_password && data.confirm_password !== data.new_password) {
     ctx.addIssue({
       code: z.ZodIssueCode.custom,
       message: 'Nhập lại password không khớp!!',
       path: ['confirm_password']
     })
   }
 })
 
 // Nếu mà thằng Login chỉ cần lấy vào 2 schema là email và password thôi
 // Dùng baseSchema.pick() vì Zod v4 không cho .pick() trên schema đã có .superRefine()
 export const loginSchema = baseSchema.pick({ email: true, password: true })

 export const registerSchema = baseSchema.pick({ email: true, password: true, confirm_password: true }).superRefine((data, ctx) => {
   if (data.confirm_password !== data.password) {
     ctx.addIssue({
       code: z.ZodIssueCode.custom,
       message: 'Nhập lại password không khớp!!',
       path: ['confirm_password']
     })
   }
 })

 export const inputNumberSchema = baseSchema.pick({ price_min: true, price_max: true }).superRefine((data, ctx) => {
   if (data.price_min !== undefined && data.price_min !== '' && data.price_max !== undefined && data.price_max !== '') {
     if (Number(data.price_max) < Number(data.price_min)) {
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: 'Giá không phù hợp',
         path: ['price_min']
       })
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: 'Giá không phù hợp',
         path: ['price_max']
       })
     }
   } else if (
     (data.price_min === undefined || data.price_min === '') &&
     (data.price_max === undefined || data.price_max === '')
   ) {
     ctx.addIssue({
       code: z.ZodIssueCode.custom,
       message: 'Giá không phù hợp',
       path: ['price_min']
     })
     ctx.addIssue({
       code: z.ZodIssueCode.custom,
       message: 'Giá không phù hợp',
       path: ['price_max']
     })
   }
 })

 // Export type cho userSchema (dùng baseUserSchema để .pick() hoạt động đúng)
 export type UserSchema = z.infer<typeof baseUserSchema>

 // Tự generate ra cái type nhờ hàm infer của zod
 export type Schema = z.infer<typeof schema>
 export type LoginSchema = z.infer<typeof loginSchema>
 export type RegisterSchema = z.infer<typeof registerSchema>

 export type InputNumberSchema = z.infer<typeof inputNumberSchema>
