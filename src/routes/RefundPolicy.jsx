import { motion } from 'framer-motion'
import { RefreshCw, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-white pt-20">
            <div className="container-custom py-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
                        <ArrowLeft size={18} />
                        Back to Home
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 text-orange-600" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900">
                            Refund & Cancellation Policy
                        </h1>
                    </div>

                    <p className="text-neutral-500 mb-8">Last Updated: December 2024</p>

                    <div className="prose prose-lg prose-neutral max-w-none">
                        <h2>1. Overview</h2>
                        <p>At Techspert, we strive to provide high-quality education and ensure student satisfaction. This policy outlines our refund and cancellation procedures.</p>

                        <h2>2. Free Demo Classes</h2>
                        <p>We offer free demo sessions for all our courses. We encourage you to attend a demo before making a purchase decision. Demo sessions are completely free with no obligation to enroll.</p>

                        <h2>3. Refund Eligibility</h2>

                        <h3>3.1 Full Refund (Within 7 Days)</h3>
                        <p>You are eligible for a <strong>full refund</strong> if:</p>
                        <ul>
                            <li>You request a refund within 7 days of payment</li>
                            <li>You have attended less than 2 live sessions</li>
                            <li>You have accessed less than 20% of recorded content</li>
                        </ul>

                        <h3>3.2 Partial Refund (8-14 Days)</h3>
                        <p>A <strong>50% refund</strong> may be provided if:</p>
                        <ul>
                            <li>Request is made between 8-14 days of payment</li>
                            <li>Less than 40% of course content accessed</li>
                            <li>Valid reason for discontinuation provided</li>
                        </ul>

                        <h3>3.3 No Refund</h3>
                        <p>Refunds are <strong>not available</strong> after:</p>
                        <ul>
                            <li>14 days from the date of payment</li>
                            <li>40% or more of course content has been accessed</li>
                            <li>Certificate has been issued</li>
                            <li>Course has been completed</li>
                        </ul>

                        <h2>4. Non-Refundable Items</h2>
                        <p>The following are non-refundable:</p>
                        <ul>
                            <li>One-on-one mentoring sessions once scheduled</li>
                            <li>Downloaded course materials</li>
                            <li>Certification fees (if separate)</li>
                            <li>Administrative or processing fees</li>
                        </ul>

                        <h2>5. How to Request a Refund</h2>
                        <p>To request a refund:</p>
                        <ol>
                            <li>Email us at <strong>refunds@techspert.com</strong></li>
                            <li>Include your order/payment ID</li>
                            <li>Provide your registered email address</li>
                            <li>State the reason for refund request</li>
                        </ol>

                        <h2>6. Refund Processing</h2>
                        <ul>
                            <li>Refund requests are reviewed within <strong>3-5 business days</strong></li>
                            <li>Approved refunds are processed within <strong>7-10 business days</strong></li>
                            <li>Refunds are credited to the original payment method</li>
                            <li>Bank processing may take additional 5-7 days</li>
                        </ul>

                        <h2>7. Course Cancellation by Techspert</h2>
                        <p>In rare cases where we cancel a course:</p>
                        <ul>
                            <li>Full refund will be provided</li>
                            <li>Option to transfer to another batch/course</li>
                            <li>Prior notice of at least 7 days will be given</li>
                        </ul>

                        <h2>8. Batch Transfer</h2>
                        <p>Instead of a refund, you may request to:</p>
                        <ul>
                            <li>Transfer to a future batch of the same course</li>
                            <li>Transfer credit to a different course (subject to price difference)</li>
                        </ul>

                        <h2>9. Disputes</h2>
                        <p>If you disagree with a refund decision:</p>
                        <ol>
                            <li>Contact our support team for review</li>
                            <li>Provide additional documentation if needed</li>
                            <li>Final decision will be communicated within 7 days</li>
                        </ol>

                        <h2>10. Contact Information</h2>
                        <p>For refund queries:</p>
                        <p>Email: refunds@techspert.com<br />
                            Business Hours: Monday-Saturday, 10 AM - 6 PM IST</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default RefundPolicy
