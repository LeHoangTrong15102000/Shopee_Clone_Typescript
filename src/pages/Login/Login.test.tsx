// test những thứ liên quan đến trang login

import { screen, waitFor, fireEvent } from '@testing-library/react'
import path from 'src/constant/path'
import { logScreen, renderWithRouter } from 'src/utils/testUtils'

import matchers from '@testing-library/jest-dom/matchers'
import { beforeAll, describe, expect, test } from 'vitest'

expect.extend(matchers)

describe('Login', () => {
  let emailInput: HTMLInputElement
  let passwordInput: HTMLInputElement
  let submitButton: HTMLButtonElement
  beforeAll(async () => {
    renderWithRouter({ route: path.login })
    await waitFor(() => {
      // thành công render thì phải in ra được thằng input`email`
      expect(screen.queryByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Password')).toBeInTheDocument()
    })

    emailInput = document.querySelector('form input[type="email"]') as HTMLInputElement
    passwordInput = document.querySelector('form input[type="password"]') as HTMLInputElement
    submitButton = document.querySelector('form button[type="submit"]') as HTMLButtonElement
  })

  test('Hiển thị lỗi required khi mà không nhập gì!', async () => {
    // Chúng ta dám chắc nó luôn luôn là element
    const submitButton = document.querySelector("form button[type='submit']") as HTMLButtonElement
    fireEvent.submit(submitButton) // dùng fireEvent.submit() luôn chà làm sao cả
    // Khi mà nhấn submit mà ko nhập thì bắt buộc nó phải quăng ra lỗi thì testcase nó mới pass
    // await logScreen()
    await waitFor(async () => {
      expect(await screen.findByText('Email là bắt buộc')).toBeTruthy()
      expect(await screen.findByText('Password là bắt buộc')).toBeTruthy()
    })
  })

  test('Hiển thị lỗi data không đúng định dạng form!', async () => {
    fireEvent.change(emailInput, {
      target: {
        // nhập vào cái email không đúng định dạng
        value: 'test@mail'
      }
    })
    fireEvent.change(passwordInput, {
      target: {
        value: '123'
      }
    })

    // fireEvent.blur(emailInput)
    // fireEvent.blur(passwordInput)

    await logScreen()
    // fireEvent.submit(submitButton)
    // Cũng cần phải await nó trước khi render ra
    await waitFor(async () => {
      expect(await screen.findByText('Email không đúng định dạng')).toBeTruthy()
      expect(await screen.findByText('Độ dài từ 6 đến 160 ký tự')).toBeTruthy()
    })
  })

  test('Không hiển thị lỗi khi nhập lại value đúng', async () => {
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

    await waitFor(() => {
      expect(document.querySelector('title')?.textContent).toBe('Trang chủ | Shopee Clone')
    })
    // console.log(await screen.findByText('Email không đúng định dạng'))
  })
})
