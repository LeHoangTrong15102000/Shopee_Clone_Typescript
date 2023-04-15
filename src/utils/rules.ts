import type { RegisterOptions, UseFormGetValues } from 'react-hook-form' // * tips Chỉ import được những cái type(interface) thôi, không thể import được hằng số, biến hay function
import * as yup from 'yup'
import { AnyObject } from 'yup/lib/types'

type Rules = { [key in 'email' | 'password' | 'confirm_password']?: RegisterOptions } // khai báo thêm dấu ?: có hay không có cũng được

// Kiểu trả về của error func là Rules, Nếu chưa biết arg useFormGetValues truyền vào gì thì cứ tạm thời truyền vào any
// func getRules return về một object, và response của getRules là Rules
export const getRules = (getValues?: UseFormGetValues<any>): Rules => ({
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

// Nên dùng như này, không nên dùng arrow function
function testPriceMinMax(this: yup.TestContext<AnyObject>) {
  const { price_min, price_max } = this.parent as { price_min: string; price_max: string }
  if (price_min !== '' && price_max !== '') {
    return Number(price_max) >= Number(price_min)
  }
  return price_max !== '' || price_min !== ''
}

// Fucntion handleConfirmPasswordYup
const handleConfirmPasswordYup = (refString: string) => {
  return yup
    .string()
    .required('Confirm password là bắt buộc')
    .min(6, 'Độ dài từ 6 đến 160 ký tự')
    .max(160, 'Độ dài từ 6 đến 160 ký tự')
    .oneOf([yup.ref(refString)], 'Nhập lại password không khớp!!')
}

export const schema = yup.object({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không đúng định dạng')
    .min(5, 'Độ dài từ 5 đến 160 ký tự')
    .max(160, 'Độ dài từ 5 đến 160 ký tự'),
  password: yup
    .string()
    .required('Password là bắt buộc')
    .min(6, 'Độ dài từ 6 đến 160 ký tự')
    .max(160, 'Độ dài từ 6 đến 160 ký tự'),
  // Do là schema nên ngoài việc dùng được những string vẫn có thể dùng được cả schema api(schema là rộng nhất)
  confirm_password: handleConfirmPasswordYup('password'), // Tham chiếu đến giá trị của password, nếu khớp thì pass qua
  price_min: yup.string().test({
    name: 'price-not-allowed',
    message: 'Giá không phù hợp',
    test: function (value) {
      const price_min = value // giá trị của thằng price_min
      const { price_max } = this.parent as { price_min: string; price_max: string } // lấy ra object parent của price_min
      if (price_min !== '' && price_max !== '') {
        return Number(price_max) >= Number(price_min)
      }
      return price_min !== '' || price_max !== ''
    }
  }),
  price_max: yup.string().test({
    name: 'price-not-allowed',
    message: 'Giá không phù hợp',
    test: testPriceMinMax
  }),
  name: yup.string().trim().lowercase().required('Tên sản phẩm là bắt buộc')
})

// Khai báo schema cho thằng UserSchema
export const userSchema = yup.object({
  name: yup.string().max(160, 'Độ dài tối đa là 160 ký tự'),
  phone: yup.string().max(20, 'Độ dài tối đa là 20 ký tự'),
  address: yup.string().max(160, 'Độ dài tối đa là 160 ký tự '),
  avatar: yup.string().max(1000, 'Độ dài tối đa là 1000 ký tự'),
  date_of_birth: yup.date().max(new Date(), 'Ngày không hợp lệ, vui lòng chỉnh ngày chính xác'),
  password: schema.fields['password'] as yup.StringSchema<string | undefined, AnyObject, string | undefined>, // kế thừa từ trường password đã có sẵn
  new_password: schema.fields['password'] as yup.StringSchema<string | undefined, AnyObject, string | undefined>, // Cũng kế thừa từ password
  confirm_password: handleConfirmPasswordYup('new_password') as yup.StringSchema<
    string | undefined,
    AnyObject,
    string | undefined
  > // Kế thừa từ confirm_password
})

// Nếu mà thằng Login chỉ cần lấy vào 2 schema là email và password thôi thì có thể làm như sau

export const loginSchema = schema.pick(['email', 'password']) // key của omit là một array
export const registerSchema = schema.omit(['price_max', 'price_min', 'name'])

export const inputNumberSchema = schema.pick(['price_min', 'price_max']) // có thể dùng pick như này

// Export type cho userSchema
export type UserSchema = yup.InferType<typeof userSchema>

// Tự genararate ra cái type nhờ hàm InferType của yup
export type Schema = yup.InferType<typeof schema>
export type LoginSchema = yup.InferType<typeof loginSchema> // Lấy ra cái type từ thằng yup
export type RegisterSchema = yup.InferType<typeof registerSchema>

export type InputNumberSchema = yup.InferType<typeof inputNumberSchema>
