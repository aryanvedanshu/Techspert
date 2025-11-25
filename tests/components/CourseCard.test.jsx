import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CourseCard from '../../src/components/CourseCard'

const mockCourse = {
  _id: '1',
  title: 'AI Fundamentals',
  description: 'Learn the basics of artificial intelligence and machine learning',
  thumbnailUrl: null,
  duration: '8 weeks',
  level: 'beginner',
  price: 299,
  rating: 4.8,
  studentsCount: 1250,
  tags: ['AI', 'Machine Learning', 'Python'],
  slug: 'ai-fundamentals'
}

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />)
    
    expect(screen.getByText('AI Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Learn the basics of artificial intelligence and machine learning')).toBeInTheDocument()
    expect(screen.getByText('beginner')).toBeInTheDocument()
    expect(screen.getByText('$299')).toBeInTheDocument()
    expect(screen.getByText('8 weeks')).toBeInTheDocument()
  })

  it('renders course tags', () => {
    render(<CourseCard course={mockCourse} />)
    
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('Machine Learning')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('renders learn more button', () => {
    render(<CourseCard course={mockCourse} />)
    
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('displays student count and rating', () => {
    render(<CourseCard course={mockCourse} />)
    
    expect(screen.getByText('1,250')).toBeInTheDocument()
    expect(screen.getByText('4.8')).toBeInTheDocument()
  })
})
