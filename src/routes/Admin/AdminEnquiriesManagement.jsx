import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare, Search, Filter, RefreshCw, Eye,
    CheckCircle, Clock, AlertCircle, Mail, Phone, User,
    Calendar, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { firebaseService } from '../../services/firebaseService'
import logger from '../../utils/logger'

const AdminEnquiriesManagement = () => {
    const [enquiries, setEnquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
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
            await firebaseService.updateDocument(collection, enquiry.id, { status: newStatus })
            setEnquiries(prev =>
                prev.map(e => e.id === enquiry.id ? { ...e, status: newStatus } : e)
            )
            toast.success('Status updated successfully')
        } catch (error) {
            logger.error('Error updating enquiry status', error)
            toast.error('Failed to update status')
        }
    }

    const filteredEnquiries = enquiries.filter(enq => {
        const matchesSearch =
            enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enq.message?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || enq.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800'
            case 'in_progress': return 'bg-yellow-100 text-yellow-800'
            case 'resolved': return 'bg-green-100 text-green-800'
            case 'closed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-blue-100 text-blue-800'
        }
    }

    const stats = {
        total: enquiries.length,
        new: enquiries.filter(e => !e.status || e.status === 'new').length,
        inProgress: enquiries.filter(e => e.status === 'in_progress').length,
        resolved: enquiries.filter(e => e.status === 'resolved').length,
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
                    <Card className="text-center">
                        <div className="p-4">
                            <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
                            <div className="text-sm text-neutral-600">New</div>
                        </div>
                    </Card>
                    <Card className="text-center">
                        <div className="p-4">
                            <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
                            <div className="text-sm text-neutral-600">In Progress</div>
                        </div>
                    </Card>
                    <Card className="text-center">
                        <div className="p-4">
                            <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
                            <div className="text-sm text-neutral-600">Resolved</div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="p-4 flex flex-col md:flex-row gap-4">
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
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
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
                            <Card className="hover:shadow-md transition-shadow">
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-neutral-900">
                                                    {enquiry.subject || 'No Subject'}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                                                    {enquiry.status || 'new'}
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

                                        <div className="flex items-center gap-2 ml-4">
                                            <select
                                                value={enquiry.status || 'new'}
                                                onChange={(e) => updateEnquiryStatus(enquiry, e.target.value)}
                                                className="text-sm px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="new">New</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedEnquiry(enquiry)
                                                    setShowModal(true)
                                                }}
                                            >
                                                <Eye size={14} />
                                            </Button>
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
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEnquiry.status)}`}>
                                    {selectedEnquiry.status || 'new'}
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
                            <a href={`mailto:${selectedEnquiry.email}`}>
                                <Button variant="outline">
                                    <Mail size={16} className="mr-2" />
                                    Reply via Email
                                </Button>
                            </a>
                            <Button onClick={() => setShowModal(false)}>
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
