/**
 * SiteSettingsContext.jsx
 * 
 * Provides real-time site settings synchronization from Firestore.
 * Listens to siteSettings, homepage, and other singleton docs.
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import logger from '../utils/logger'

// Default site settings
const defaultSettings = {
    siteName: 'Techspert',
    tagline: 'Master the Future of Technology',
    logo: '',
    favicon: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        youtube: '',
    },
}

const defaultHomepage = {
    hero: {
        title: 'Master the Future of Technology',
        subtitle: 'Learn cutting-edge skills from industry experts',
        ctaText: 'Start Learning Today',
        ctaLink: '/courses',
        backgroundImage: '',
    },
    featuredSection: {
        title: 'Why Choose Us',
        subtitle: 'We provide the best learning experience',
    },
}

const defaultDemoLink = {
    currentDemoLink: '',
    lastUpdated: null,
}

const defaultDynamicLinks = {
    demoClassLink: '',
    registrationFormLink: '',
    whatsappLink: '',
    youtubeChannelLink: '',
    brochureLink: '',
}

const SiteSettingsContext = createContext({
    settings: defaultSettings,
    homepage: defaultHomepage,
    demoLink: defaultDemoLink,
    dynamicLinks: defaultDynamicLinks,
    loading: true,
})


export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings)
    const [homepage, setHomepage] = useState(defaultHomepage)
    const [demoLink, setDemoLink] = useState(defaultDemoLink)
    const [dynamicLinks, setDynamicLinks] = useState(defaultDynamicLinks)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        logger.info('SiteSettingsProvider: Setting up realtime listeners')

        const unsubscribers = []

        // Listen to siteSettings/main
        const settingsRef = doc(db, 'siteSettings', 'main')
        unsubscribers.push(
            onSnapshot(
                settingsRef,
                (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data()
                        logger.info('SiteSettingsProvider: Settings updated', data)
                        setSettings({ ...defaultSettings, ...data })
                        // Also update dynamicLinks if present in settings
                        if (data.dynamicLinks) {
                            setDynamicLinks({ ...defaultDynamicLinks, ...data.dynamicLinks })
                        }
                    }
                },
                (error) => {
                    logger.error('SiteSettingsProvider: Error listening to settings', error)
                }
            )
        )

        // Listen to homepage/main
        const homepageRef = doc(db, 'homepage', 'main')
        unsubscribers.push(
            onSnapshot(
                homepageRef,
                (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data()
                        logger.info('SiteSettingsProvider: Homepage updated', data)
                        setHomepage({ ...defaultHomepage, ...data })
                    }
                },
                (error) => {
                    logger.error('SiteSettingsProvider: Error listening to homepage', error)
                }
            )
        )

        // Listen to demo_class_links/active for realtime demo link
        const demoRef = doc(db, 'demo_class_links', 'active')
        unsubscribers.push(
            onSnapshot(
                demoRef,
                (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data()
                        logger.info('SiteSettingsProvider: Demo link updated', data)
                        setDemoLink({ ...defaultDemoLink, ...data })
                    }
                    setLoading(false)
                },
                (error) => {
                    logger.error('SiteSettingsProvider: Error listening to demo link', error)
                    setLoading(false)
                }
            )
        )

        return () => {
            logger.info('SiteSettingsProvider: Cleaning up listeners')
            unsubscribers.forEach((unsub) => unsub())
        }
    }, [])

    return (
        <SiteSettingsContext.Provider value={{ settings, homepage, demoLink, dynamicLinks, loading }}>
            {children}
        </SiteSettingsContext.Provider>
    )
}

export const useSiteSettings = () => {
    const context = useContext(SiteSettingsContext)
    if (!context) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
    }
    return context
}

export default SiteSettingsContext
