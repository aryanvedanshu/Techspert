/**
 * Client-side Tracking Utilities
 * Provides device detection, visitor ID generation, and browser info
 */

// Generate or retrieve persistent visitor ID
export const getVisitorId = () => {
    const STORAGE_KEY = 'techspert_visitor_id'
    let visitorId = localStorage.getItem(STORAGE_KEY)

    if (!visitorId) {
        visitorId = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem(STORAGE_KEY, visitorId)
    }

    return visitorId
}

// Detect device type
export const getDeviceType = () => {
    const ua = navigator.userAgent

    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
        return 'mobile'
    }
    return 'desktop'
}

// Detect browser name
export const getBrowserName = () => {
    const ua = navigator.userAgent

    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Edg')) return 'Edge'
    if (ua.includes('Chrome')) return 'Chrome'
    if (ua.includes('Safari')) return 'Safari'
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'

    return 'Unknown'
}

// Get full tracking context
export const getTrackingContext = () => {
    return {
        visitorId: getVisitorId(),
        device: getDeviceType(),
        browser: getBrowserName(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        url: window.location.href,
        timestamp: new Date().toISOString()
    }
}

// Store tracking token in session for form submission linking
export const storeTrackingToken = (token) => {
    sessionStorage.setItem('techspert_tracking_token', token)
}

export const getStoredTrackingToken = () => {
    return sessionStorage.getItem('techspert_tracking_token')
}

export const clearTrackingToken = () => {
    sessionStorage.removeItem('techspert_tracking_token')
}

export default {
    getVisitorId,
    getDeviceType,
    getBrowserName,
    getTrackingContext,
    storeTrackingToken,
    getStoredTrackingToken,
    clearTrackingToken
}
