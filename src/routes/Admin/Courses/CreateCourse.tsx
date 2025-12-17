/**
 * CreateCourse.tsx
 * 
 * Page for creating a new course.
 * 
 * @module routes/Admin/Courses/CreateCourse
 */

import React from 'react'
import { useCourses } from '../../../../hooks/useFirestoreCrud'
import CourseForm from './CourseForm'
import { CourseFormData } from '../../../../types'
import { AdminGuard } from '../../../../contexts/AdminAuthContext'

export default function CreateCourse() {
    const { create, loading } = useCourses({ autoFetch: false })

    const handleSubmit = async (data: CourseFormData) => {
        await create(data)
    }

    return (
        <AdminGuard permission="courses.create" fallback={<AccessDenied />}>
            <CourseForm onSubmit={handleSubmit} loading={loading} />
        </AdminGuard>
    )
}

function AccessDenied() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900">Access Denied</h2>
                <p className="text-neutral-500 mt-2">You do not have permission to create courses.</p>
            </div>
        </div>
    )
}
