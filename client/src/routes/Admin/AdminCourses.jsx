import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const AdminCourses = () => {
  const { isAuthenticated } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses')
        setCourses(response.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchCourses()
    }
  }, [isAuthenticated])

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${courseId}`)
        setCourses(courses.filter(course => course._id !== courseId))
      } catch (error) {
        console.error('Error deleting course:', error)
        alert('Failed to delete course')
      }
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-neutral-600 hover:text-neutral-900">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-heading font-bold text-neutral-900">
                  Manage Courses
                </h1>
                <p className="text-neutral-600">
                  Create, edit, and manage your course content
                </p>
              </div>
            </div>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Course
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-neutral-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  {/* Course Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {course.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-4 flex-1">
                      {course.description?.length > 100 
                        ? `${course.description.substring(0, 100)}...` 
                        : course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                      <span className="px-2 py-1 bg-neutral-100 rounded-lg">
                        {course.level}
                      </span>
                      <span>${course.price}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/courses/${course._id}`, '_blank')}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-2xl font-heading font-semibold text-neutral-900 mb-4">
              No courses yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Create your first course to get started
            </p>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Your First Course
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminCourses