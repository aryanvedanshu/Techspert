/**
 * ViewCourse.tsx
 * 
 * Page for viewing course details.
 * 
 * @module routes/Admin/Courses/ViewCourse
 */

import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Eye, ExternalLink, Clock, User, BookOpen, Tag } from 'lucide-react'
import { useCourses, useTrainers } from '../../../../hooks/useFirestoreCrud'
import { Button, StatusBadge, LevelBadge, FeaturedBadge, Card } from '../../../../components'
import { Loader2 } from 'lucide-react'
import { useAdminAuthContext } from '../../../../contexts/AdminAuthContext'

export default function ViewCourse() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { hasPermission } = useAdminAuthContext()

    const { currentItem: course, itemLoading, fetchOne } = useCourses({ autoFetch: false })
    const { items: trainers } = useTrainers({ autoFetch: true })

    // Fetch course on mount
    useEffect(() => {
        if (id) {
            fetchOne(id).catch(() => {
                navigate('/admin/courses')
            })
        }
    }, [id, fetchOne, navigate])

    // Get instructor name
    const instructor = trainers.find((t) => t.id === course?.instructor)

    if (itemLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 size={32} className="animate-spin text-primary-600" />
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-neutral-900">Course Not Found</h2>
                    <p className="text-neutral-500 mt-2">The course you're looking for doesn't exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-neutral-900">{course.title}</h1>
                            <StatusBadge
                                status={course.isPublished ? 'published' : 'draft'}
                                dot
                            />
                            {course.isFeatured && <FeaturedBadge featured />}
                        </div>
                        <p className="text-neutral-500 mt-1">/{course.slug}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => window.open(`/courses/${course.slug}`, '_blank')}
                        icon={<ExternalLink size={18} />}
                    >
                        View Live
                    </Button>

                    {hasPermission('courses.edit') && (
                        <Button
                            onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                            icon={<Edit size={18} />}
                        >
                            Edit Course
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Thumbnail */}
                    {course.thumbnail && (
                        <Card padding="none">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full aspect-video object-cover rounded-xl"
                            />
                        </Card>
                    )}

                    {/* Description */}
                    <Card>
                        <h2 className="font-semibold text-neutral-900 mb-4">Description</h2>
                        <p className="text-neutral-600 whitespace-pre-wrap">{course.shortDescription}</p>
                        {course.description && (
                            <div
                                className="mt-4 prose prose-neutral max-w-none"
                                dangerouslySetInnerHTML={{ __html: course.description }}
                            />
                        )}
                    </Card>

                    {/* Syllabus */}
                    {course.syllabus && course.syllabus.length > 0 && (
                        <Card>
                            <h2 className="font-semibold text-neutral-900 mb-4">Syllabus</h2>
                            <div className="space-y-4">
                                {course.syllabus.map((module, index) => (
                                    <div key={index} className="border border-neutral-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <h3 className="font-medium text-neutral-900">{module.title}</h3>
                                                    {module.content && (
                                                        <p className="text-sm text-neutral-500 mt-1">{module.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {module.duration && (
                                                <span className="text-sm text-neutral-500 flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {module.duration}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details card */}
                    <Card>
                        <h2 className="font-semibold text-neutral-900 mb-4">Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500 flex items-center gap-2">
                                    <Tag size={16} />
                                    Category
                                </span>
                                <span className="font-medium">{course.category}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500 flex items-center gap-2">
                                    <BookOpen size={16} />
                                    Level
                                </span>
                                <LevelBadge level={course.level} size="sm" />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500 flex items-center gap-2">
                                    <Clock size={16} />
                                    Duration
                                </span>
                                <span className="font-medium">{course.duration || 'N/A'}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500 flex items-center gap-2">
                                    <User size={16} />
                                    Instructor
                                </span>
                                <span className="font-medium">{instructor?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Pricing card */}
                    <Card>
                        <h2 className="font-semibold text-neutral-900 mb-4">Pricing</h2>
                        <div className="space-y-2">
                            {course.discountPrice ? (
                                <>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-neutral-900">
                                            ₹{course.discountPrice.toLocaleString()}
                                        </span>
                                        <span className="text-neutral-400 line-through">
                                            ₹{course.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-green-600 text-sm font-medium">
                                        Save ₹{(course.price - course.discountPrice).toLocaleString()}
                                        ({Math.round((1 - course.discountPrice / course.price) * 100)}% off)
                                    </p>
                                </>
                            ) : (
                                <span className="text-3xl font-bold text-neutral-900">
                                    ₹{course.price.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </Card>

                    {/* Skills card */}
                    {course.skills && course.skills.length > 0 && (
                        <Card>
                            <h2 className="font-semibold text-neutral-900 mb-4">Skills Covered</h2>
                            <div className="flex flex-wrap gap-2">
                                {course.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
