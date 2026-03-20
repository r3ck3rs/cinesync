import { render } from '@testing-library/react'
import PlansPage from '@/app/(feed)/plans/page'

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

describe('Plans page', () => {
  it('redirects to /feed', () => {
    expect(() => render(<PlansPage />)).toThrow('NEXT_REDIRECT:/feed')
  })
})
