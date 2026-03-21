import React from 'react'
import { render } from '@testing-library/react'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

import BottomNav from '@/components/BottomNav'

describe('BottomNav', () => {
  it('renders without crashing', () => {
    const { container } = render(<BottomNav active="feed" />)
    expect(container).toBeTruthy()
  })

  it('active item has no hardcoded purple color', () => {
    const { container } = render(<BottomNav active="feed" />)
    const html = container.innerHTML
    expect(html).not.toContain('#9b8ef7')
    expect(html).not.toContain('#7c6ff7')
    expect(html).not.toContain('rgba(124,111,247')
  })

  it('uses var(--text) for active item color', () => {
    const { container } = render(<BottomNav active="feed" />)
    expect(container.innerHTML).toContain('var(--text)')
  })
})
