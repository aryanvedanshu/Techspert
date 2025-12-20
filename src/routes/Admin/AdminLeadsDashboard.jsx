/**
 * Admin Leads Dashboard
 * Matches Images 2 & 3: Tab-based view with Overview, Demo Clicks, Form Submissions, Payments
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    MousePointerClick, FileText, Users, CreditCard, TrendingUp,
    Loader2, RefreshCw, Eye, Mail, Phone, Calendar,
    ChevronRight, AlertCircle, CheckCircle, Key
} from 'lucide-react'
import { toast } from 'sonner'
import {
    linkClicksService,
    formSubmissionsService,
    crmPaymentsService,
    leadAnalyticsService
} from '../../services/leadTrackingService'

const AdminLeadsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        demoClicks: 0,
        demoForms: 0,
        schoolForms: 0,
        payments: 0,
        totalLeads: 0
    })
    const [demoClicks, setDemoClicks] = useState([])
    const [formSubmissions, setFormSubmissions] = useState([])
    const [payments, setPayments] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch stats
            const statsResult = await leadAnalyticsService.getDashboardStats()
            if (statsResult.success) {
                setStats({
                    demoClicks: statsResult.data.demoClicks || 0,
                    demoForms: statsResult.data.formSubmissions || 0,
                    schoolForms: 0,
                    payments: statsResult.data.payments || 0,
                    totalLeads: statsResult.data.leads?.total || 0
                })
            }

            // Fetch demo clicks
            const clicksResult = await linkClicksService.getAll({ linkType: 'demo', limit: 50 })
            if (clicksResult.success) {
                setDemoClicks(clicksResult.data || [])
            }

            // Fetch form submissions
            const submissionsResult = await formSubmissionsService.getAll({ limit: 50 })
            if (submissionsResult.success) {
                setFormSubmissions(submissionsResult.data || [])
            }

            // Fetch payments
            const paymentsResult = await crmPaymentsService.getAll({ limit: 50 })
            if (paymentsResult.success) {
                setPayments(paymentsResult.data || [])
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'demo-clicks', label: 'Demo Clicks', icon: MousePointerClick },
        { id: 'form-submissions', label: 'Form Submissions', icon: FileText },
        { id: 'payments', label: 'Payments', icon: CreditCard }
    ]

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
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
                            Leads Dashboard
                        </h1>
                        <p className="text-neutral-600 mt-1">
                            Track and manage all leads across the pipeline
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <MousePointerClick className="w-6 h-6 text-blue-500 mb-2" />
                            <div className="text-2xl font-bold text-blue-600">{stats.demoClicks}</div>
                            <div className="text-sm text-neutral-600">Clicked Demo</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <FileText className="w-6 h-6 text-purple-500 mb-2" />
                            <div className="text-2xl font-bold text-purple-600">{stats.demoForms}</div>
                            <div className="text-sm text-neutral-600">Demo Forms</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <Users className="w-6 h-6 text-orange-500 mb-2" />
                            <div className="text-2xl font-bold text-orange-600">{stats.schoolForms}</div>
                            <div className="text-sm text-neutral-600">School Forms</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <CreditCard className="w-6 h-6 text-green-500 mb-2" />
                            <div className="text-2xl font-bold text-green-600">{stats.payments}</div>
                            <div className="text-sm text-neutral-600">Payments</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 shadow-sm"
                    >
                        <div className="flex flex-col items-center text-center text-white">
                            <TrendingUp className="w-6 h-6 mb-2" />
                            <div className="text-2xl font-bold">{stats.totalLeads}</div>
                            <div className="text-sm opacity-90">Total Leads</div>
                        </div>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
                >
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="p-6">
                            <h2 className="text-lg font-heading font-semibold text-neutral-900 mb-4">
                                Lead Pipeline Overview
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-blue-600 font-medium">Clicked</span>
                                        <span className="text-2xl font-bold text-blue-600">{stats.demoClicks}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                        <ChevronRight size={16} />
                                        Users who clicked demo links
                                    </div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-purple-600 font-medium">Submitted</span>
                                        <span className="text-2xl font-bold text-purple-600">{stats.demoForms}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-purple-600">
                                        <ChevronRight size={16} />
                                        Users who submitted forms
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-green-600 font-medium">Paid</span>
                                        <span className="text-2xl font-bold text-green-600">{stats.payments}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <ChevronRight size={16} />
                                        Users who completed payment
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Demo Clicks Tab */}
                    {activeTab === 'demo-clicks' && (
                        <div>
                            <div className="p-6 border-b border-neutral-100">
                                <h2 className="text-lg font-heading font-semibold text-neutral-900">
                                    Demo Clicks
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Course</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Device</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Browser</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {demoClicks.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                                    No demo clicks yet
                                                </td>
                                            </tr>
                                        ) : (
                                            demoClicks.map((click) => (
                                                <tr key={click.id} className="hover:bg-neutral-50">
                                                    <td className="px-6 py-4 font-medium text-neutral-900">
                                                        {click.courseName || 'Unknown'}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600">{click.device}</td>
                                                    <td className="px-6 py-4 text-neutral-600">{click.browser}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${click.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                click.status === 'submitted' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {click.status === 'paid' && <CheckCircle size={12} />}
                                                            {click.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600">{formatDate(click.timestamp)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Form Submissions Tab */}
                    {activeTab === 'form-submissions' && (
                        <div>
                            <div className="p-6 border-b border-neutral-100">
                                <h2 className="text-lg font-heading font-semibold text-neutral-900">
                                    Form Submissions
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Email</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Phone</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Form Type</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {formSubmissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                                    No form submissions yet
                                                </td>
                                            </tr>
                                        ) : (
                                            formSubmissions.map((submission) => (
                                                <tr key={submission.id} className="hover:bg-neutral-50">
                                                    <td className="px-6 py-4 font-medium text-neutral-900">{submission.name}</td>
                                                    <td className="px-6 py-4 text-neutral-600">{submission.email}</td>
                                                    <td className="px-6 py-4 text-neutral-600">{submission.phone || 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                            {submission.formType || 'demo_form'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600">{formatDate(submission.timestamp)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div>
                            <div className="p-6 border-b border-neutral-100">
                                <h2 className="text-lg font-heading font-semibold text-neutral-900">
                                    Payment Confirmations
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Phone</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Amount</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Payment ID</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Password</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {payments.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                                                    No payment confirmations yet
                                                </td>
                                            </tr>
                                        ) : (
                                            payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-neutral-50">
                                                    <td className="px-6 py-4 font-medium text-neutral-900">{payment.name}</td>
                                                    <td className="px-6 py-4 text-neutral-600">{payment.phone || 'N/A'}</td>
                                                    <td className="px-6 py-4 font-medium text-green-600">
                                                        ₹{payment.amount?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-sm text-neutral-600">
                                                        {payment.razorpayPaymentId || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {payment.generatedPassword ? (
                                                            <span className="inline-flex items-center gap-1 font-mono text-sm">
                                                                <Key size={14} />
                                                                {payment.generatedPassword}
                                                            </span>
                                                        ) : (
                                                            <span className="text-neutral-400">Not set</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                                                        >
                                                            <Eye size={14} />
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default AdminLeadsDashboard
