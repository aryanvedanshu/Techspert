/**
 * Lead Tracking Service - CRM/Analytics for Admin Panel
 * Handles: course_links, link_clicks, form_submissions, payments, leads
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    getCountFromServer
} from 'firebase/firestore'
import { db } from '../config/firebase'
import logger from '../utils/logger'

// Helper to generate unique tracking tokens
const generateTrackingToken = () => {
    return 'trk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
}

// Helper to convert timestamp
const convertTimestamp = (data) => {
    if (!data) return data
    const result = { ...data }
    Object.keys(result).forEach(key => {
        if (result[key] instanceof Timestamp) {
            result[key] = result[key].toDate().toISOString()
        }
    })
    return result
}

/**
 * Course Links Service
 * Manages admin-configurable links per course
 */
export const courseLinksService = {
    async getAll() {
        try {
            const q = query(collection(db, 'course_links'), orderBy('courseName', 'asc'))
            const snapshot = await getDocs(q)
            return {
                success: true,
                data: snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) }))
            }
        } catch (error) {
            logger.error('Error getting course links:', error)
            return { success: false, error: error.message }
        }
    },

    async getByCourseId(courseId) {
        try {
            const q = query(collection(db, 'course_links'), where('courseId', '==', courseId))
            const snapshot = await getDocs(q)
            if (snapshot.empty) return { success: true, data: null }
            return {
                success: true,
                data: { id: snapshot.docs[0].id, ...convertTimestamp(snapshot.docs[0].data()) }
            }
        } catch (error) {
            logger.error('Error getting course link:', error)
            return { success: false, error: error.message }
        }
    },

    async upsert(courseId, data) {
        try {
            const existing = await this.getByCourseId(courseId)
            const linkData = {
                ...data,
                courseId,
                updatedAt: serverTimestamp()
            }

            if (existing.data) {
                await updateDoc(doc(db, 'course_links', existing.data.id), linkData)
                return { success: true, id: existing.data.id }
            } else {
                linkData.createdAt = serverTimestamp()
                const docRef = await addDoc(collection(db, 'course_links'), linkData)
                return { success: true, id: docRef.id }
            }
        } catch (error) {
            logger.error('Error upserting course link:', error)
            return { success: false, error: error.message }
        }
    },

    async delete(id) {
        try {
            await deleteDoc(doc(db, 'course_links', id))
            return { success: true }
        } catch (error) {
            logger.error('Error deleting course link:', error)
            return { success: false, error: error.message }
        }
    }
}

/**
 * Link Clicks Service
 * Tracks all demo/form/payment link clicks
 */
export const linkClicksService = {
    async trackClick(data) {
        try {
            const trackingToken = generateTrackingToken()
            const clickData = {
                trackingToken,
                courseId: data.courseId || null,
                courseName: data.courseName || null,
                linkType: data.linkType, // 'demo' | 'form' | 'payment'
                visitorId: data.visitorId || null,
                ipHash: data.ipHash || null,
                userAgent: data.userAgent || null,
                device: data.device || 'unknown',
                browser: data.browser || 'unknown',
                referrer: data.referrer || null,
                timestamp: serverTimestamp(),
                formSubmissionId: null,
                paymentId: null,
                status: 'clicked'
            }

            const docRef = await addDoc(collection(db, 'link_clicks'), clickData)
            logger.info('Click tracked', { id: docRef.id, trackingToken })
            return { success: true, id: docRef.id, trackingToken }
        } catch (error) {
            logger.error('Error tracking click:', error)
            return { success: false, error: error.message }
        }
    },

    async getAll(filters = {}) {
        try {
            let constraints = [orderBy('timestamp', 'desc')]

            if (filters.linkType) {
                constraints = [where('linkType', '==', filters.linkType), ...constraints]
            }
            if (filters.limit) {
                constraints.push(limit(filters.limit))
            }

            const q = query(collection(db, 'link_clicks'), ...constraints)
            const snapshot = await getDocs(q)
            return {
                success: true,
                data: snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) }))
            }
        } catch (error) {
            logger.error('Error getting clicks:', error)
            return { success: false, error: error.message }
        }
    },

    async getByToken(trackingToken) {
        try {
            const q = query(collection(db, 'link_clicks'), where('trackingToken', '==', trackingToken))
            const snapshot = await getDocs(q)
            if (snapshot.empty) return { success: true, data: null }
            return {
                success: true,
                data: { id: snapshot.docs[0].id, ...convertTimestamp(snapshot.docs[0].data()) }
            }
        } catch (error) {
            logger.error('Error getting click by token:', error)
            return { success: false, error: error.message }
        }
    },

    async updateStatus(id, status, linkedId = null) {
        try {
            const updates = { status, updatedAt: serverTimestamp() }
            if (status === 'submitted' && linkedId) updates.formSubmissionId = linkedId
            if (status === 'paid' && linkedId) updates.paymentId = linkedId
            await updateDoc(doc(db, 'link_clicks', id), updates)
            return { success: true }
        } catch (error) {
            logger.error('Error updating click status:', error)
            return { success: false, error: error.message }
        }
    },

    async getCount(filters = {}) {
        try {
            let q = collection(db, 'link_clicks')
            if (filters.linkType) {
                q = query(q, where('linkType', '==', filters.linkType))
            }
            const snapshot = await getCountFromServer(q)
            return { success: true, count: snapshot.data().count }
        } catch (error) {
            logger.error('Error getting click count:', error)
            return { success: false, error: error.message, count: 0 }
        }
    }
}

/**
 * Form Submissions Service
 */
export const formSubmissionsService = {
    async create(data) {
        try {
            const submissionData = {
                trackingToken: data.trackingToken || null,
                clickId: data.clickId || null,
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                courseId: data.courseId || null,
                courseName: data.courseName || null,
                formType: data.formType, // 'demo_form' | 'contact_form' | 'enrollment_form'
                source: data.source || 'website',
                rawFormData: data.rawFormData || {},
                timestamp: serverTimestamp(),
                paymentId: null,
                paymentStatus: 'pending'
            }

            const docRef = await addDoc(collection(db, 'form_submissions'), submissionData)

            if (data.clickId) {
                await linkClicksService.updateStatus(data.clickId, 'submitted', docRef.id)
            }

            logger.info('Form submission tracked', { id: docRef.id })
            return { success: true, id: docRef.id }
        } catch (error) {
            logger.error('Error creating submission:', error)
            return { success: false, error: error.message }
        }
    },

    async getAll(filters = {}) {
        try {
            let constraints = [orderBy('timestamp', 'desc')]
            if (filters.formType) {
                constraints = [where('formType', '==', filters.formType), ...constraints]
            }
            if (filters.limit) {
                constraints.push(limit(filters.limit))
            }

            const q = query(collection(db, 'form_submissions'), ...constraints)
            const snapshot = await getDocs(q)
            return {
                success: true,
                data: snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) }))
            }
        } catch (error) {
            logger.error('Error getting submissions:', error)
            return { success: false, error: error.message }
        }
    },

    async getCount(filters = {}) {
        try {
            let q = collection(db, 'form_submissions')
            if (filters.formType) {
                q = query(q, where('formType', '==', filters.formType))
            }
            const snapshot = await getCountFromServer(q)
            return { success: true, count: snapshot.data().count }
        } catch (error) {
            logger.error('Error getting submission count:', error)
            return { success: false, error: error.message, count: 0 }
        }
    },

    async updatePaymentStatus(id, paymentId, status) {
        try {
            await updateDoc(doc(db, 'form_submissions', id), {
                paymentId,
                paymentStatus: status,
                updatedAt: serverTimestamp()
            })
            return { success: true }
        } catch (error) {
            logger.error('Error updating payment status:', error)
            return { success: false, error: error.message }
        }
    }
}

/**
 * CRM Payments Service
 */
export const crmPaymentsService = {
    async create(data) {
        try {
            const paymentData = {
                razorpayPaymentId: data.razorpayPaymentId,
                razorpayOrderId: data.razorpayOrderId || null,
                razorpaySignature: data.razorpaySignature || null,
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                amount: data.amount,
                currency: data.currency || 'INR',
                courseId: data.courseId || null,
                courseName: data.courseName || null,
                trackingToken: data.trackingToken || null,
                clickId: data.clickId || null,
                formSubmissionId: data.formSubmissionId || null,
                status: data.status || 'captured',
                timestamp: serverTimestamp(),
                generatedPassword: data.generatedPassword || null,
                credentialsSent: false
            }

            const docRef = await addDoc(collection(db, 'crm_payments'), paymentData)

            if (data.formSubmissionId) {
                await formSubmissionsService.updatePaymentStatus(data.formSubmissionId, docRef.id, 'completed')
            }
            if (data.clickId) {
                await linkClicksService.updateStatus(data.clickId, 'paid', docRef.id)
            }

            logger.info('Payment tracked', { id: docRef.id })
            return { success: true, id: docRef.id }
        } catch (error) {
            logger.error('Error creating payment:', error)
            return { success: false, error: error.message }
        }
    },

    async getAll(filters = {}) {
        try {
            let constraints = [orderBy('timestamp', 'desc')]
            if (filters.status) {
                constraints = [where('status', '==', filters.status), ...constraints]
            }
            if (filters.limit) {
                constraints.push(limit(filters.limit))
            }

            const q = query(collection(db, 'crm_payments'), ...constraints)
            const snapshot = await getDocs(q)
            return {
                success: true,
                data: snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) }))
            }
        } catch (error) {
            logger.error('Error getting payments:', error)
            return { success: false, error: error.message }
        }
    },

    async getCount(filters = {}) {
        try {
            let q = collection(db, 'crm_payments')
            if (filters.status) {
                q = query(q, where('status', '==', filters.status))
            }
            const snapshot = await getCountFromServer(q)
            return { success: true, count: snapshot.data().count }
        } catch (error) {
            logger.error('Error getting payment count:', error)
            return { success: false, error: error.message, count: 0 }
        }
    },

    async markCredentialsSent(id) {
        try {
            await updateDoc(doc(db, 'crm_payments', id), {
                credentialsSent: true,
                credentialsSentAt: serverTimestamp()
            })
            return { success: true }
        } catch (error) {
            logger.error('Error marking credentials sent:', error)
            return { success: false, error: error.message }
        }
    }
}

/**
 * Unified Leads Service
 */
export const leadsService = {
    async upsert(email, data) {
        try {
            const q = query(collection(db, 'leads'), where('email', '==', email))
            const snapshot = await getDocs(q)

            const leadData = {
                email,
                phone: data.phone || null,
                name: data.name || null,
                courseId: data.courseId || null,
                courseName: data.courseName || null,
                updatedAt: serverTimestamp()
            }

            if (data.clickId && snapshot.empty) {
                leadData.firstClickId = data.clickId
                leadData.firstClickAt = serverTimestamp()
            }
            if (data.formSubmissionId) {
                leadData.formSubmissionId = data.formSubmissionId
                leadData.submittedAt = serverTimestamp()
            }
            if (data.paymentId) {
                leadData.paymentId = data.paymentId
                leadData.paidAt = serverTimestamp()
            }

            // Determine status
            if (data.paymentId) {
                leadData.status = 'paid'
                leadData.journeyComplete = true
            } else if (data.formSubmissionId) {
                leadData.status = 'submitted'
            } else {
                leadData.status = 'clicked'
            }

            if (snapshot.empty) {
                leadData.createdAt = serverTimestamp()
                const docRef = await addDoc(collection(db, 'leads'), leadData)
                return { success: true, id: docRef.id }
            } else {
                await updateDoc(doc(db, 'leads', snapshot.docs[0].id), leadData)
                return { success: true, id: snapshot.docs[0].id }
            }
        } catch (error) {
            logger.error('Error upserting lead:', error)
            return { success: false, error: error.message }
        }
    },

    async getAll(filters = {}) {
        try {
            let constraints = [orderBy('updatedAt', 'desc')]
            if (filters.status) {
                constraints = [where('status', '==', filters.status), ...constraints]
            }
            if (filters.limit) {
                constraints.push(limit(filters.limit))
            }

            const q = query(collection(db, 'leads'), ...constraints)
            const snapshot = await getDocs(q)
            return {
                success: true,
                data: snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) }))
            }
        } catch (error) {
            logger.error('Error getting leads:', error)
            return { success: false, error: error.message }
        }
    },

    async getCountByStatus() {
        try {
            const [clicked, submitted, paid, total] = await Promise.all([
                getCountFromServer(query(collection(db, 'leads'), where('status', '==', 'clicked'))),
                getCountFromServer(query(collection(db, 'leads'), where('status', '==', 'submitted'))),
                getCountFromServer(query(collection(db, 'leads'), where('status', '==', 'paid'))),
                getCountFromServer(collection(db, 'leads'))
            ])

            return {
                success: true,
                data: {
                    clicked: clicked.data().count,
                    submitted: submitted.data().count,
                    paid: paid.data().count,
                    total: total.data().count
                }
            }
        } catch (error) {
            logger.error('Error getting lead counts:', error)
            return { success: false, error: error.message, data: { clicked: 0, submitted: 0, paid: 0, total: 0 } }
        }
    }
}

/**
 * Analytics Service
 */
export const leadAnalyticsService = {
    async getDashboardStats() {
        try {
            const [clicksDemo, submissions, payments, leads] = await Promise.all([
                linkClicksService.getCount({ linkType: 'demo' }),
                formSubmissionsService.getCount(),
                crmPaymentsService.getCount(),
                leadsService.getCountByStatus()
            ])

            return {
                success: true,
                data: {
                    demoClicks: clicksDemo.count || 0,
                    formSubmissions: submissions.count || 0,
                    payments: payments.count || 0,
                    leads: leads.data || { clicked: 0, submitted: 0, paid: 0, total: 0 }
                }
            }
        } catch (error) {
            logger.error('Error getting dashboard stats:', error)
            return { success: false, error: error.message }
        }
    }
}

// Legacy exports for backward compatibility
export const trackClick = linkClicksService.trackClick
export const trackSubmission = formSubmissionsService.create
export const trackPayment = crmPaymentsService.create
export const getDemoLink = courseLinksService.getByCourseId
export const saveDemoLink = courseLinksService.upsert

export default {
    courseLinksService,
    linkClicksService,
    formSubmissionsService,
    crmPaymentsService,
    leadsService,
    leadAnalyticsService,
    // Legacy
    trackClick,
    trackSubmission,
    trackPayment,
    getDemoLink,
    saveDemoLink
}
