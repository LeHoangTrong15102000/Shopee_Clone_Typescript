import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import Input from '../../src/components/Input'
import Button from '../../src/components/Button'
import Pagination from '../../src/components/Pagination'

// Wrapper component để cung cấp context cần thiết
const TestWrapper = ({ children }: { children: React.ReactNode }) => <BrowserRouter>{children}</BrowserRouter>

describe('Component Snapshots', () => {
  test('Input component renders correctly', () => {
    const { container } = render(
      <TestWrapper>
        <Input placeholder='Test input' name='test' />
      </TestWrapper>
    )
    expect(container.firstChild).toMatchSnapshot('Input-default')
  })

  test('Input component with error state', () => {
    const { container } = render(
      <TestWrapper>
        <Input placeholder='Test input' errorMessage='This field is required' name='test-error' />
      </TestWrapper>
    )
    expect(container.firstChild).toMatchSnapshot('Input-error')
  })

  test('Button component renders correctly', () => {
    const { container } = render(
      <TestWrapper>
        <Button>Click me</Button>
      </TestWrapper>
    )
    expect(container.firstChild).toMatchSnapshot('Button-default')
  })

  test('Button component disabled state', () => {
    const { container } = render(
      <TestWrapper>
        <Button disabled>Disabled button</Button>
      </TestWrapper>
    )
    expect(container.firstChild).toMatchSnapshot('Button-disabled')
  })

  test('Pagination component renders correctly', () => {
    const { container } = render(
      <TestWrapper>
        <Pagination pageSize={20} queryConfig={{ page: '1' }} />
      </TestWrapper>
    )
    expect(container.firstChild).toMatchSnapshot('Pagination-default')
  })
})
