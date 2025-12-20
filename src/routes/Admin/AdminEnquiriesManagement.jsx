import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare, Search, RefreshCw, Eye,
    CheckCircle, Mail, Phone, User,
    Calendar, ExternalLink, ArrowUpDown, Filter
} from 'lucide-react'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { firebaseService } from '../../services/firebaseService'
import logger from '../../utils/logger'

// Helper function to generate mailto link with thank you template
const generateReplyMailtoLink = (enquiry) => {
    const recipientEmail = enquiry.email
    const subject = encodeURIComponent(`Re: ${enquiry.subject || 'Your Enquiry'} - Thank You for Reaching Out`)

    const body = encodeURIComponent(`Dear ${enquiry.name || 'Valued Customer'},

Thank you for reaching out to Techspert!

We have received your enquiry regarding "${enquiry.subject || 'your question'}" and our team is reviewing it. We will get back to you with a detailed response as soon as possible.

Your Original Message:
"${enquiry.message || ''}"

In the meantime, if you have any urgent questions, feel free to reach out to us at:
- Email: aryangoel299@gmail.com

Best regards,
Techspert Team
`)

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subject}&body=${body}`
}

// Helper function to generate admin notification mailto link
const generateAdminNotificationLink = (enquiry) => {
    const adminEmail = 'aryangoel299@gmail.com'
    const subject = encodeURIComponent(`New Enquiry from ${enquiry.name} - ${enquiry.subject || 'No Subject'}`)

    const body = encodeURIComponent(`New Enquiry Received

From: ${enquiry.name || 'Unknown'}
Email: ${enquiry.email || 'Not provided'}
Phone: ${enquiry.phone || 'Not provided'}
Subject: ${enquiry.subject || 'No subject'}

Message:
${enquiry.message || 'No message'}

---
Received at: ${enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString() : 'Unknown'}
Source: ${enquiry.source || 'contact_form'}

Reply to this enquiry: ${generateReplyMailtoLink(enquiry)}
`)

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${adminEmail}&su=${subject}&body=${body}`
}

const AdminEnquiriesManagement = () => {
    const [enquiries, setEnquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [selectedEnquiry, setSelectedEnquiry] = useState(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchEnquiries()
    }, [])

    const fetchEnquiries = async () => {
        setLoading(true)
        try {
            // Try to fetch from multiple possible collections
            let result = await firebaseService.getDocuments('enquiries', [], 'createdAt', 'desc')

            // Also check messages collection
            const messagesResult = await firebaseService.getDocuments('messages', [], 'createdAt', 'desc')

            // Also check contacts collection
            const contactsResult = await firebaseService.getDocuments('contacts', [], 'createdAt', 'desc')

            // Combine all results
            const allEnquiries = [
                ...(result.data || []).map(e => ({ ...e, source: 'enquiries' })),
                ...(messagesResult.data || []).map(e => ({ ...e, source: 'messages' })),
                ...(contactsResult.data || []).map(e => ({ ...e, source: 'contacts' }))
            ]

            // Sort by date
            allEnquiries.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
                return dateB - dateA
            })

            setEnquiries(allEnquiries)
        } catch (error) {
            logger.error('Error fetching enquiries', error)
            toast.error('Failed to load enquiries')
        } finally {
            setLoading(false)
        }
    }

    const updateEnquiryStatus = async (enquiry, newStatus) => {
        try {
            const collection = enquiry.source || 'enquiries'
            await firebaseService.updateDocument(collection, enquiry.id, {
                status: newStatus,
                ...(newStatus === 'in_progress' ? { emailSentToAdmin: true } : {}),
                ...(newStatus === 'resolved' ? { resolvedAt: new Date().toISOString() } : {})
            })
            setEnquiries(prev =>
                prev.map(e => e.id === enquiry.id ? { ...e, status: newStatus } : e)
            )
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
        } catch (error) {
            logger.error('Error updating enquiry status', error)
            toast.error('Failed to update status')
        }
    }

    const handleReplyClick = (enquiry) => {
        // Open Gmail compose in new tab
        const mailtoLink = generateReplyMailtoLink(enquiry)
        window.open(mailtoLink, '_blank')

        // Update status to in_progress
        updateEnquiryStatus(enquiry, 'in_progress')
    }

    const handleResolvedClick = (enquiry) => {
        updateEnquiryStatus(enquiry, 'resolved')
    }

    // Get status for display
    const getEffectiveStatus = (enquiry) => {
        if (enquiry.status === 'resolved' || enquiry.status === 'closed') {
            return 'resolved'
        }
        if (enquiry.status === 'in_progress') {
            return 'in_progress'
        }
        return 'new'
    }

    // Sort enquiries
    const sortEnquiries = (enquiriesList) => {
        const sorted = [...enquiriesList]
        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
                    return dateB - dateA
                })
                break
            case 'oldest':
                sorted.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
                    return dateA - dateB
                })
                break
            case 'name_asc':
                sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                break
            case 'name_desc':
                sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
                break
            default:
                break
        }
        return sorted
    }

    const filteredEnquiries = sortEnquiries(enquiries.filter(enq => {
        const matchesSearch =
            enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.message?.toLowerCase().includes(searchTerm.toLowerCase())

        const effectiveStatus = getEffectiveStatus(enq)
        const matchesStatus = filterStatus === 'all' || effectiveStatus === filterStatus

        return matchesSearch && matchesStatus
    }))

    // Get row background color based on status
    const getRowBackgroundColor = (status) => {
        const effectiveStatus = getEffectiveStatus({ status })
        switch (effectiveStatus) {
            case 'new':
                return 'bg-blue-50 border-l-4 border-blue-400'
            case 'in_progress':
                return 'bg-green-50 border-l-4 border-green-400'
            case 'resolved':
                return 'bg-red-50 border-l-4 border-red-400'
            default:
                return 'bg-blue-50 border-l-4 border-blue-400'
        }
    }

    const getStatusBadgeColor = (status) => {
        const effectiveStatus = getEffectiveStatus({ status })
        switch (effectiveStatus) {
            case 'new': return 'bg-blue-100 text-blue-800'
            case 'in_progress': return 'bg-green-100 text-green-800'
            case 'resolved': return 'bg-red-100 text-red-800'
            default: return 'bg-blue-100 text-blue-800'
        }
    }

    const getStatusLabel = (status) => {
        const effectiveStatus = getEffectiveStatus({ status })
        switch (effectiveStatus) {
            case 'new': return 'New'
            case 'in_progress': return 'In Progress'
            case 'resolved': return 'Resolved'
            default: return 'New'
        }
    }

    const stats = {
        total: enquiries.length,
        new: enquiries.filter(e => getEffectiveStatus(e) === 'new').length,
        inProgress: enquiries.filter(e => getEffectiveStatus(e) === 'in_progress').length,
        resolved: enquiries.filter(e => getEffectiveStatus(e) === 'resolved').length,
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 py-8">
                <div className="container-custom">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 bg-neutral-200 rounded-2xl"></div>
                            ))}
                        </div>
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
                                Enquiries Management
                            </h1>
                            <p className="text-neutral-600">
                                View and manage contact form submissions
                            </p>
                        </div>
                        <Button onClick={fetchEnquiries}>
                            <RefreshCw size={16} className="mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="text-center">
                        <div className="p-4">
                            <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
                            <div className="text-sm text-neutral-600">Total Enquiries</div>
                        </div>
                    </Card>
                    <Card className="text-center border-l-4 border-blue-400">
                        <div className="p-4">
                            <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
                            <div className="text-sm text-neutral-600">New</div>
                        </div>
                    </Card>
                    <Card className="text-center border-l-4 border-green-400">
                        <div className="p-4">
                            <div className="text-3xl font-bold text-green-600">{stats.inProgress}</div>
                            <div className="text-sm text-neutral-600">In Progress</div>
                        </div>
                    </Card>
                    <Card className="text-center border-l-4 border-red-400">
                        <div className="p-4">
                            <div className="text-3xl font-bold text-red-600">{stats.resolved}</div>
                            <div className="text-sm text-neutral-600">Resolved</div>
                        </div>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <div className="p-4 space-y-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search enquiries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 mr-2">
                                <Filter size={16} className="text-neutral-500" />
                                <span className="text-sm font-medium text-neutral-700">Filter:</span>
                            </div>
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                                        ? 'bg-neutral-800 text-white'
                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                    }`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilterStatus('new')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'new'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    }`}
                            >
                                New ({stats.new})
                            </button>
                            <button
                                onClick={() => setFilterStatus('in_progress')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'in_progress'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                            >
                                In Progress ({stats.inProgress})
                            </button>
                            <button
                                onClick={() => setFilterStatus('resolved')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'resolved'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                                    }`}
                            >
                                Resolved ({stats.resolved})
                            </button>
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 mr-2">
                                <ArrowUpDown size={16} className="text-neutral-500" />
                                <span className="text-sm font-medium text-neutral-700">Sort:</span>
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name_asc">Name A-Z</option>
                                <option value="name_desc">Name Z-A</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Enquiries List */}
                <div className="space-y-4">
                    {filteredEnquiries.map((enquiry, index) => (
                        <motion.div
                            key={enquiry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`hover:shadow-md transition-shadow ${getRowBackgroundColor(enquiry.status)}`}>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-neutral-900">
                                                    {enquiry.subject || 'No Subject'}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(enquiry.status)}`}>
                                                    {getStatusLabel(enquiry.status)}
                                                </span>
                                                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs">
                                                    {enquiry.source}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <User size={14} /> {enquiry.name || 'Unknown'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Mail size={14} /> {enquiry.email}
                                                </span>
                                                {enquiry.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={14} /> {enquiry.phone}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>

                                            <p className="text-neutral-600 text-sm line-clamp-2">
                                                {enquiry.message}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-2 ml-4">
                                            {/* View Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedEnquiry(enquiry)
                                                    setShowModal(true)
                                                }}
                                                className="flex items-center gap-1"
                                            >
                                                <Eye size={14} />
                                                View
                                            </Button>

                                            {/* Reply Button - Only show if not resolved */}
                                            {getEffectiveStatus(enquiry) !== 'resolved' && (
                                                <button
                                                    onClick={() => handleReplyClick(enquiry)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    <ExternalLink size={14} />
                                                    Reply
                                                </button>
                                            )}

                                            {/* Resolved Button - Only show if not already resolved */}
                                            {getEffectiveStatus(enquiry) !== 'resolved' && (
                                                <button
                                                    onClick={() => handleResolvedClick(enquiry)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    <CheckCircle size={14} />
                                                    Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    {filteredEnquiries.length === 0 && (
                        <div className="text-center py-12">
                            <MessageSquare size={48} className="mx-auto text-neutral-300 mb-4" />
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No enquiries found</h3>
                            <p className="text-neutral-600">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'No contact form submissions yet'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Enquiry Detail Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Enquiry Details"
                size="lg"
            >
                {selectedEnquiry && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-500">Name</label>
                                <p className="text-neutral-900">{selectedEnquiry.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-500">Email</label>
                                <p className="text-neutral-900">{selectedEnquiry.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-500">Phone</label>
                                <p className="text-neutral-900">{selectedEnquiry.phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-500">Status</label>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedEnquiry.status)}`}>
                                    {getStatusLabel(selectedEnquiry.status)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-500">Subject</label>
                            <p className="text-neutral-900">{selectedEnquiry.subject || 'No subject'}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-500">Message</label>
                            <p className="text-neutral-900 whitespace-pre-wrap bg-neutral-50 p-4 rounded-lg">
                                {selectedEnquiry.message}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            {getEffectiveStatus(selectedEnquiry) !== 'resolved' && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleReplyClick(selectedEnquiry)
                                            setShowModal(false)
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                        Reply via Email
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleResolvedClick(selectedEnquiry)
                                            setShowModal(false)
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        <CheckCircle size={16} />
                                        Mark Resolved
                                    </button>
                                </>
                            )}
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default AdminEnquiriesManagement
