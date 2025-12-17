import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Video, Link as LinkIcon, Save, RefreshCw, ExternalLink,
    Users, FileText, CreditCard, Edit2, Check, X
} from 'lucide-react'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { firebaseService } from '../../services/firebaseService'
import { saveDemoLink } from '../../services/leadTrackingService'
import logger from '../../utils/logger'

const AdminDemoClassManagement = () => {
    const [courses, setCourses] = useState([])
    const [demoLinks, setDemoLinks] = useState({})
    const [editingCourse, setEditingCourse] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ clicked: 0, submitted: 0, paid: 0 })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch all courses
            const coursesResult = await firebaseService.getDocuments('courses', [], 'title', 'asc')
            if (coursesResult.success) {
                setCourses(coursesResult.data || [])
            }

            // Fetch all demo links
            const linksResult = await firebaseService.getDocuments('demo_links')
            if (linksResult.success) {
                const linkMap = {}
                linksResult.data?.forEach(link => {
                    linkMap[link.courseId || link.id] = link
                })
                setDemoLinks(linkMap)
            }

            // Fetch lead tracking stats
            const clickedResult = await firebaseService.getDocuments('lead_tracking',
                [{ field: 'stage', operator: '==', value: 'clicked' }])
            const submittedResult = await firebaseService.getDocuments('lead_tracking',
                [{ field: 'stage', operator: '==', value: 'submitted' }])
            const paidResult = await firebaseService.getDocuments('lead_tracking',
                [{ field: 'stage', operator: '==', value: 'paid' }])

            setStats({
                clicked: clickedResult.data?.length || 0,
                submitted: submittedResult.data?.length || 0,
                paid: paidResult.data?.length || 0,
            })
        } catch (error) {
            logger.error('Error fetching demo data', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const startEditing = (course) => {
        const existing = demoLinks[course.id] || {}
        setEditingCourse(course.id)
        setEditForm({
            demoMeetLink: existing.demoMeetLink || '',
            leadClickLink: existing.leadClickLink || '',
            formSubmitLink: existing.formSubmitLink || '',
            paymentSubmitLink: existing.paymentSubmitLink || '',
        })
    }

    const cancelEditing = () => {
        setEditingCourse(null)
        setEditForm({})
    }

    const handleSave = async (courseId) => {
        setSaving(true)
        try {
            const result = await saveDemoLink(courseId, editForm)
            if (result.success) {
                toast.success('Demo links saved for course')
                setDemoLinks(prev => ({
                    ...prev,
                    [courseId]: { ...editForm, courseId }
                }))
                setEditingCourse(null)
                setEditForm({})
            } else {
                toast.error('Failed to save demo links')
            }
        } catch (error) {
            logger.error('Error saving demo links', error)
            toast.error('Failed to save demo links')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="container-custom">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                        <div className="h-64 bg-neutral-200 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-heading font-bold text-neutral-900">
                                Demo Class Links
                            </h1>
                            <p className="text-neutral-600">
                                Manage demo links for each course
                            </p>
                        </div>
                        <Button onClick={fetchData}>
                            <RefreshCw size={16} className="mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="text-center">
                        <div className="p-4">
                            <Users className="mx-auto text-blue-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-blue-600">{stats.clicked}</div>
                            <div className="text-sm text-neutral-600">Link Clicks</div>
                        </div>
                    </Card>
                    <Card className="text-center">
                        <div className="p-4">
                            <FileText className="mx-auto text-purple-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-purple-600">{stats.submitted}</div>
                            <div className="text-sm text-neutral-600">Form Submissions</div>
                        </div>
                    </Card>
                    <Card className="text-center">
                        <div className="p-4">
                            <CreditCard className="mx-auto text-green-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                            <div className="text-sm text-neutral-600">Payments</div>
                        </div>
                    </Card>
                </div>

                {/* Per-Course Demo Links Table */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Video size={20} />
                            Course Demo Links
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Course</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Demo Meet Link</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Click Tracking</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Form Link</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Payment Link</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {courses.map((course) => {
                                        const links = demoLinks[course.id] || {}
                                        const isEditing = editingCourse === course.id

                                        return (
                                            <tr key={course.id} className="hover:bg-neutral-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-neutral-900">{course.title}</div>
                                                    <div className="text-xs text-neutral-500">{course.category}</div>
                                                </td>

                                                {isEditing ? (
                                                    <>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="url"
                                                                placeholder="Google Meet link"
                                                                value={editForm.demoMeetLink}
                                                                onChange={(e) => setEditForm({ ...editForm, demoMeetLink: e.target.value })}
                                                                className="w-full px-2 py-1 text-sm border rounded"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="url"
                                                                placeholder="Click tracking link"
                                                                value={editForm.leadClickLink}
                                                                onChange={(e) => setEditForm({ ...editForm, leadClickLink: e.target.value })}
                                                                className="w-full px-2 py-1 text-sm border rounded"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="url"
                                                                placeholder="Form submission link"
                                                                value={editForm.formSubmitLink}
                                                                onChange={(e) => setEditForm({ ...editForm, formSubmitLink: e.target.value })}
                                                                className="w-full px-2 py-1 text-sm border rounded"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="url"
                                                                placeholder="Payment form link"
                                                                value={editForm.paymentSubmitLink}
                                                                onChange={(e) => setEditForm({ ...editForm, paymentSubmitLink: e.target.value })}
                                                                className="w-full px-2 py-1 text-sm border rounded"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSave(course.id)}
                                                                    disabled={saving}
                                                                >
                                                                    <Check size={14} />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    <X size={14} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3">
                                                            {links.demoMeetLink ? (
                                                                <a href={links.demoMeetLink} target="_blank" rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                                                    <ExternalLink size={12} />
                                                                    Open Link
                                                                </a>
                                                            ) : (
                                                                <span className="text-neutral-400 text-sm">Not set</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {links.leadClickLink ? (
                                                                <span className="text-green-600 text-sm">✓ Set</span>
                                                            ) : (
                                                                <span className="text-neutral-400 text-sm">Not set</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {links.formSubmitLink ? (
                                                                <span className="text-green-600 text-sm">✓ Set</span>
                                                            ) : (
                                                                <span className="text-neutral-400 text-sm">Not set</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {links.paymentSubmitLink ? (
                                                                <span className="text-green-600 text-sm">✓ Set</span>
                                                            ) : (
                                                                <span className="text-neutral-400 text-sm">Not set</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => startEditing(course)}
                                                            >
                                                                <Edit2 size={14} className="mr-1" />
                                                                Edit
                                                            </Button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {courses.length === 0 && (
                                <p className="text-center py-8 text-neutral-500">
                                    No courses found. Add courses first.
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default AdminDemoClassManagement
