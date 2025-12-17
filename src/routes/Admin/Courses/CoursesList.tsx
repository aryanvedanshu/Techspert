/**
 * CoursesList.tsx
 * 
 * Admin page for listing all courses with filtering, search, and actions.
 * 
 * @module routes/Admin/Courses/CoursesList
 */

import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Edit, Trash2, ToggleLeft, ToggleRight, Star } from 'lucide-react'
import { useCourses } from '../../../../hooks/useFirestoreCrud'
import { DataTable, Column, Button, StatusBadge, LevelBadge, FeaturedBadge, ConfirmDialog } from '../../../../components'
import { Course } from '../../../../types'
import { useToast } from '../../../../components/ui/Toast'
import { useAdminAuthContext } from '../../../../contexts/AdminAuthContext'

// ============================================================================
// COMPONENT
// ============================================================================

export default function CoursesList() {
    const navigate = useNavigate()
    const { success, error: toastError } = useToast()
    const { hasPermission } = useAdminAuthContext()

    // CRUD hook
    const {
        items: courses,
        loading,
        error,
        totalCount,
        fetchAll,
        update,
        remove,
        refresh,
    } = useCourses()

    // Local state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Handle search
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query)
        // Note: Full-text search would require Algolia or similar
        // For now, we filter client-side
    }, [])

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
        fetchAll({
            pagination: {
                limit: pageSize,
                orderBy: 'createdAt',
                orderDirection: 'desc',
            },
        })
    }, [fetchAll, pageSize])

    // Handle publish toggle
    const handleTogglePublish = async (course: Course) => {
        if (!hasPermission('courses.publish')) {
            toastError('Permission Denied', 'You do not have permission to publish courses')
            return
        }

        setActionLoading(true)
        try {
            await update(course.id, { isPublished: !course.isPublished })
            success(
                course.isPublished ? 'Course Unpublished' : 'Course Published',
                `${course.title} is now ${course.isPublished ? 'draft' : 'live'}`
            )
        } catch (err) {
            toastError('Error', 'Failed to update course status')
        }
        setActionLoading(false)
    }

    // Handle feature toggle
    const handleToggleFeatured = async (course: Course) => {
        setActionLoading(true)
        try {
            await update(course.id, { isFeatured: !course.isFeatured })
            success(
                course.isFeatured ? 'Removed from Featured' : 'Added to Featured',
                `${course.title} featured status updated`
            )
        } catch (err) {
            toastError('Error', 'Failed to update featured status')
        }
        setActionLoading(false)
    }

    // Handle delete
    const handleDelete = async () => {
        if (!selectedCourse) return

        setActionLoading(true)
        try {
            await remove(selectedCourse.id)
            success('Course Deleted', `${selectedCourse.title} has been deleted`)
            setDeleteModalOpen(false)
            setSelectedCourse(null)
        } catch (err) {
            toastError('Error', 'Failed to delete course')
        }
        setActionLoading(false)
    }

    // Confirm delete
    const confirmDelete = (course: Course) => {
        setSelectedCourse(course)
        setDeleteModalOpen(true)
    }

    // Filter courses by search
    const filteredCourses = searchQuery
        ? courses.filter(
            (c) =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : courses

    // Table columns
    const columns: Column<Course>[] = [
        {
            key: 'title',
            header: 'Course',
            sortable: true,
            render: (_, course) => (
                <div className="flex items-center gap-3">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-400">
                            📚
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-neutral-900">{course.title}</p>
                        <p className="text-sm text-neutral-500">{course.category}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'level',
            header: 'Level',
            render: (value) => <LevelBadge level={value as string} size="sm" />,
        },
        {
            key: 'price',
            header: 'Price',
            sortable: true,
            align: 'right',
            render: (_, course) => (
                <div className="text-right">
                    {course.discountPrice ? (
                        <>
                            <span className="text-neutral-400 line-through text-sm">₹{course.price}</span>
                            <span className="font-medium text-neutral-900 ml-2">₹{course.discountPrice}</span>
                        </>
                    ) : (
                        <span className="font-medium text-neutral-900">₹{course.price}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'isPublished',
            header: 'Status',
            render: (value) => (
                <StatusBadge
                    status={value ? 'published' : 'draft'}
                    dot
                    size="sm"
                />
            ),
        },
        {
            key: 'isFeatured',
            header: 'Featured',
            render: (value) => value ? <FeaturedBadge featured size="sm" /> : null,
        },
    ]

    // Row actions
    const rowActions = (course: Course) => (
        <div className="flex items-center gap-1 justify-end">
            <button
                onClick={() => navigate(`/admin/courses/${course.id}`)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="View"
            >
                <Eye size={16} className="text-neutral-500" />
            </button>

            {hasPermission('courses.edit') && (
                <button
                    onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Edit"
                >
                    <Edit size={16} className="text-neutral-500" />
                </button>
            )}

            {hasPermission('courses.publish') && (
                <button
                    onClick={() => handleTogglePublish(course)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    title={course.isPublished ? 'Unpublish' : 'Publish'}
                    disabled={actionLoading}
                >
                    {course.isPublished ? (
                        <ToggleRight size={16} className="text-green-500" />
                    ) : (
                        <ToggleLeft size={16} className="text-neutral-400" />
                    )}
                </button>
            )}

            <button
                onClick={() => handleToggleFeatured(course)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title={course.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                disabled={actionLoading}
            >
                <Star
                    size={16}
                    className={course.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-neutral-400'}
                />
            </button>

            {hasPermission('courses.delete') && (
                <button
                    onClick={() => confirmDelete(course)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                >
                    <Trash2 size={16} className="text-red-500" />
                </button>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Courses</h1>
                    <p className="text-neutral-500 mt-1">Manage your course catalog</p>
                </div>

                {hasPermission('courses.create') && (
                    <Button
                        onClick={() => navigate('/admin/courses/new')}
                        icon={<Plus size={18} />}
                    >
                        Add Course
                    </Button>
                )}
            </div>

            {/* Error display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Data table */}
            <DataTable
                columns={columns}
                data={filteredCourses}
                loading={loading}
                totalItems={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={setPageSize}
                onSearch={handleSearch}
                searchPlaceholder="Search courses..."
                actions={rowActions}
                emptyMessage="No courses found"
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false)
                    setSelectedCourse(null)
                }}
                onConfirm={handleDelete}
                title="Delete Course"
                message={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                loading={actionLoading}
            />
        </div>
    )
}
