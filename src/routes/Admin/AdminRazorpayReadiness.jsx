/**
 * Admin Razorpay Readiness - Compliance Checker
 * Verifies all prerequisites before Razorpay live activation
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircle, XCircle, AlertTriangle, Shield,
    Globe, FileText, CreditCard, Key, RefreshCw,
    ExternalLink, Loader2, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const AdminRazorpayReadiness = () => {
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [checks, setChecks] = useState([])

    useEffect(() => {
        runComplianceChecks()
    }, [])

    const runComplianceChecks = async () => {
        setLoading(true)

        // Run all compliance checks
        const checkResults = [
            {
                id: 'legal_terms',
                name: 'Terms & Conditions',
                description: 'Public terms page exists at /terms',
                category: 'Legal',
                icon: FileText,
                check: async () => {
                    try {
                        const response = await fetch('/terms')
                        return response.ok
                    } catch {
                        return false
                    }
                }
            },
            {
                id: 'legal_privacy',
                name: 'Privacy Policy',
                description: 'Public privacy policy page exists at /privacy',
                category: 'Legal',
                icon: Shield,
                check: async () => {
                    try {
                        const response = await fetch('/privacy')
                        return response.ok
                    } catch {
                        return false
                    }
                }
            },
            {
                id: 'legal_refund',
                name: 'Refund Policy',
                description: 'Public refund policy page exists at /refund-policy',
                category: 'Legal',
                icon: FileText,
                check: async () => {
                    try {
                        const response = await fetch('/refund-policy')
                        return response.ok
                    } catch {
                        return false
                    }
                }
            },
            {
                id: 'page_about',
                name: 'About Us',
                description: 'About page exists at /about',
                category: 'Pages',
                icon: Globe,
                check: async () => {
                    try {
                        const response = await fetch('/about')
                        return response.ok
                    } catch {
                        return false
                    }
                }
            },
            {
                id: 'page_contact',
                name: 'Contact Us',
                description: 'Contact page exists at /contact',
                category: 'Pages',
                icon: Globe,
                check: async () => {
                    try {
                        const response = await fetch('/contact')
                        return response.ok
                    } catch {
                        return false
                    }
                }
            },
            {
                id: 'env_key_id',
                name: 'Razorpay Key ID',
                description: 'VITE_RAZORPAY_KEY_ID environment variable configured',
                category: 'Configuration',
                icon: Key,
                check: async () => {
                    return !!import.meta.env.VITE_RAZORPAY_KEY_ID
                }
            },
            {
                id: 'payment_success',
                name: 'Payment Success Page',
                description: 'Success page exists at /payment/success',
                category: 'Payment Flow',
                icon: CheckCircle,
                check: async () => {
                    try {
                        const response = await fetch('/payment/success')
                        return response.ok
                    } catch {
                        return false
                    }
                }
            },
            {
                id: 'payment_failed',
                name: 'Payment Failed Page',
                description: 'Failed page exists at /payment/failed',
                category: 'Payment Flow',
                icon: XCircle,
                check: async () => {
                    try {
                        const response = await fetch('/payment/failed')
                        return response.ok
                    } catch {
                        return false
                    }
                }
            }
        ]

        const results = []
        for (const check of checkResults) {
            try {
                const passed = await check.check()
                results.push({
                    ...check,
                    status: passed ? 'passed' : 'failed',
                    check: undefined // Remove function from state
                })
            } catch {
                results.push({
                    ...check,
                    status: 'error',
                    check: undefined
                })
            }
        }

        setChecks(results)
        setLoading(false)
    }

    const passedCount = checks.filter(c => c.status === 'passed').length
    const failedCount = checks.filter(c => c.status === 'failed').length
    const totalCount = checks.length
    const isReady = failedCount === 0 && totalCount > 0

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const categories = [...new Set(checks.map(c => c.category))]

    return (
        <div className="min-h-screen bg-neutral-50 py-8">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-neutral-900">
                            Razorpay Readiness Check
                        </h1>
                        <p className="text-neutral-600 mt-1">
                            Verify all prerequisites before going live
                        </p>
                    </div>
                    <Button
                        onClick={runComplianceChecks}
                        variant="outline"
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Re-check
                    </Button>
                </div>

                {/* Status Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-6 mb-8 ${isReady
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                >
                    <div className="flex items-center gap-4 text-white">
                        {loading ? (
                            <Loader2 className="w-12 h-12 animate-spin" />
                        ) : isReady ? (
                            <CheckCircle className="w-12 h-12" />
                        ) : (
                            <AlertTriangle className="w-12 h-12" />
                        )}
                        <div>
                            <h2 className="text-xl font-bold">
                                {loading
                                    ? 'Running Checks...'
                                    : isReady
                                        ? 'Ready for Razorpay Integration!'
                                        : `${failedCount} Check(s) Need Attention`
                                }
                            </h2>
                            <p className="opacity-90">
                                {loading
                                    ? 'Please wait'
                                    : `${passedCount} of ${totalCount} checks passed`
                                }
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Checks by Category */}
                {categories.map(category => (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                            {category}
                        </h3>
                        <Card>
                            <div className="divide-y divide-neutral-100">
                                {checks.filter(c => c.category === category).map((check) => (
                                    <div key={check.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${check.status === 'passed' ? 'bg-green-100' :
                                                    check.status === 'failed' ? 'bg-red-100' :
                                                        'bg-neutral-100'
                                                }`}>
                                                <check.icon className={`w-5 h-5 ${check.status === 'passed' ? 'text-green-600' :
                                                        check.status === 'failed' ? 'text-red-600' :
                                                            'text-neutral-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-neutral-900">{check.name}</div>
                                                <div className="text-sm text-neutral-500">{check.description}</div>
                                            </div>
                                        </div>
                                        <div>
                                            {check.status === 'passed' ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                                                    <CheckCircle size={18} />
                                                    Passed
                                                </span>
                                            ) : check.status === 'failed' ? (
                                                <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                                                    <XCircle size={18} />
                                                    Failed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-neutral-500 text-sm font-medium">
                                                    <AlertTriangle size={18} />
                                                    Error
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {/* API Keys Section */}
                <Card className="mt-8">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Lock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">API Keys Required</h3>
                                <p className="text-sm text-neutral-500">Add to your .env file</p>
                            </div>
                        </div>

                        <div className="bg-neutral-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                            <div className="text-neutral-500"># Razorpay API Keys (TEST mode)</div>
                            <div>VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx</div>
                            <div className="text-neutral-500 mt-2"># Server-side only (Cloud Functions)</div>
                            <div>RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx</div>
                        </div>

                        <a
                            href="https://dashboard.razorpay.com/app/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                            <ExternalLink size={16} />
                            Get API Keys from Razorpay Dashboard
                        </a>
                    </div>
                </Card>

                {/* Next Steps */}
                {!isReady && (
                    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h3 className="font-semibold text-amber-900 mb-3">Next Steps</h3>
                        <ul className="space-y-2 text-amber-800">
                            {failedCount > 0 && (
                                <li className="flex items-start gap-2">
                                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                    Fix the {failedCount} failed check(s) shown above
                                </li>
                            )}
                            <li className="flex items-start gap-2">
                                <Key size={16} className="flex-shrink-0 mt-0.5" />
                                Add Razorpay API keys to your .env file
                            </li>
                            <li className="flex items-start gap-2">
                                <CreditCard size={16} className="flex-shrink-0 mt-0.5" />
                                Test with Razorpay TEST mode keys first
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminRazorpayReadiness
