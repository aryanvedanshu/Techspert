/**
 * Payment Success Page
 * Displays after successful Razorpay payment
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Mail, ArrowRight, Home, BookOpen } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../components/UI/Button'
import confetti from 'canvas-confetti'

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const [paymentDetails, setPaymentDetails] = useState({
        paymentId: searchParams.get('payment_id') || '',
        orderId: searchParams.get('order_id') || '',
        courseName: searchParams.get('course') || 'Your Course',
        amount: searchParams.get('amount') || '0'
    })

    useEffect(() => {
        // Trigger confetti on mount
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-20">
            <div className="container-custom py-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">
                        Payment Successful!
                    </h1>

                    <p className="text-lg text-neutral-600 mb-8">
                        Congratulations! You are now enrolled in <strong>{paymentDetails.courseName}</strong>.
                        Check your email for login credentials and course access details.
                    </p>

                    {/* Payment Details Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 mb-8 text-left"
                    >
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                            Payment Details
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-600">Course</span>
                                <span className="font-medium text-neutral-900">{paymentDetails.courseName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-600">Amount Paid</span>
                                <span className="font-medium text-green-600">₹{parseInt(paymentDetails.amount).toLocaleString()}</span>
                            </div>
                            {paymentDetails.paymentId && (
                                <div className="flex justify-between py-2 border-b border-neutral-100">
                                    <span className="text-neutral-600">Payment ID</span>
                                    <span className="font-mono text-sm text-neutral-700">{paymentDetails.paymentId}</span>
                                </div>
                            )}
                            {paymentDetails.orderId && (
                                <div className="flex justify-between py-2">
                                    <span className="text-neutral-600">Order ID</span>
                                    <span className="font-mono text-sm text-neutral-700">{paymentDetails.orderId}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* What's Next */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-primary-50 rounded-2xl p-6 mb-8 text-left"
                    >
                        <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            What's Next?
                        </h2>

                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                <span className="text-primary-800">
                                    Check your email for login credentials and course access link
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                <span className="text-primary-800">
                                    Join our WhatsApp/Telegram group for live session updates
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                <span className="text-primary-800">
                                    Download course materials from your dashboard
                                </span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/courses">
                            <Button variant="outline" size="lg">
                                <BookOpen size={18} className="mr-2" />
                                Browse More Courses
                            </Button>
                        </Link>
                        <Link to="/">
                            <Button size="lg">
                                <Home size={18} className="mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    </div>

                    {/* Support */}
                    <p className="text-sm text-neutral-500 mt-8">
                        Need help? Contact us at{' '}
                        <a href="mailto:support@techspert.com" className="text-primary-600 hover:underline">
                            support@techspert.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default PaymentSuccess
