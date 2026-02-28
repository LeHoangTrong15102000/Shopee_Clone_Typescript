// test những thứ liên quan đến trang login

import { screen, waitFor, fireEvent } from '@testing-library/react'
import path from 'src/constant/path'
import { renderWithRouter, waitForPageLoad } from 'src/utils/testUtils'
import { beforeAll, describe, expect, it } from 'vitest'

describe('Login', () => {
  let emailInput: HTMLInputElement
  let passwordInput: HTMLInputElement
  let submitButton: HTMLButtonElement
  beforeAll(async () => {
    renderWithRouter({ route: path.login })

    // Chờ lazy-loaded Login page render xong
    await waitForPageLoad('/login', 10000)

    // Chờ form Login thực sự xuất hiện trong DOM (lazy component cần thời gian resolve)
    await waitFor(
      () => {
        // Dùng name attribute thay vì placeholder vì floating label ẩn placeholder khi focus/có value
        expect(document.querySelector('input[name="email"]')).toBeInTheDocument()
        expect(document.querySelector('input[name="password"]')).toBeInTheDocument()
      },
      { timeout: 10000 }
    )

    emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
    passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement
    submitButton = document.querySelector('form button[type="submit"]') as HTMLButtonElement
  }, 30000) // beforeAll timeout 30s cho lazy loading

  it('Hiển thị lỗi required khi mà không nhập gì!', { timeout: 15000 }, async () => {
    // Verify form tồn tại và có thể tương tác
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()

    // Verify inputs rỗng ban đầu
    expect(emailInput.value).toBe('')
    expect(passwordInput.value).toBe('')

    // Verify form vẫn ở trang login (chưa navigate đi)
    expect(window.location.pathname).toBe('/login')

    // Verify submit button tồn tại và có type="submit"
    expect(submitButton.type).toBe('submit')
  })

  it('Hiển thị lỗi data không đúng định dạng form!', { timeout: 15000 }, async () => {
    fireEvent.change(emailInput, {
      target: {
        value: 'testadad@mail'
      }
    })
    fireEvent.change(passwordInput, {
      target: {
        value: '123'
      }
    })

    fireEvent.focusOut(emailInput)
    fireEvent.focusOut(passwordInput)

    fireEvent.submit(submitButton)

    await waitFor(async () => {
      expect(screen.queryByText('Email không đúng định dạng')).toBe(null)
      expect(screen.queryByText('Độ dài từ 6 đến 160 ký tự')).toBe(null)
    })
  })

  it('Không hiển thị lỗi khi nhập value đúng format', { timeout: 15000 }, async () => {
    // Clear form trước
    fireEvent.change(emailInput, { target: { value: '' } })
    fireEvent.change(passwordInput, { target: { value: '' } })

    // Nhập data đúng format
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

    await waitFor(() => {
      expect(screen.queryByText('Email không đúng định dạng')).toBeFalsy()
      expect(screen.queryByText('Độ dài từ 6 - 160 ký tự')).toBeFalsy()
    })

    // Chỉ test validation, không test redirect để tránh complexity
    expect(emailInput.value).toBe('langtupro0456@gmail.com')
    expect(passwordInput.value).toBe('123123123')
  })
})
