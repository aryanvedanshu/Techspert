/**
 * ThemeContext.jsx
 * 
 * Provides real-time theme synchronization from Firestore to CSS variables.
 * Uses onSnapshot() to listen for theme changes and apply them instantly.
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import logger from '../utils/logger'

// Default theme values
const defaultTheme = {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: 8,
    navBgColor: '#ffffff',
    footerBgColor: '#1f2937',
}

const ThemeContext = createContext({
    theme: defaultTheme,
    loading: true,
    updateTheme: async () => { },
})

// Convert hex to RGB for CSS variable support
const hexToRgb = (hex) => {
    if (!hex) return '99, 102, 241'
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '99, 102, 241'
}

// Apply theme to CSS variables on :root
const applyThemeToCSS = (theme) => {
    const root = document.documentElement

    // Primary colors
    root.style.setProperty('--color-primary-500', theme.primaryColor || defaultTheme.primaryColor)
    root.style.setProperty('--color-primary-600', theme.primaryColor || defaultTheme.primaryColor)
    root.style.setProperty('--color-primary-rgb', hexToRgb(theme.primaryColor))

    // Secondary colors
    root.style.setProperty('--color-secondary-500', theme.secondaryColor || defaultTheme.secondaryColor)
    root.style.setProperty('--color-secondary-rgb', hexToRgb(theme.secondaryColor))

    // Accent colors
    root.style.setProperty('--color-accent-500', theme.accentColor || defaultTheme.accentColor)
    root.style.setProperty('--color-accent-rgb', hexToRgb(theme.accentColor))

    // Background and text
    root.style.setProperty('--color-background', theme.backgroundColor || defaultTheme.backgroundColor)
    root.style.setProperty('--color-text', theme.textColor || defaultTheme.textColor)

    // Fonts
    root.style.setProperty('--font-heading', theme.headingFont || defaultTheme.headingFont)
    root.style.setProperty('--font-body', theme.bodyFont || defaultTheme.bodyFont)

    // Border radius
    root.style.setProperty('--border-radius', `${theme.borderRadius || defaultTheme.borderRadius}px`)
    root.style.setProperty('--border-radius-lg', `${(theme.borderRadius || defaultTheme.borderRadius) * 2}px`)
    root.style.setProperty('--border-radius-xl', `${(theme.borderRadius || defaultTheme.borderRadius) * 3}px`)

    // Nav and Footer
    root.style.setProperty('--nav-bg-color', theme.navBgColor || defaultTheme.navBgColor)
    root.style.setProperty('--footer-bg-color', theme.footerBgColor || defaultTheme.footerBgColor)

    logger.debug('Theme applied to CSS variables', theme)
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(defaultTheme)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        logger.info('ThemeProvider: Setting up realtime theme listener')

        // Listen to theme/active document for realtime updates
        const themeRef = doc(db, 'theme', 'active')

        const unsubscribe = onSnapshot(
            themeRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const themeData = docSnapshot.data()
                    logger.info('ThemeProvider: Theme updated from Firestore', themeData)
                    setTheme({ ...defaultTheme, ...themeData })
                    applyThemeToCSS({ ...defaultTheme, ...themeData })
                } else {
                    logger.warn('ThemeProvider: No theme document found, using defaults')
                    setTheme(defaultTheme)
                    applyThemeToCSS(defaultTheme)
                }
                setLoading(false)
            },
            (error) => {
                logger.error('ThemeProvider: Error listening to theme', error)
                setTheme(defaultTheme)
                applyThemeToCSS(defaultTheme)
                setLoading(false)
            }
        )

        // Apply default theme immediately
        applyThemeToCSS(defaultTheme)

        return () => {
            logger.info('ThemeProvider: Cleaning up theme listener')
            unsubscribe()
        }
    }, [])

    // Function to update theme (for admin panel)
    const updateTheme = async (newTheme) => {
        try {
            const themeRef = doc(db, 'theme', 'active')
            await setDoc(themeRef, {
                ...newTheme,
                updatedAt: new Date().toISOString(),
            }, { merge: true })
            logger.success('Theme saved to Firestore', newTheme)
            return { success: true }
        } catch (error) {
            logger.error('Failed to save theme', error)
            return { success: false, error }
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, loading, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export default ThemeContext
