import { motion } from 'framer-motion'
import { Shield, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Privacy = () => {
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
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900">
                            Privacy Policy
                        </h1>
                    </div>

                    <p className="text-neutral-500 mb-8">Last Updated: December 2024</p>

                    <div className="prose prose-lg prose-neutral max-w-none">
                        <h2>1. Introduction</h2>
                        <p>Techspert ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>

                        <h2>2. Information We Collect</h2>
                        <h3>2.1 Personal Information</h3>
                        <p>We may collect personally identifiable information, including:</p>
                        <ul>
                            <li>Name and email address</li>
                            <li>Phone number</li>
                            <li>Billing and payment information</li>
                            <li>Educational background</li>
                            <li>Professional experience</li>
                        </ul>

                        <h3>2.2 Usage Data</h3>
                        <p>We automatically collect:</p>
                        <ul>
                            <li>IP address and browser type</li>
                            <li>Device information</li>
                            <li>Pages visited and time spent</li>
                            <li>Course progress and completion data</li>
                        </ul>

                        <h2>3. How We Use Your Information</h2>
                        <p>We use collected information to:</p>
                        <ul>
                            <li>Provide and maintain our services</li>
                            <li>Process payments and enrollments</li>
                            <li>Send course updates and materials</li>
                            <li>Communicate about new courses and offers (with consent)</li>
                            <li>Improve our platform and user experience</li>
                            <li>Comply with legal obligations</li>
                        </ul>

                        <h2>4. Cookies and Tracking</h2>
                        <p>We use cookies and similar technologies to:</p>
                        <ul>
                            <li>Remember your preferences</li>
                            <li>Analyze website traffic</li>
                            <li>Enable certain functionalities</li>
                        </ul>
                        <p>You can control cookies through your browser settings.</p>

                        <h2>5. Data Sharing</h2>
                        <p>We do not sell your personal information. We may share data with:</p>
                        <ul>
                            <li><strong>Payment processors:</strong> Razorpay for secure transactions</li>
                            <li><strong>Analytics providers:</strong> To understand usage patterns</li>
                            <li><strong>Legal authorities:</strong> When required by law</li>
                        </ul>

                        <h2>6. Data Security</h2>
                        <p>We implement security measures including:</p>
                        <ul>
                            <li>SSL encryption for data transmission</li>
                            <li>Secure storage with Firebase</li>
                            <li>Regular security audits</li>
                            <li>Access controls for staff</li>
                        </ul>

                        <h2>7. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal data</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Withdraw consent at any time</li>
                        </ul>

                        <h2>8. Data Retention</h2>
                        <p>We retain your data for as long as necessary to provide services and comply with legal obligations. Course completion records may be retained for certification purposes.</p>

                        <h2>9. Children's Privacy</h2>
                        <p>Our services are not intended for children under 13. We do not knowingly collect data from children under 13.</p>

                        <h2>10. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or website notice.</p>

                        <h2>11. Contact Us</h2>
                        <p>For privacy-related inquiries:</p>
                        <p>Email: privacy@techspert.com</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Privacy
