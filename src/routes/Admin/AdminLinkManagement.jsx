/**
 * Admin Link Management
 * Matches Image 1: Course Demo Links management with stats cards
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Link2, MousePointerClick, FileText, CreditCard,
    Edit2, Save, X, ExternalLink, Check, AlertCircle,
    Loader2, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { coursesService } from '../../services/firebaseService'
import {
    courseLinksService,
    linkClicksService,
    formSubmissionsService,
    crmPaymentsService,
    leadAnalyticsService
} from '../../services/leadTrackingService'

const AdminLinkManagement = () => {
    const [courses, setCourses] = useState([])
    const [courseLinks, setCourseLinks] = useState({})
    const [stats, setStats] = useState({
        linkClicks: 0,
        formSubmissions: 0,
        payments: 0
    })
    const [loading, setLoading] = useState(true)
    const [editingCourse, setEditingCourse] = useState(null)
    const [editForm, setEditForm] = useState({
        demoMeetLink: '',
        formLink: '',
        paymentLink: '',
        trackingEnabled: true
    })
    const [saving, setSaving] = useState(false)

    // Fetch all data
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch courses
            const coursesResult = await coursesService.getAll()
            if (coursesResult.success) {
                setCourses(coursesResult.data || [])
            }

            // Fetch course links
            const linksResult = await courseLinksService.getAll()
            if (linksResult.success) {
                const linksMap = {}
                linksResult.data.forEach(link => {
                    linksMap[link.courseId] = link
                })
                setCourseLinks(linksMap)
            }

            // Fetch stats
            const statsResult = await leadAnalyticsService.getDashboardStats()
            if (statsResult.success) {
                setStats({
                    linkClicks: statsResult.data.demoClicks || 0,
                    formSubmissions: statsResult.data.formSubmissions || 0,
                    payments: statsResult.data.payments || 0
                })
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (course) => {
        const existingLink = courseLinks[course.id] || {}
        setEditForm({
            demoMeetLink: existingLink.demoMeetLink || '',
            formLink: existingLink.formLink || '',
            paymentLink: existingLink.paymentLink || '',
            trackingEnabled: existingLink.trackingEnabled !== false
        })
        setEditingCourse(course)
    }

    const handleSave = async () => {
        if (!editingCourse) return

        setSaving(true)
        try {
            const result = await courseLinksService.upsert(editingCourse.id, {
                ...editForm,
                courseName: editingCourse.title || editingCourse.name
            })

            if (result.success) {
                toast.success('Links saved successfully')
                setCourseLinks(prev => ({
                    ...prev,
                    [editingCourse.id]: {
                        ...editForm,
                        courseId: editingCourse.id,
                        courseName: editingCourse.title || editingCourse.name
                    }
                }))
                setEditingCourse(null)
            } else {
                toast.error('Failed to save links')
            }
        } catch (error) {
            console.error('Error saving links:', error)
            toast.error('Failed to save links')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setEditingCourse(null)
        setEditForm({
            demoMeetLink: '',
            formLink: '',
            paymentLink: '',
            trackingEnabled: true
        })
    }

    const getLinkStatus = (courseId, field) => {
        const link = courseLinks[courseId]
        if (!link || !link[field]) return 'not-set'
        return 'set'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-neutral-900">
                            Link Management
                        </h1>
                        <p className="text-neutral-600 mt-1">
                            Manage demo, form, and payment links for all courses
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                <MousePointerClick className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                {stats.linkClicks}
                            </div>
                            <div className="text-neutral-600 font-medium">Link Clicks</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="text-3xl font-bold text-purple-600 mb-1">
                                {stats.formSubmissions}
                            </div>
                            <div className="text-neutral-600 font-medium">Form Submissions</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                                <CreditCard className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {stats.payments}
                            </div>
                            <div className="text-neutral-600 font-medium">Payments</div>
                        </div>
                    </motion.div>
                </div>

                {/* Course Demo Links Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
                >
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-neutral-700" />
                            <h2 className="text-lg font-heading font-semibold text-neutral-900">
                                Course Demo Links
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Course
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Demo Meet Link
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Click Tracking
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Form Link
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Payment Link
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {courses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                                            No courses found. Add courses first.
                                        </td>
                                    </tr>
                                ) : (
                                    courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-neutral-900">
                                                    {course.title || course.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {courseLinks[course.id]?.demoMeetLink ? (
                                                    <a
                                                        href={courseLinks[course.id].demoMeetLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                    >
                                                        <ExternalLink size={14} />
                                                        Open
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-400">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getLinkStatus(course.id, 'trackingEnabled') === 'set' ||
                                                    courseLinks[course.id]?.trackingEnabled !== false ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600">
                                                        <Check size={14} />
                                                        Set
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-400">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {courseLinks[course.id]?.formLink ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600">
                                                        <Check size={14} />
                                                        Set
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-400">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {courseLinks[course.id]?.paymentLink ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600">
                                                        <Check size={14} />
                                                        Set
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-400">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleEdit(course)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Edit Modal */}
                {editingCourse && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-neutral-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-heading font-semibold text-neutral-900">
                                        Edit Links - {editingCourse.title || editingCourse.name}
                                    </h3>
                                    <button
                                        onClick={handleCancel}
                                        className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Demo Meet Link
                                    </label>
                                    <input
                                        type="url"
                                        value={editForm.demoMeetLink}
                                        onChange={(e) => setEditForm({ ...editForm, demoMeetLink: e.target.value })}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Form Link (Google Form / Website Form)
                                    </label>
                                    <input
                                        type="url"
                                        value={editForm.formLink}
                                        onChange={(e) => setEditForm({ ...editForm, formLink: e.target.value })}
                                        placeholder="https://forms.google.com/..."
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Payment Link (Razorpay)
                                    </label>
                                    <input
                                        type="url"
                                        value={editForm.paymentLink}
                                        onChange={(e) => setEditForm({ ...editForm, paymentLink: e.target.value })}
                                        placeholder="https://rzp.io/..."
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.trackingEnabled}
                                            onChange={(e) => setEditForm({ ...editForm, trackingEnabled: e.target.checked })}
                                            className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium text-neutral-700">
                                            Enable Click Tracking
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminLinkManagement
