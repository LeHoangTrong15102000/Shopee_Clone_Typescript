// test những thứ liên quan đến trang login

import { screen, waitFor, fireEvent } from '@testing-library/react'
import path from 'src/constant/path'
import { logScreen, renderWithRouter } from 'src/utils/testUtils'
import userEvent from '@testing-library/user-event'
import matchers from '@testing-library/jest-dom/matchers'
import { beforeAll, describe, expect, test, it } from 'vitest'

expect.extend(matchers)

describe('Login', () => {
  let emailInput: HTMLInputElement
  let passwordInput: HTMLInputElement
  let submitButton: HTMLButtonElement
  beforeAll(async () => {
    renderWithRouter({ route: path.login })
    // Chạy trước tất cả để render ra thằng email và password
    await waitFor(() => {
      // thành công render thì phải in ra được thằng input`email`
      expect(screen.queryByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Password')).toBeInTheDocument()
    })

    // await logScreen()

    // emailInput = document.querySelector('form input[type="email"]') as HTMLInputElement
    // passwordInput = document.querySelector('form input[type="password"]') as HTMLInputElement
    // submitButton = document.querySelector('form button[type="submit"]') as HTMLButtonElement

    emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement
    passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement
    submitButton = document.querySelector('form button[type="submit"]') as HTMLButtonElement
    // submitButton = screen.getByTestId('button-element') as HTMLButtonElement
    await logScreen()
  })

  it('Hiển thị lỗi required khi mà không nhập gì!', async () => {
    // Chúng ta dám chắc nó luôn luôn là element

    fireEvent.submit(submitButton) // dùng fireEvent.submit() luôn chà làm sao cả
    // Khi mà nhấn submit mà ko nhập thì bắt buộc nó phải quăng ra lỗi thì testcase nó mới pass
    // await logScreen()
    await waitFor(async () => {
      // queryByText không trả về một promise nên không cần await nữa
      expect(screen.getByText('Email là bắt buộc')).toBeTruthy() // trả về lỗi # null thì là
      expect(screen.getByText('Password là bắt buộc')).toBeTruthy()
    })
  })

  it('Hiển thị lỗi data không đúng định dạng form!', async () => {
    // await logScreen()
    fireEvent.change(emailInput, {
      target: {
        // nhập vào cái email không đúng định dạng
        value: 'testadad@mail'
      }
    })
    fireEvent.change(passwordInput, {
      target: {
        value: '123'
      }
    })

    // console.log('Chạy vào đây >>>>>>')

    fireEvent.focusOut(emailInput)
    fireEvent.focusOut(passwordInput)

    fireEvent.submit(submitButton)
    // console.log('Console fireEvent submit', fireEvent.submit(submitButton))

    await logScreen()
    // Cũng cần phải await nó trước khi render ra
    // Dùng findByText ở đây cũng được nhưng phải thêm await vào
    await waitFor(async () => {
      expect(screen.queryByText('Email không đúng định dạng')).toBe(null)
      expect(screen.queryByText('Độ dài từ 6 đến 160 ký tự')).toBe(null)
    })
  })

  it('Không hiển thị lỗi khi nhập lại value đúng', async () => {
    // await logScreen()
    fireEvent.change(emailInput, {
      target: {
        value: 'langtupro0456@gmail.com'
      }
    })
    fireEvent.change(passwordInput, {
      target: {
        value: '123123123'
      }
    })
    // Những trường hợp chứng minh rằng tìm không ra text hay là element
    // Thì nên dùng query hơn là find hay get
    await waitFor(() => {
      expect(screen.queryByText('Email không đúng định dạng')).toBeFalsy()
      expect(screen.queryByText('Độ dài từ 6 - 160 ký tự')).toBeFalsy()
    })

    fireEvent.submit(submitButton)

    // console.log('Console fireEvent submit', fireEvent.submit(submitButton))

    await waitFor(() => {
      expect(document.querySelector('title')?.textContent).toBe('Trang chủ | Shopee Clone')
    })
    await logScreen()
  })
})

// describe('Login', () => {
//   let emailInput: HTMLInputElement
//   let passwordInput: HTMLInputElement
//   let submitButton: HTMLButtonElement
//   beforeAll(async () => {
//     renderWithRouter({ route: path.login })
//     await waitFor(() => {
//       expect(screen.queryByPlaceholderText('Email')).toBeInTheDocument()
//     })
//     emailInput = document.querySelector('form input[type="email"]') as HTMLInputElement
//     passwordInput = document.querySelector('form input[type="password"]') as HTMLInputElement
//     submitButton = document.querySelector('form button[type="submit"]') as HTMLButtonElement
//   })
//   it('Hiển thị lỗi required khi không nhập gì', async () => {
//     fireEvent.submit(submitButton)
//     await waitFor(() => {
//       expect(screen.queryByText('Email là bắt buộc')).toBeTruthy()
//       expect(screen.queryByText('Password là bắt buộc')).toBeTruthy()
//     })
//   })
//   it('Hiển thị lỗi khi nhập value input sai', async () => {
//     fireEvent.change(emailInput, {
//       target: {
//         value: 'test@mail'
//       }
//     })
//     fireEvent.change(passwordInput, {
//       target: {
//         value: '123'
//       }
//     })
//     fireEvent.submit(submitButton)
//     await waitFor(() => {
//       expect(screen.queryByText('Email không đúng định dạng')).toBeTruthy()
//       expect(screen.queryByText('Độ dài từ 6 - 160 ký tự')).toBeTruthy()
//     })
//   })

//   it('Không nên hiển thị lỗi khi nhập lại value đúng', async () => {
//     fireEvent.change(emailInput, {
//       target: {
//         value: 'langtupro0456@gmail.com'
//       }
//     })
//     fireEvent.change(passwordInput, {
//       target: {
//         value: '123123123'
//       }
//     })
//     // Những trường hợp chứng minh rằng tìm không ra text hay là element
//     // Thì nên dùng query hơn là find hay get
//     await waitFor(() => {
//       expect(screen.queryByText('Email không đúng định dạng')).toBeFalsy()
//       expect(screen.queryByText('Độ dài từ 6 - 160 ký tự')).toBeFalsy()
//     })
//     fireEvent.submit(submitButton)
//     await waitFor(() => {
//       expect(document.querySelector('title')?.textContent).toBe('Trang chủ | Shopee Clone')
//     })
//     // console.log(await screen.findByText('Email không đúng định dạng'))
//   })
// })
