import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'
import OrderCard from './OrderCard'
import type { Order } from 'src/types/checkout.type'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

const mockOrder: Order = {
  _id: 'order123456789',
  items: [
    {
      product: { _id: 'p1', name: 'Test Product', image: 'test.jpg', price: 100000 },
      buyCount: 2,
      price: 100000
    }
  ],
  total: 200000,
  status: 'pending',
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2024-01-15T10:30:00.000Z',
  shippingAddress: { fullName: 'Test', phone: '0123456789', address: 'Test Address' },
  paymentMethod: 'cod'
}

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('OrderCard', () => {
  it('renders order ID', () => {
    renderWithRouter(<OrderCard order={mockOrder} />)
    // order._id.slice(-8).toUpperCase() = '23456789'
    expect(screen.getByText('23456789')).toBeInTheDocument()
  })

  it('displays product information', () => {
    renderWithRouter(<OrderCard order={mockOrder} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('x2')).toBeInTheDocument()
  })

  it('renders cancel button for pending orders', () => {
    renderWithRouter(<OrderCard order={mockOrder} onCancel={vi.fn()} />)
    // Button component renders the text
    const cancelButtons = screen.getAllByRole('button')
    const cancelBtn = cancelButtons.find((btn) => btn.textContent?.includes('Hủy'))
    expect(cancelBtn).toBeTruthy()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderWithRouter(<OrderCard order={mockOrder} onCancel={onCancel} />)
    const cancelButtons = screen.getAllByRole('button')
    const cancelBtn = cancelButtons.find((btn) => btn.textContent?.includes('Hủy'))
    if (cancelBtn) {
      await user.click(cancelBtn)
      expect(onCancel).toHaveBeenCalledWith('order123456789')
    }
  })
})

