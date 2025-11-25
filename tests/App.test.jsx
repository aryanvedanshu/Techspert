import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../src/App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Techspert')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<App />)
    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Alumni')).toBeInTheDocument()
  })

  it('renders admin login link', () => {
    render(<App />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })
})
