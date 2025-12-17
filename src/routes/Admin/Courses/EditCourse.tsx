/**
 * EditCourse.tsx
 * 
 * Page for editing an existing course.
 * 
 * @module routes/Admin/Courses/EditCourse
 */

import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourses } from '../../../../hooks/useFirestoreCrud'
import CourseForm from './CourseForm'
import { CourseFormData } from '../../../../types'
import { AdminGuard } from '../../../../contexts/AdminAuthContext'
import { Loader2 } from 'lucide-react'

export default function EditCourse() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { currentItem: course, itemLoading, fetchOne, update, loading } = useCourses({ autoFetch: false })

    // Fetch course on mount
    useEffect(() => {
        if (id) {
            fetchOne(id).catch(() => {
                navigate('/admin/courses')
            })
        }
    }, [id, fetchOne, navigate])

    const handleSubmit = async (data: CourseFormData) => {
        if (!id) return
        await update(id, data)
    }

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
        <AdminGuard permission="courses.edit" fallback={<AccessDenied />}>
            <CourseForm course={course} onSubmit={handleSubmit} loading={loading} />
        </AdminGuard>
    )
}

function AccessDenied() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900">Access Denied</h2>
                <p className="text-neutral-500 mt-2">You do not have permission to edit courses.</p>
            </div>
        </div>
    )
}
