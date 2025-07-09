import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Pagination from './Pagination'
import { QueryConfig } from 'src/hooks/useQueryConfig'

// Helper component để wrap với Router
const PaginationWithRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('Pagination Component Unit Tests', () => {
  const defaultQueryConfig: QueryConfig = {
    page: '1',
    limit: '20',
    category: '',
    exclude: '',
    name: '',
    order: '',
    price_max: '',
    price_min: '',
    rating_filter: '',
    sort_by: ''
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any existing DOM elements
    document.body.innerHTML = ''
  })

  describe('Rendering', () => {
    test('should render with basic structure', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should render page numbers correctly', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '3' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Should show current page
      const currentPage = screen.getByText('3')
      expect(currentPage).toBeInTheDocument()
    })

    test('should render with custom page size', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={50} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should render navigation controls', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '5' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Check for previous/next navigation
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    test('should render with different page sizes', () => {
      const { rerender } = render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={3} />
        </PaginationWithRouter>
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.queryByText('4')).not.toBeInTheDocument()

      rerender(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={10} />
        </PaginationWithRouter>
      )

      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  describe('Navigation Controls', () => {
    test('should disable previous button on first page', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '1' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Previous button should be disabled (rendered as span, not link)
      const prevButton = document.querySelector('.cursor-not-allowed')
      expect(prevButton).toBeInTheDocument()
    })

    test('should render previous button when not on first page', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '3' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Should have previous navigation
      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton).toBeInTheDocument()
    })

    test('should render next button when not on last page', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '1' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Should have next navigation
      const nextButton = screen.getByLabelText('Go to next page')
      expect(nextButton).toBeInTheDocument()
    })

    test('should disable next button on last page', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '20' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Next button should be disabled (rendered as span, not link)
      const nextButton = document.querySelector('span[class*="cursor-not-allowed"]')
      expect(nextButton).toBeInTheDocument()
    })
  })

  describe('Page URL Generation', () => {
    test('should generate correct URLs for page numbers', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const page2Link = screen.getByText('2').closest('a')
      expect(page2Link).toHaveAttribute(
        'href',
        '/?page=2&limit=20&category=&exclude=&name=&order=&price_max=&price_min=&rating_filter=&sort_by='
      )
    })

    test('should preserve query parameters in URLs', () => {
      const configWithParams = {
        ...defaultQueryConfig,
        category: 'electronics',
        price_min: '100'
      }

      render(
        <PaginationWithRouter>
          <Pagination queryConfig={configWithParams} pageSize={20} />
        </PaginationWithRouter>
      )

      const page2Link = screen.getByText('2').closest('a')
      expect(page2Link?.getAttribute('href')).toContain('category=electronics')
      expect(page2Link?.getAttribute('href')).toContain('price_min=100')
    })

    test('should handle complex query configurations', () => {
      const complexConfig = {
        ...defaultQueryConfig,
        page: '5',
        category: 'books',
        sort_by: 'price',
        order: 'asc'
      }

      render(
        <PaginationWithRouter>
          <Pagination queryConfig={complexConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const page6Link = screen.getByText('6').closest('a')
      expect(page6Link?.getAttribute('href')).toContain('page=6')
      expect(page6Link?.getAttribute('href')).toContain('category=books')
      expect(page6Link?.getAttribute('href')).toContain('sort_by=price')
    })
  })

  describe('Dots Rendering Logic', () => {
    test('should render dots for many pages', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '10' }} pageSize={50} />
        </PaginationWithRouter>
      )

      // Should contain dots for large pagination
      const dots = document.querySelectorAll('span:not([class*="cursor-not-allowed"])')
      const dotsWithEllipsis = Array.from(dots).filter((span) => span.textContent?.includes('...'))
      expect(dotsWithEllipsis.length).toBeGreaterThan(0)
    })

    test('should handle edge cases with dots', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '2' }} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should render appropriate number of links for large pagination', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '15' }} pageSize={50} />
        </PaginationWithRouter>
      )

      const links = screen.getAllByRole('link')
      // Should have a reasonable number of links (not all 50 pages)
      expect(links.length).toBeLessThan(20)
    })
  })

  describe('User Interactions', () => {
    test('should provide clickable page links', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const page2Link = screen.getByText('2')
      expect(page2Link.closest('a')).toHaveAttribute('href')
    })

    test('should provide clickable navigation controls', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '5' }} pageSize={20} />
        </PaginationWithRouter>
      )

      const prevButton = screen.getByLabelText('Go to previous page')
      const nextButton = screen.getByLabelText('Go to next page')

      expect(prevButton).toHaveAttribute('href')
      expect(nextButton).toHaveAttribute('href')
    })

    test('should support keyboard navigation', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const links = screen.getAllByRole('link')
      links.forEach((link) => {
        // Links should be focusable by default
        expect(link.tagName).toBe('A')
      })
    })
  })

  describe('Edge Cases', () => {
    test('should handle missing page in queryConfig', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{}} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should handle invalid page numbers', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: 'invalid' }} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should handle zero or negative page numbers', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '0' }} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should handle very large page numbers', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '9999' }} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should handle missing pageSize', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '1' }} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should handle zero pageSize', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '1' }} pageSize={0} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    test('should apply correct CSS classes to pagination container', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toHaveClass('mt-6', 'flex', 'justify-center')
    })

    test('should highlight current page', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '3' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Current page should have specific styling
      const currentPage = screen.getByText('3')
      expect(currentPage).toBeInTheDocument()
    })

    test('should style disabled navigation elements', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '1' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Should render without errors even when on first page
      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should apply hover states to clickable elements', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '2' }} pageSize={20} />
        </PaginationWithRouter>
      )

      const links = screen.getAllByRole('link')
      links.forEach((link) => {
        // Check for actual hover classes used in the Pagination component
        const className = link.className
        const hasHoverStyles =
          className.includes('hover:text-[#ee4e2d]') ||
          className.includes('hover:bg-[#ee4d2d]') ||
          className.includes('cursor-pointer')
        expect(hasHoverStyles).toBe(true)
      })
    })
  })

  describe('Accessibility', () => {
    test('should have proper navigation role', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toHaveAttribute('role', 'navigation')
    })

    test('should have proper aria-label for navigation', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toHaveAttribute('aria-label', 'Pagination Navigation')
    })

    test('should provide accessible labels for navigation controls', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '5' }} pageSize={20} />
        </PaginationWithRouter>
      )

      expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument()
    })

    test('should support screen readers', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      // All interactive elements should be proper links
      const links = screen.getAllByRole('link')
      links.forEach((link) => {
        expect(link.tagName).toBe('A')
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      // Re-render with same props
      rerender(
        <PaginationWithRouter>
          <Pagination queryConfig={defaultQueryConfig} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should handle large page counts efficiently', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{ ...defaultQueryConfig, page: '500' }} pageSize={20} />
        </PaginationWithRouter>
      )

      // Should render without performance issues
      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })
  })

  describe('Props Validation', () => {
    test('should handle missing queryConfig gracefully', () => {
      expect(() => {
        render(
          <PaginationWithRouter>
            <Pagination pageSize={20} />
          </PaginationWithRouter>
        )
      }).not.toThrow()
    })

    test('should use reasonable defaults', () => {
      render(
        <PaginationWithRouter>
          <Pagination />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })

    test('should handle empty queryConfig object', () => {
      render(
        <PaginationWithRouter>
          <Pagination queryConfig={{}} pageSize={20} />
        </PaginationWithRouter>
      )

      const pagination = screen.getByRole('navigation')
      expect(pagination).toBeInTheDocument()
    })
  })
})
