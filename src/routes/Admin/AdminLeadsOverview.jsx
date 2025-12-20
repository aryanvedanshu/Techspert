import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, MousePointer, FileText, CreditCard, RefreshCw,
    Eye, Key, Copy, Search, Filter, Calendar, TrendingUp, Mail, ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { firebaseService } from '../../services/firebaseService'
import { generatePasswordFromFullName } from '../../utils/passwordGenerator'
import logger from '../../utils/logger'

// Helper function to generate mailto link for admin notification
const generateAdminNotificationLink = (data) => {
    const adminEmail = 'aryangoel299@gmail.com'
    const subject = encodeURIComponent(`New Demo Registration: ${data.name} - ${data.courseName || 'Course'}`)

    const body = encodeURIComponent(`🎓 New Demo Class Registration

Student Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Experience Level: ${data.experience || 'Not specified'}
Course Interest: ${data.courseName || data.courseInterest || 'Not specified'}

Demo Session Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Day: Every Saturday
⏰ Time: 2:00 PM - 3:00 PM IST
⏱️ Duration: 1 Hour

Registered at: ${data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Unknown'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Please send them a confirmation email with the demo link.
`)

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${adminEmail}&su=${subject}&body=${body}`
}

// Helper function to generate welcome email link for student
const generateStudentWelcomeLink = (data, demoLink = '') => {
    const subject = encodeURIComponent(`Welcome! Your Free Demo Session - Techspert`)

    const body = encodeURIComponent(`Dear ${data.name},

Thank you for registering for our Free Demo Session! 🎉

We're excited to have you join us for the ${data.courseName || 'course'} demo class.

📋 SESSION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Day: Every Saturday
⏰ Time: 2:00 PM - 3:00 PM IST
⏱️ Duration: 1 Hour
👥 Max Participants: 20
${demoLink ? `
🔗 JOIN LINK: ${demoLink}

Click the link above at the scheduled time to join the session.
` : `
We will send you the meeting link before the session.
`}

📝 WHAT TO EXPECT:
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Introduction to the course
• Live coding demonstration
• Q&A session
• Course overview and career guidance

💡 TIPS FOR THE SESSION:
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Join 5 minutes early
• Have a stable internet connection
• Prepare any questions you have
• Keep a notebook ready

If you have any questions before the session, feel free to reply to this email.

We look forward to seeing you!

Best regards,
Techspert Team

━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: aryangoel299@gmail.com
🌐 Website: techspert.com
`)

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${data.email}&su=${subject}&body=${body}`
}

const AdminLeadsOverview = () => {
    const [demoRegistrations, setDemoRegistrations] = useState([])
    const [demoSignups, setDemoSignups] = useState([])
    const [leadTracking, setLeadTracking] = useState([])
    const [leadSyncResults, setLeadSyncResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedLead, setSelectedLead] = useState(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [generatedPassword, setGeneratedPassword] = useState('')

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        setLoading(true)
        try {
            // Fetch demo registrations (old collection)
            const demoResult = await firebaseService.getDocuments('demo_class_registrations', [], 'submittedAt', 'desc')
            if (demoResult.success) {
                setDemoRegistrations(demoResult.data || [])
            }

            // Fetch demo signups (new collection from FreeDemoModal)
            const signupsResult = await firebaseService.getDocuments('demoSignups', [], 'createdAt', 'desc')
            if (signupsResult.success) {
                setDemoSignups(signupsResult.data || [])
            }

            // Fetch lead tracking data
            const trackingResult = await firebaseService.getDocuments('lead_tracking', [], 'createdAt', 'desc')
            if (trackingResult.success) {
                setLeadTracking(trackingResult.data || [])
            }

            // Fetch lead sync results
            const syncResult = await firebaseService.getDocuments('lead_sync_results', [], 'syncedAt', 'desc')
            if (syncResult.success) {
                setLeadSyncResults(syncResult.data || [])
            }
        } catch (error) {
            logger.error('Error fetching leads', error)
            toast.error('Failed to load leads')
        } finally {
            setLoading(false)
        }
    }

    // Combine all demo registrations
    const allDemoRegistrations = [
        ...demoSignups.map(d => ({ ...d, source: 'website' })),
        ...demoRegistrations.map(d => ({ ...d, source: 'legacy' })),
    ]

    // Categorize leads
    const stats = {
        clicked: leadTracking.filter(l => l.stage === 'clicked').length,
        submitted: leadTracking.filter(l => l.stage === 'submitted').length + allDemoRegistrations.length,
        schoolForms: leadSyncResults.filter(l => l.formType === 'school').length,
        payments: leadTracking.filter(l => l.stage === 'paid').length + leadSyncResults.filter(l => l.formType === 'payment').length,
        total: allDemoRegistrations.length + leadTracking.length + leadSyncResults.length,
    }

    // Generate password for a lead
    const handleGeneratePassword = (lead) => {
        try {
            const password = generatePasswordFromFullName(lead.name, lead.phone)
            setGeneratedPassword(password)
            setSelectedLead(lead)
            setShowPasswordModal(true)
        } catch (error) {
            toast.error('Failed to generate password: ' + error.message)
        }
    }

    // Copy password to clipboard
    const copyPassword = () => {
        navigator.clipboard.writeText(generatedPassword)
        toast.success('Password copied to clipboard')
    }

    // Save password to lead
    const savePasswordToLead = async () => {
        if (!selectedLead) return
        try {
            await firebaseService.updateDocument('lead_sync_results', selectedLead.id, {
                generatedPassword,
            })
            toast.success('Password saved to lead')
            setShowPasswordModal(false)
            fetchLeads()
        } catch (error) {
            logger.error('Failed to save password', error)
            toast.error('Failed to save password')
        }
    }

    // Mark email as sent
    const markEmailSent = async (registration) => {
        try {
            await firebaseService.updateDocument('demoSignups', registration.id, {
                emailSent: true,
                emailSentAt: new Date().toISOString(),
            })
            toast.success('Marked as email sent')
            fetchLeads()
        } catch (error) {
            logger.error('Failed to update email status', error)
            toast.error('Failed to update status')
        }
    }

    // Update registration status
    const updateStatus = async (registration, newStatus) => {
        try {
            await firebaseService.updateDocument('demoSignups', registration.id, {
                status: newStatus,
            })
            toast.success(`Status updated to ${newStatus}`)
            fetchLeads()
        } catch (error) {
            logger.error('Failed to update status', error)
            toast.error('Failed to update status')
        }
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
                                Lead Pipeline
                            </h1>
                            <p className="text-neutral-600">
                                Track leads through the conversion funnel
                            </p>
                        </div>
                        <Button onClick={fetchLeads}>
                            <RefreshCw size={16} className="mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card className="text-center">
                        <div className="p-4">
                            <MousePointer className="mx-auto text-blue-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-blue-600">{stats.clicked}</div>
                            <div className="text-sm text-neutral-600">Clicked Demo</div>
                        </div>
                    </Card>
                    <Card className="text-center">
                        <div className="p-4">
                            <FileText className="mx-auto text-purple-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-purple-600">{stats.submitted}</div>
                            <div className="text-sm text-neutral-600">Demo Forms</div>
                        </div>
                    </Card>
                    <Card className="text-center">
                        <div className="p-4">
                            <Users className="mx-auto text-orange-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-orange-600">{stats.schoolForms}</div>
                            <div className="text-sm text-neutral-600">School Forms</div>
                        </div>
                    </Card>
                    <Card className="text-center">
                        <div className="p-4">
                            <CreditCard className="mx-auto text-green-600 mb-2" size={24} />
                            <div className="text-2xl font-bold text-green-600">{stats.payments}</div>
                            <div className="text-sm text-neutral-600">Payments</div>
                        </div>
                    </Card>
                    <Card className="text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                        <div className="p-4">
                            <TrendingUp className="mx-auto mb-2" size={24} />
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-sm opacity-90">Total Leads</div>
                        </div>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'clicked', label: 'Demo Clicks', icon: MousePointer },
                        { id: 'submitted', label: 'Form Submissions', icon: FileText },
                        { id: 'payments', label: 'Payments', icon: CreditCard },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Lead Funnel Overview</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                    <span className="font-medium">Demo Link Clicks</span>
                                    <span className="text-2xl font-bold text-blue-600">{stats.clicked}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                    <span className="font-medium">Demo Form Submissions</span>
                                    <span className="text-2xl font-bold text-purple-600">{stats.submitted}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                                    <span className="font-medium">School Form Submissions</span>
                                    <span className="text-2xl font-bold text-orange-600">{stats.schoolForms}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                    <span className="font-medium">Payment Confirmations</span>
                                    <span className="text-2xl font-bold text-green-600">{stats.payments}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'clicked' && (
                    <Card>
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-4">Demo Class Registrations</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Interest</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {allDemoRegistrations.map(reg => (
                                            <tr key={reg.id} className={`hover:bg-neutral-50 ${reg.status === 'pending' ? 'bg-blue-50' :
                                                    reg.status === 'contacted' ? 'bg-green-50' :
                                                        reg.status === 'converted' ? 'bg-red-50' : ''
                                                }`}>
                                                <td className="px-4 py-3 font-medium">{reg.name}</td>
                                                <td className="px-4 py-3 text-neutral-600">{reg.email}</td>
                                                <td className="px-4 py-3 text-neutral-600">{reg.phone}</td>
                                                <td className="px-4 py-3">
                                                    {reg.courseName ? (
                                                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                                                            {reg.courseName}
                                                        </span>
                                                    ) : reg.courseInterest ? (
                                                        Array.isArray(reg.courseInterest)
                                                            ? reg.courseInterest.slice(0, 2).map((c, i) => (
                                                                <span key={i} className="mr-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                                                                    {c}
                                                                </span>
                                                            ))
                                                            : (
                                                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                                                                    {reg.courseInterest}
                                                                </span>
                                                            )
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${reg.status === 'converted' ? 'bg-green-100 text-green-700' :
                                                            reg.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {reg.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {reg.emailSent ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                            ✓ Sent
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                                            Not sent
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {/* Send Welcome Email */}
                                                        <button
                                                            onClick={() => {
                                                                const link = generateStudentWelcomeLink(reg)
                                                                window.open(link, '_blank')
                                                            }}
                                                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                                                            title="Send Welcome Email to Student"
                                                        >
                                                            <Mail size={14} />
                                                        </button>

                                                        {/* Notify Admin */}
                                                        <button
                                                            onClick={() => {
                                                                const link = generateAdminNotificationLink(reg)
                                                                window.open(link, '_blank')
                                                            }}
                                                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                                                            title="Notify Admin"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </button>

                                                        {/* Mark Email Sent */}
                                                        {reg.source === 'website' && !reg.emailSent && (
                                                            <button
                                                                onClick={() => markEmailSent(reg)}
                                                                className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
                                                                title="Mark Email as Sent"
                                                            >
                                                                ✓
                                                            </button>
                                                        )}

                                                        {/* Status Buttons */}
                                                        {reg.source === 'website' && reg.status !== 'contacted' && (
                                                            <button
                                                                onClick={() => updateStatus(reg, 'contacted')}
                                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                                            >
                                                                Contacted
                                                            </button>
                                                        )}
                                                        {reg.source === 'website' && reg.status !== 'converted' && (
                                                            <button
                                                                onClick={() => updateStatus(reg, 'converted')}
                                                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                                            >
                                                                Converted
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allDemoRegistrations.length === 0 && (
                                    <p className="text-center py-8 text-neutral-500">No demo registrations yet</p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'submitted' && (
                    <Card>
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-4">Form Submissions</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Form Type</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {leadSyncResults.filter(l => l.formType !== 'payment').map(lead => (
                                            <tr key={lead.id} className="hover:bg-neutral-50">
                                                <td className="px-4 py-3 font-medium">{lead.name}</td>
                                                <td className="px-4 py-3 text-neutral-600">{lead.email}</td>
                                                <td className="px-4 py-3 text-neutral-600">{lead.phone}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${lead.formType === 'school' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {lead.formType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-neutral-600">
                                                    {lead.syncedAt ? new Date(lead.syncedAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {leadSyncResults.filter(l => l.formType !== 'payment').length === 0 && (
                                    <p className="text-center py-8 text-neutral-500">No form submissions yet</p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {activeTab === 'payments' && (
                    <Card>
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-4">Payment Confirmations</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Payment ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Password</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {leadSyncResults.filter(l => l.formType === 'payment').map(lead => (
                                            <tr key={lead.id} className="hover:bg-neutral-50">
                                                <td className="px-4 py-3 font-medium">{lead.name}</td>
                                                <td className="px-4 py-3 text-neutral-600">{lead.phone}</td>
                                                <td className="px-4 py-3 font-medium text-green-600">
                                                    ₹{lead.paymentAmount || 0}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-sm text-neutral-600">
                                                    {lead.paymentId || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {lead.generatedPassword ? (
                                                        <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
                                                            {lead.generatedPassword}
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-400 text-sm">Not generated</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleGeneratePassword(lead)}
                                                    >
                                                        <Key size={14} className="mr-1" />
                                                        Generate
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {leadSyncResults.filter(l => l.formType === 'payment').length === 0 && (
                                    <p className="text-center py-8 text-neutral-500">No payment confirmations yet</p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Generated Password"
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 mb-1">Lead Name</label>
                        <p className="font-medium">{selectedLead?.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 mb-1">Phone</label>
                        <p className="text-neutral-600">{selectedLead?.phone}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-500 mb-1">Generated Password</label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-neutral-100 px-4 py-2 rounded-lg font-mono text-lg">
                                {generatedPassword}
                            </code>
                            <Button variant="outline" size="sm" onClick={copyPassword}>
                                <Copy size={14} />
                            </Button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                            Rule: First 3 letters + Last 2 letters + @$ + Last 4 digits of phone
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={savePasswordToLead}>
                            <Key size={14} className="mr-2" />
                            Save Password
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default AdminLeadsOverview
