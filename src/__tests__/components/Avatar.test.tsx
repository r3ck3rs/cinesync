import React from 'react'
import { render, screen } from '@testing-library/react'
import Avatar from '@/components/Avatar'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

describe('Avatar', () => {
  it('renders initials "PR" for firstName="Peter" lastName="Reckers"', () => {
    const { container } = render(
      <Avatar userId="user-1" firstName="Peter" lastName="Reckers" />
    )
    expect(container).toHaveTextContent('PR')
  })

  it('renders "?" when no name given', () => {
    const { container } = render(<Avatar userId="user-2" />)
    expect(container).toHaveTextContent('?')
  })

  it('renders an image when avatarUrl is provided', () => {
    render(
      <Avatar
        userId="user-3"
        firstName="A"
        lastName="B"
        avatarUrl="https://example.com/avatar.jpg"
      />
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('color is deterministic — same userId always gets same color class', () => {
    const userId = 'deterministic-user-id'
    const { container: c1 } = render(<Avatar userId={userId} firstName="Alice" />)
    const { container: c2 } = render(<Avatar userId={userId} firstName="Bob" />)

    const div1 = c1.querySelector('div')
    const div2 = c2.querySelector('div')

    const bgClass1 = Array.from(div1!.classList).find((c) => c.startsWith('bg-['))
    const bgClass2 = Array.from(div2!.classList).find((c) => c.startsWith('bg-['))

    expect(bgClass1).toBeDefined()
    expect(bgClass1).toBe(bgClass2)
  })

  it('does not use any purple, violet, pink or colored Tailwind classes', () => {
    const { container } = render(<Avatar userId="user-color-check" firstName="X" />)
    const div = container.querySelector('div')
    const classes = Array.from(div!.classList).join(' ')
    expect(classes).not.toMatch(/violet|purple|pink|rose|emerald|teal|amber|orange|blue/)
  })
})
