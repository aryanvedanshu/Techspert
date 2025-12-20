/**
 * Payment Failed Page
 * Displays when Razorpay payment fails or is cancelled
 */

import { motion } from 'framer-motion'
import { XCircle, RefreshCw, MessageCircle, Home, ArrowLeft } from 'lucide-react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Button from '../components/UI/Button'

const PaymentFailed = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const errorDetails = {
        reason: searchParams.get('reason') || 'Payment could not be completed',
        courseName: searchParams.get('course') || 'the course'
    }

    const handleRetry = () => {
        // Go back to course detail page to retry
        const courseId = searchParams.get('course_id')
        if (courseId) {
            navigate(`/courses/${courseId}`)
        } else {
            navigate('/courses')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white pt-20">
            <div className="container-custom py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    {/* Failed Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <XCircle className="w-12 h-12 text-red-600" />
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
                        Payment Failed
                    </h1>

                    <p className="text-lg text-neutral-600 mb-8">
                        We couldn't process your payment for <strong>{errorDetails.courseName}</strong>.
                        Don't worry, no amount has been deducted from your account.
                    </p>

                    {/* Error Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 mb-8"
                    >
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                            What happened?
                        </h2>
                        <p className="text-neutral-600 mb-4">
                            {errorDetails.reason}
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                            <p className="text-sm font-medium text-amber-800 mb-2">
                                Common reasons for payment failure:
                            </p>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>• Insufficient balance in your account</li>
                                <li>• Payment was cancelled before completion</li>
                                <li>• Bank declined the transaction</li>
                                <li>• Network issues during payment</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <Button onClick={handleRetry} size="lg">
                            <RefreshCw size={18} className="mr-2" />
                            Try Again
                        </Button>
                        <Link to="/contact">
                            <Button variant="outline" size="lg">
                                <MessageCircle size={18} className="mr-2" />
                                Contact Support
                            </Button>
                        </Link>
                    </div>

                    <Link to="/" className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
                        <Home size={18} />
                        Return to Home
                    </Link>

                    {/* Support */}
                    <p className="text-sm text-neutral-500 mt-8">
                        If amount was deducted, it will be refunded within 5-7 business days.
                        <br />
                        For immediate assistance, call{' '}
                        <a href="tel:+919999999999" className="text-primary-600 hover:underline">
                            +91 99999 99999
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default PaymentFailed
