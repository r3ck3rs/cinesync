import { render } from '@testing-library/react'
import NewPlanPage from '@/app/(feed)/plans/new/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

describe('New Plan page', () => {
  it('redirects to /feed', () => {
    expect(() => render(<NewPlanPage />)).toThrow('NEXT_REDIRECT:/feed')
  })
})
