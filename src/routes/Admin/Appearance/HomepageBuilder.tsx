/**
 * HomepageBuilder.tsx
 * 
 * Admin page for customizing the homepage layout and sections.
 * 
 * Features:
 * - Section ordering via drag-and-drop
 * - Enable/disable sections
 * - Section-specific settings
 * - Preview link
 * 
 * @module routes/Admin/Appearance/HomepageBuilder
 */

import React, { useState, useEffect } from 'react'
import {
    Save,
    GripVertical,
    Eye,
    EyeOff,
    ExternalLink,
    Image,
    BookOpen,
    Users,
    Star,
    MessageSquare,
    Award,
    Briefcase,
    HelpCircle,
} from 'lucide-react'
import { Button, Card, CardHeader, StatusBadge } from '../../../../components'
import { homepageService } from '../../../../services/firestoreTyped.service'
import { useToast } from '../../../../components/ui/Toast'
import { HomepageConfig, HomepageSection } from '../../../../types'
import { AdminGuard } from '../../../../contexts/AdminAuthContext'

// ============================================================================
// SECTION DEFINITIONS
// ============================================================================

interface SectionDefinition {
    id: string
    name: string
    description: string
    icon: React.ReactNode
}

const sectionDefinitions: SectionDefinition[] = [
    {
        id: 'hero',
        name: 'Hero Banner',
        description: 'Main banner with CTA',
        icon: <Image size={20} />
    },
    {
        id: 'featured-courses',
        name: 'Featured Courses',
        description: 'Highlight top courses',
        icon: <BookOpen size={20} />
    },
    {
        id: 'about',
        name: 'About Section',
        description: 'Company introduction',
        icon: <Users size={20} />
    },
    {
        id: 'stats',
        name: 'Statistics',
        description: 'Key numbers & metrics',
        icon: <Award size={20} />
    },
    {
        id: 'testimonials',
        name: 'Testimonials',
        description: 'Student reviews',
        icon: <MessageSquare size={20} />
    },
    {
        id: 'trainers',
        name: 'Our Trainers',
        description: 'Team showcase',
        icon: <Users size={20} />
    },
    {
        id: 'alumni',
        name: 'Alumni Success',
        description: 'Graduate stories',
        icon: <Star size={20} />
    },
    {
        id: 'projects',
        name: 'Student Projects',
        description: 'Portfolio showcase',
        icon: <Briefcase size={20} />
    },
    {
        id: 'faq',
        name: 'FAQ',
        description: 'Common questions',
        icon: <HelpCircle size={20} />
    },
    {
        id: 'cta',
        name: 'Call to Action',
        description: 'Final conversion section',
        icon: <ExternalLink size={20} />
    },
]

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const defaultSections: HomepageSection[] = sectionDefinitions.map((def, index) => ({
    id: def.id,
    enabled: true,
    order: index,
    settings: {},
}))

// ============================================================================
// COMPONENT
// ============================================================================

export default function HomepageBuilder() {
    const { success, error: toastError } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [sections, setSections] = useState<HomepageSection[]>(defaultSections)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    // Fetch homepage config on mount
    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true)
            try {
                const data = await homepageService.get()
                if (data?.sections) {
                    // Merge with defaults to ensure all sections exist
                    const merged = sectionDefinitions.map((def, i) => {
                        const existing = data.sections.find((s) => s.id === def.id)
                        return existing || { id: def.id, enabled: true, order: i, settings: {} }
                    })
                    // Sort by order
                    merged.sort((a, b) => a.order - b.order)
                    setSections(merged)
                }
            } catch (err) {
                toastError('Error', 'Failed to load homepage config')
            }
            setLoading(false)
        }

        fetchConfig()
    }, [])

    // Toggle section enabled
    const toggleSection = (id: string) => {
        setSections((prev) =>
            prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
        )
    }

    // Handle drag start
    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    // Handle drag over
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        // Reorder sections
        setSections((prev) => {
            const newSections = [...prev]
            const draggedItem = newSections[draggedIndex]
            newSections.splice(draggedIndex, 1)
            newSections.splice(index, 0, draggedItem)
            // Update order values
            return newSections.map((s, i) => ({ ...s, order: i }))
        })
        setDraggedIndex(index)
    }

    // Handle drag end
    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    // Save config
    const handleSave = async () => {
        setSaving(true)
        try {
            await homepageService.update({ sections })
            success('Saved', 'Homepage layout has been updated')
        } catch (err) {
            toastError('Error', 'Failed to save homepage config')
        }
        setSaving(false)
    }

    // Get section definition
    const getSectionDef = (id: string) =>
        sectionDefinitions.find((s) => s.id === id)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <AdminGuard permission="homepage.edit" fallback={<ViewOnly />}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Homepage Builder</h1>
                        <p className="text-neutral-500 mt-1">Customize your homepage layout and sections</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.open('/', '_blank')}
                            icon={<ExternalLink size={18} />}
                        >
                            Preview
                        </Button>
                        <Button onClick={handleSave} loading={saving} icon={<Save size={18} />}>
                            Save Layout
                        </Button>
                    </div>
                </div>

                {/* Instructions */}
                <Card padding="sm" className="bg-primary-50 border-primary-100">
                    <p className="text-sm text-primary-700">
                        <strong>Tip:</strong> Drag sections to reorder them. Click the eye icon to show/hide sections on the homepage.
                    </p>
                </Card>

                {/* Sections list */}
                <Card>
                    <CardHeader title="Homepage Sections" subtitle="Drag to reorder, toggle to enable/disable" />
                    <div className="mt-4 space-y-2">
                        {sections.map((section, index) => {
                            const def = getSectionDef(section.id)
                            if (!def) return null

                            return (
                                <div
                                    key={section.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`
                    flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-grab
                    ${draggedIndex === index
                                            ? 'border-primary-400 bg-primary-50'
                                            : 'border-neutral-200 hover:border-neutral-300'
                                        }
                    ${!section.enabled ? 'opacity-50' : ''}
                  `}
                                >
                                    {/* Drag handle */}
                                    <div className="text-neutral-400">
                                        <GripVertical size={20} />
                                    </div>

                                    {/* Order number */}
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-600">
                                        {index + 1}
                                    </div>

                                    {/* Icon */}
                                    <div className={`p-2 rounded-lg ${section.enabled ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-400'}`}>
                                        {def.icon}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <p className="font-medium text-neutral-900">{def.name}</p>
                                        <p className="text-sm text-neutral-500">{def.description}</p>
                                    </div>

                                    {/* Status */}
                                    <StatusBadge
                                        status={section.enabled ? 'active' : 'inactive'}
                                        size="sm"
                                        dot
                                    />

                                    {/* Toggle */}
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className={`p-2 rounded-lg transition-colors ${section.enabled
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-neutral-400 hover:bg-neutral-100'
                                            }`}
                                        title={section.enabled ? 'Hide section' : 'Show section'}
                                    >
                                        {section.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </Card>

                {/* Enabled count */}
                <p className="text-sm text-neutral-500 text-center">
                    {sections.filter((s) => s.enabled).length} of {sections.length} sections enabled
                </p>
            </div>
        </AdminGuard>
    )
}

function ViewOnly() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900">View Only</h2>
                <p className="text-neutral-500 mt-2">You do not have permission to edit the homepage.</p>
            </div>
        </div>
    )
}
