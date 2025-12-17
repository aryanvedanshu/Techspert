/**
 * CourseForm.tsx
 * 
 * Shared form component for creating and editing courses.
 * Uses FormField for type-mapped inputs and FileUpload for thumbnail.
 * 
 * @module routes/Admin/Courses/CourseForm
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import { FormField, FileUpload, Button } from '../../../../components'
import { Course, CourseFormData, SyllabusItem } from '../../../../types'
import { useTrainers } from '../../../../hooks/useFirestoreCrud'
import { useCategories } from '../../../../hooks/useFirestoreCrud'
import { uploadCourseThumbnail } from '../../../../services/storageTyped.service'
import { useToast } from '../../../../components/ui/Toast'

// ============================================================================
// TYPES
// ============================================================================

interface CourseFormProps {
    course?: Course | null
    onSubmit: (data: CourseFormData) => Promise<void>
    loading?: boolean
}

// ============================================================================
// INITIAL FORM STATE
// ============================================================================

const initialFormState: CourseFormData = {
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'Beginner',
    price: 0,
    discountPrice: undefined,
    duration: '',
    instructor: '',
    thumbnail: '',
    isPublished: false,
    isFeatured: false,
    position: 0,
    syllabus: [],
    skills: [],
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CourseForm({ course, onSubmit, loading = false }: CourseFormProps) {
    const navigate = useNavigate()
    const { success, error: toastError } = useToast()

    // Form state
    const [formData, setFormData] = useState<CourseFormData>(initialFormState)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    // Fetch trainers and categories for dropdowns
    const { items: trainers } = useTrainers({ autoFetch: true })
    const { items: categories } = useCategories({ autoFetch: true })

    // Populate form when editing
    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                slug: course.slug,
                description: course.description,
                shortDescription: course.shortDescription,
                category: course.category,
                level: course.level,
                price: course.price,
                discountPrice: course.discountPrice,
                duration: course.duration,
                instructor: course.instructor,
                thumbnail: course.thumbnail,
                isPublished: course.isPublished,
                isFeatured: course.isFeatured,
                position: course.position,
                syllabus: course.syllabus || [],
                skills: course.skills || [],
            })
        }
    }, [course])

    // Handle field change
    const handleChange = (field: keyof CourseFormData, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }))

        // Clear error when field is changed
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev }
                delete next[field]
                return next
            })
        }

        // Auto-generate slug from title
        if (field === 'title' && typeof value === 'string') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            setFormData((prev) => ({ ...prev, slug }))
        }
    }

    // Handle thumbnail upload
    const handleThumbnailUpload = async (
        file: File,
        onProgress: (progress: number) => void
    ): Promise<string> => {
        const result = await uploadCourseThumbnail(
            file,
            course?.id || 'new-course',
            (p) => onProgress(p.percentage)
        )
        return result.url
    }

    // Handle syllabus item change
    const handleSyllabusChange = (index: number, field: keyof SyllabusItem, value: string) => {
        setFormData((prev) => {
            const newSyllabus = [...prev.syllabus]
            newSyllabus[index] = { ...newSyllabus[index], [field]: value }
            return { ...prev, syllabus: newSyllabus }
        })
    }

    // Add syllabus item
    const addSyllabusItem = () => {
        setFormData((prev) => ({
            ...prev,
            syllabus: [...prev.syllabus, { title: '', content: '', duration: '' }],
        }))
    }

    // Remove syllabus item
    const removeSyllabusItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            syllabus: prev.syllabus.filter((_, i) => i !== index),
        }))
    }

    // Validate form
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }
        if (!formData.category) {
            newErrors.category = 'Category is required'
        }
        if (formData.price < 0) {
            newErrors.price = 'Price must be positive'
        }
        if (formData.discountPrice !== undefined && formData.discountPrice >= formData.price) {
            newErrors.discountPrice = 'Discount price must be less than regular price'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) {
            toastError('Validation Error', 'Please fix the errors in the form')
            return
        }

        setSubmitting(true)
        try {
            await onSubmit(formData)
            success(
                course ? 'Course Updated' : 'Course Created',
                `${formData.title} has been ${course ? 'updated' : 'created'} successfully`
            )
            navigate('/admin/courses')
        } catch (err) {
            toastError('Error', `Failed to ${course ? 'update' : 'create'} course`)
        }
        setSubmitting(false)
    }

    // Trainer options
    const trainerOptions = trainers.map((t) => ({
        value: t.id,
        label: t.name,
    }))

    // Category options
    const categoryOptions = categories.map((c) => ({
        value: c.name,
        label: c.name,
    }))

    // Level options
    const levelOptions = [
        { value: 'Beginner', label: 'Beginner' },
        { value: 'Intermediate', label: 'Intermediate' },
        { value: 'Advanced', label: 'Advanced' },
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/courses')}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            {course ? 'Edit Course' : 'New Course'}
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            {course ? 'Update course details' : 'Add a new course to your catalog'}
                        </p>
                    </div>
                </div>

                <Button
                    type="submit"
                    loading={submitting || loading}
                    icon={<Save size={18} />}
                >
                    {course ? 'Save Changes' : 'Create Course'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic info card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
                        <h2 className="font-semibold text-neutral-900">Basic Information</h2>

                        <FormField
                            name="title"
                            label="Course Title"
                            value={formData.title}
                            onChange={(v) => handleChange('title', v)}
                            error={errors.title}
                            placeholder="e.g., Complete React Developer Course"
                            required
                        />

                        <FormField
                            name="slug"
                            label="URL Slug"
                            value={formData.slug}
                            onChange={(v) => handleChange('slug', v)}
                            placeholder="complete-react-developer-course"
                            helperText="Auto-generated from title"
                        />

                        <FormField
                            name="shortDescription"
                            label="Short Description"
                            type="textarea"
                            value={formData.shortDescription}
                            onChange={(v) => handleChange('shortDescription', v)}
                            rows={2}
                            placeholder="Brief overview for course cards"
                        />

                        <FormField
                            name="description"
                            label="Full Description"
                            type="textarea"
                            value={formData.description}
                            onChange={(v) => handleChange('description', v)}
                            rows={6}
                            placeholder="Detailed course description (supports HTML)"
                        />
                    </div>

                    {/* Syllabus card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-neutral-900">Syllabus</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSyllabusItem}
                                icon={<Plus size={16} />}
                            >
                                Add Module
                            </Button>
                        </div>

                        {formData.syllabus.length === 0 ? (
                            <p className="text-neutral-500 text-sm py-4 text-center">
                                No modules added yet. Click "Add Module" to start building your syllabus.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {formData.syllabus.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border border-neutral-200 rounded-lg p-4 space-y-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <button type="button" className="p-1 text-neutral-400 cursor-grab">
                                                <GripVertical size={16} />
                                            </button>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={item.title}
                                                            onChange={(e) => handleSyllabusChange(index, 'title', e.target.value)}
                                                            placeholder="Module title"
                                                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={item.duration}
                                                        onChange={(e) => handleSyllabusChange(index, 'duration', e.target.value)}
                                                        placeholder="Duration"
                                                        className="w-24 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                                    />
                                                </div>
                                                <textarea
                                                    value={item.content}
                                                    onChange={(e) => handleSyllabusChange(index, 'content', e.target.value)}
                                                    placeholder="Module content/topics"
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSyllabusItem(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                        <h2 className="font-semibold text-neutral-900">Status</h2>

                        <FormField
                            name="isPublished"
                            label="Published"
                            type="switch"
                            value={formData.isPublished}
                            onChange={(v) => handleChange('isPublished', v)}
                            placeholder="Make this course visible to students"
                        />

                        <FormField
                            name="isFeatured"
                            label="Featured"
                            type="switch"
                            value={formData.isFeatured}
                            onChange={(v) => handleChange('isFeatured', v)}
                            placeholder="Show on homepage"
                        />
                    </div>

                    {/* Thumbnail card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                        <h2 className="font-semibold text-neutral-900">Thumbnail</h2>

                        <FileUpload
                            value={formData.thumbnail}
                            onChange={(url) => handleChange('thumbnail', url)}
                            onUpload={handleThumbnailUpload}
                            accept="image/*"
                            maxSize={2}
                            showPreview
                            previewSize="lg"
                        />
                    </div>

                    {/* Details card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                        <h2 className="font-semibold text-neutral-900">Details</h2>

                        <FormField
                            name="category"
                            label="Category"
                            type="select"
                            value={formData.category}
                            onChange={(v) => handleChange('category', v)}
                            options={categoryOptions}
                            error={errors.category}
                            required
                        />

                        <FormField
                            name="level"
                            label="Level"
                            type="select"
                            value={formData.level}
                            onChange={(v) => handleChange('level', v)}
                            options={levelOptions}
                        />

                        <FormField
                            name="instructor"
                            label="Instructor"
                            type="select"
                            value={formData.instructor}
                            onChange={(v) => handleChange('instructor', v)}
                            options={trainerOptions}
                        />

                        <FormField
                            name="duration"
                            label="Duration"
                            value={formData.duration}
                            onChange={(v) => handleChange('duration', v)}
                            placeholder="e.g., 40 hours"
                        />
                    </div>

                    {/* Pricing card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                        <h2 className="font-semibold text-neutral-900">Pricing</h2>

                        <FormField
                            name="price"
                            label="Regular Price (₹)"
                            type="number"
                            value={formData.price}
                            onChange={(v) => handleChange('price', v)}
                            error={errors.price}
                            min={0}
                        />

                        <FormField
                            name="discountPrice"
                            label="Discount Price (₹)"
                            type="number"
                            value={formData.discountPrice}
                            onChange={(v) => handleChange('discountPrice', v)}
                            error={errors.discountPrice}
                            min={0}
                            helperText="Leave empty for no discount"
                        />
                    </div>

                    {/* Skills card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                        <h2 className="font-semibold text-neutral-900">Skills</h2>

                        <FormField
                            name="skills"
                            label="Technologies & Skills"
                            type="tags"
                            value={formData.skills}
                            onChange={(v) => handleChange('skills', v)}
                            placeholder="Press Enter to add"
                        />
                    </div>
                </div>
            </div>
        </form>
    )
}
