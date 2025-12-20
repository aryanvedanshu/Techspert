/**
 * Email Service using EmailJS
 * 
 * EmailJS allows sending emails directly from client-side JavaScript
 * Free tier: 200 emails/month
 * 
 * SETUP REQUIRED:
 * 1. Go to https://www.emailjs.com/ and create a free account
 * 2. Add an email service (Gmail recommended)
 * 3. Create email templates
 * 4. Update the constants below with your IDs
 */

import emailjs from '@emailjs/browser'
import logger from '../utils/logger'

// EmailJS Configuration
// IMPORTANT: Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
    serviceId: 'service_techspert', // Your EmailJS service ID
    publicKey: 'YOUR_PUBLIC_KEY',   // Your EmailJS public key
    templates: {
        demoWelcome: 'template_demo_welcome',     // Template for demo registration welcome
        enquiryConfirm: 'template_enquiry_confirm', // Template for enquiry confirmation
    }
}

// Check if EmailJS is configured
const isEmailJSConfigured = () => {
    return EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY'
}

/**
 * Initialize EmailJS
 * Call this once when the app starts
 */
export const initEmailJS = () => {
    if (isEmailJSConfigured()) {
        emailjs.init(EMAILJS_CONFIG.publicKey)
        logger.info('EmailJS initialized')
    } else {
        logger.warn('EmailJS not configured - emails will not be sent automatically')
    }
}

/**
 * Send demo registration welcome email to student
 */
export const sendDemoWelcomeEmail = async (data) => {
    if (!isEmailJSConfigured()) {
        logger.warn('EmailJS not configured - skipping demo welcome email')
        return { success: false, error: 'EmailJS not configured' }
    }

    try {
        const templateParams = {
            to_name: data.name,
            to_email: data.email,
            course_name: data.courseName || 'our course',
            demo_link: data.demoLink || 'Will be sent before the session',
            demo_day: 'Every Saturday',
            demo_time: '2:00 PM - 3:00 PM IST',
            demo_duration: '1 Hour',
            from_name: 'Techspert Team',
            reply_to: 'aryangoel299@gmail.com',
        }

        const result = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.demoWelcome,
            templateParams
        )

        logger.info('Demo welcome email sent', { email: data.email, status: result.status })
        return { success: true, status: result.status }
    } catch (error) {
        logger.error('Failed to send demo welcome email', error)
        return { success: false, error: error.message }
    }
}

/**
 * Send enquiry confirmation email to user
 */
export const sendEnquiryConfirmEmail = async (data) => {
    if (!isEmailJSConfigured()) {
        logger.warn('EmailJS not configured - skipping enquiry confirmation email')
        return { success: false, error: 'EmailJS not configured' }
    }

    try {
        const templateParams = {
            to_name: data.name,
            to_email: data.email,
            subject: data.subject || 'your enquiry',
            message: data.message || '',
            from_name: 'Techspert Team',
            reply_to: 'aryangoel299@gmail.com',
        }

        const result = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templates.enquiryConfirm,
            templateParams
        )

        logger.info('Enquiry confirmation email sent', { email: data.email, status: result.status })
        return { success: true, status: result.status }
    } catch (error) {
        logger.error('Failed to send enquiry confirmation email', error)
        return { success: false, error: error.message }
    }
}

/**
 * Fallback: Open mailto link if EmailJS is not configured
 */
export const openMailtoFallback = (to, subject, body) => {
    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
}

export default {
    initEmailJS,
    sendDemoWelcomeEmail,
    sendEnquiryConfirmEmail,
    isEmailJSConfigured,
    openMailtoFallback,
}
