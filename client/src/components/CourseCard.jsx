import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users, Star, ArrowRight, Play } from 'lucide-react'
import Card from './UI/Card'
import Button from './UI/Button'

const CourseCard = ({ course, index = 0 }) => {
  const {
    _id,
    title,
    description,
    thumbnailUrl,
    duration,
    level,
    price,
    rating = 4.8,
    studentsCount = 1250,
    tags = [],
    slug
  } = course

  const getGradientClass = (index) => {
    const gradients = ['course-gradient', 'data-gradient', 'mern-gradient']
    return gradients[index % gradients.length]
  }

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card hover className="h-full flex flex-col group">
        {/* Thumbnail */}
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <div className={`aspect-video ${getGradientClass(index)} flex items-center justify-center`}>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center">
                <Play size={48} className="text-white/80" />
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(level)}`}>
              {level}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
            {title}
          </h3>

          {/* Description */}
          <p className="text-neutral-600 text-sm leading-relaxed mb-4 flex-1">
            {description?.length > 120 ? `${description.substring(0, 120)}...` : description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock size={16} />
                <span>{duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={16} />
                <span>{studentsCount.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span>{rating}</span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">${price}</span>
              <span className="text-sm text-neutral-500 line-through">${Math.round(price * 1.5)}</span>
            </div>
            <Link to={`/courses/${slug || _id}`}>
              <Button size="sm" className="group">
                Learn More
                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default CourseCard