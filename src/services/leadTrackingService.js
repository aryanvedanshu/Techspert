/**
 * Lead Tracking Service
 * 
 * Tracks user interactions through the lead pipeline:
 * - clicked: User clicked demo link
 * - submitted: User submitted form
 * - paid: User confirmed payment
 */

import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import logger from '../utils/logger'

const LEAD_TRACKING_COLLECTION = 'lead_tracking'
const DEMO_LINKS_COLLECTION = 'demo_links'

/**
 * Track when a user clicks on a demo link
 */
export const trackClick = async (courseId, source = 'demo_modal') => {
    try {
        logger.info('Tracking demo click', { courseId, source })

        const trackingRef = collection(db, LEAD_TRACKING_COLLECTION)
        const result = await addDoc(trackingRef, {
            courseId,
            stage: 'clicked',
            source,
            timestamp: serverTimestamp(),
            createdAt: serverTimestamp(),
        })

        logger.success('Click tracked', { id: result.id, courseId })
        return { success: true, id: result.id }
    } catch (error) {
        logger.error('Failed to track click', error)
        return { success: false, error }
    }
}

/**
 * Track form submission (from Google Form sync or direct)
 */
export const trackSubmission = async (courseId, formData) => {
    try {
        logger.info('Tracking form submission', { courseId })

        const trackingRef = collection(db, LEAD_TRACKING_COLLECTION)
        const result = await addDoc(trackingRef, {
            courseId,
            stage: 'submitted',
            name: formData.name || '',
            email: formData.email || '',
            phone: formData.phone || '',
            experienceLevel: formData.experienceLevel || '',
            source: 'form_submission',
            timestamp: serverTimestamp(),
            createdAt: serverTimestamp(),
            raw: formData,
        })

        logger.success('Submission tracked', { id: result.id, courseId })
        return { success: true, id: result.id }
    } catch (error) {
        logger.error('Failed to track submission', error)
        return { success: false, error }
    }
}

/**
 * Track payment confirmation
 */
export const trackPayment = async (courseId, paymentData) => {
    try {
        logger.info('Tracking payment', { courseId })

        const trackingRef = collection(db, LEAD_TRACKING_COLLECTION)
        const result = await addDoc(trackingRef, {
            courseId,
            stage: 'paid',
            name: paymentData.name || '',
            email: paymentData.email || '',
            phone: paymentData.phone || '',
            paymentAmount: paymentData.paymentAmount || 0,
            paymentMode: paymentData.paymentMode || '',
            paymentConfirmed: true,
            source: 'payment_confirmation',
            timestamp: serverTimestamp(),
            createdAt: serverTimestamp(),
            raw: paymentData,
        })

        logger.success('Payment tracked', { id: result.id, courseId })
        return { success: true, id: result.id }
    } catch (error) {
        logger.error('Failed to track payment', error)
        return { success: false, error }
    }
}

/**
 * Get demo links for a specific course
 */
export const getDemoLink = async (courseId) => {
    try {
        const { doc: getDoc, getDoc: getDocFn } = await import('firebase/firestore')
        const docRef = doc(db, DEMO_LINKS_COLLECTION, courseId)
        const docSnap = await getDocFn(docRef)

        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } }
        }
        return { success: true, data: null }
    } catch (error) {
        logger.error('Failed to get demo link', error)
        return { success: false, error }
    }
}

/**
 * Save demo links for a course
 */
export const saveDemoLink = async (courseId, linkData, userId = 'admin') => {
    try {
        logger.info('Saving demo link', { courseId })

        const docRef = doc(db, DEMO_LINKS_COLLECTION, courseId)
        await setDoc(docRef, {
            courseId,
            demoMeetLink: linkData.demoMeetLink || '',
            leadClickLink: linkData.leadClickLink || '',
            formSubmitLink: linkData.formSubmitLink || '',
            paymentSubmitLink: linkData.paymentSubmitLink || '',
            lastUpdated: serverTimestamp(),
            updatedBy: userId,
        }, { merge: true })

        logger.success('Demo link saved', { courseId })
        return { success: true }
    } catch (error) {
        logger.error('Failed to save demo link', error)
        return { success: false, error }
    }
}

export default {
    trackClick,
    trackSubmission,
    trackPayment,
    getDemoLink,
    saveDemoLink,
}
