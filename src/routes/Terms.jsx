import { motion } from 'framer-motion'
import { FileText, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Terms = () => {
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
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900">
                            Terms & Conditions
                        </h1>
                    </div>

                    <p className="text-neutral-500 mb-8">Last Updated: December 2024</p>

                    <div className="prose prose-lg prose-neutral max-w-none">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using the Techspert website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>

                        <h2>2. Services Description</h2>
                        <p>Techspert provides online technology education courses, including but not limited to:</p>
                        <ul>
                            <li>Live interactive training sessions</li>
                            <li>Pre-recorded video lessons</li>
                            <li>Practice assignments and projects</li>
                            <li>Certification upon course completion</li>
                            <li>Career guidance and placement assistance</li>
                        </ul>

                        <h2>3. User Accounts</h2>
                        <p>To access certain features, you must create an account. You agree to:</p>
                        <ul>
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>

                        <h2>4. Course Enrollment & Payment</h2>
                        <p>Upon enrollment and payment:</p>
                        <ul>
                            <li>You receive access to the specific course materials purchased</li>
                            <li>Access duration is as specified for each course</li>
                            <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
                            <li>Payments are processed securely through Razorpay</li>
                        </ul>

                        <h2>5. Intellectual Property</h2>
                        <p>All course materials, including videos, documents, code samples, and assignments are the intellectual property of Techspert. You may not:</p>
                        <ul>
                            <li>Copy, distribute, or share course materials</li>
                            <li>Record or screenshot live sessions without permission</li>
                            <li>Use materials for commercial purposes</li>
                            <li>Resell or sublicense access to courses</li>
                        </ul>

                        <h2>6. Code of Conduct</h2>
                        <p>Students must maintain professional behavior:</p>
                        <ul>
                            <li>No harassment or discrimination of any kind</li>
                            <li>No cheating or plagiarism in assignments</li>
                            <li>Respect intellectual property of others</li>
                            <li>Follow instructions from trainers</li>
                        </ul>

                        <h2>7. Limitation of Liability</h2>
                        <p>Techspert is not liable for:</p>
                        <ul>
                            <li>Technical issues beyond our control</li>
                            <li>Career outcomes or job placement guarantees</li>
                            <li>Third-party content or websites linked from our platform</li>
                            <li>Loss of data due to user negligence</li>
                        </ul>

                        <h2>8. Modifications to Terms</h2>
                        <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>

                        <h2>9. Governing Law</h2>
                        <p>These terms are governed by the laws of India. Any disputes shall be resolved in the courts of India.</p>

                        <h2>10. Contact Information</h2>
                        <p>For questions about these Terms & Conditions:</p>
                        <p>Email: support@techspert.com</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Terms
