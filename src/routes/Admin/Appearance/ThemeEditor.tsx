/**
 * ThemeEditor.tsx
 * 
 * Admin page for customizing the site's visual theme.
 * 
 * Features:
 * - Primary/secondary color pickers
 * - Font selection
 * - Border radius settings
 * - Live preview
 * - Reset to defaults
 * 
 * @module routes/Admin/Appearance/ThemeEditor
 */

import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Palette, Type, Square, Eye } from 'lucide-react'
import { FormField, Button, Card, CardHeader } from '../../../../components'
import { themeService } from '../../../../services/firestoreTyped.service'
import { useToast } from '../../../../components/ui/Toast'
import { ThemeConfig } from '../../../../types'
import { AdminGuard } from '../../../../contexts/AdminAuthContext'

// ============================================================================
// DEFAULT THEME
// ============================================================================

const defaultTheme: Omit<ThemeConfig, 'id'> = {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: 8,
}

// Font options
const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Outfit', label: 'Outfit' },
    { value: 'DM Sans', label: 'DM Sans' },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function ThemeEditor() {
    const { success, error: toastError } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [theme, setTheme] = useState<Omit<ThemeConfig, 'id'>>(defaultTheme)
    const [showPreview, setShowPreview] = useState(true)

    // Fetch theme on mount
    useEffect(() => {
        const fetchTheme = async () => {
            setLoading(true)
            try {
                const data = await themeService.get()
                if (data) {
                    setTheme({
                        primaryColor: data.primaryColor || defaultTheme.primaryColor,
                        secondaryColor: data.secondaryColor || defaultTheme.secondaryColor,
                        accentColor: data.accentColor || defaultTheme.accentColor,
                        backgroundColor: data.backgroundColor || defaultTheme.backgroundColor,
                        textColor: data.textColor || defaultTheme.textColor,
                        headingFont: data.headingFont || defaultTheme.headingFont,
                        bodyFont: data.bodyFont || defaultTheme.bodyFont,
                        borderRadius: data.borderRadius ?? defaultTheme.borderRadius,
                    })
                }
            } catch (err) {
                toastError('Error', 'Failed to load theme')
            }
            setLoading(false)
        }

        fetchTheme()
    }, [])

    // Handle theme change
    const handleChange = (field: keyof Omit<ThemeConfig, 'id'>, value: unknown) => {
        setTheme((prev) => ({ ...prev, [field]: value }))
    }

    // Save theme
    const handleSave = async () => {
        setSaving(true)
        try {
            await themeService.update(theme)
            success('Theme Saved', 'Your theme changes have been applied')
        } catch (err) {
            toastError('Error', 'Failed to save theme')
        }
        setSaving(false)
    }

    // Reset to defaults
    const handleReset = () => {
        setTheme(defaultTheme)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <AdminGuard permission="theme.edit" fallback={<ViewOnly />}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Theme Editor</h1>
                        <p className="text-neutral-500 mt-1">Customize your site's visual appearance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handleReset} icon={<RotateCcw size={18} />}>
                            Reset
                        </Button>
                        <Button onClick={handleSave} loading={saving} icon={<Save size={18} />}>
                            Save Theme
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Colors */}
                    <Card>
                        <CardHeader
                            title="Colors"
                            subtitle="Define your brand colors"
                        />
                        <div className="space-y-4 mt-4">
                            <FormField
                                name="primaryColor"
                                label="Primary Color"
                                type="color"
                                value={theme.primaryColor}
                                onChange={(v) => handleChange('primaryColor', v)}
                            />
                            <FormField
                                name="secondaryColor"
                                label="Secondary Color"
                                type="color"
                                value={theme.secondaryColor}
                                onChange={(v) => handleChange('secondaryColor', v)}
                            />
                            <FormField
                                name="accentColor"
                                label="Accent Color"
                                type="color"
                                value={theme.accentColor}
                                onChange={(v) => handleChange('accentColor', v)}
                            />
                            <FormField
                                name="backgroundColor"
                                label="Background Color"
                                type="color"
                                value={theme.backgroundColor}
                                onChange={(v) => handleChange('backgroundColor', v)}
                            />
                            <FormField
                                name="textColor"
                                label="Text Color"
                                type="color"
                                value={theme.textColor}
                                onChange={(v) => handleChange('textColor', v)}
                            />
                        </div>
                    </Card>

                    {/* Typography */}
                    <Card>
                        <CardHeader
                            title="Typography"
                            subtitle="Font settings"
                        />
                        <div className="space-y-4 mt-4">
                            <FormField
                                name="headingFont"
                                label="Heading Font"
                                type="select"
                                value={theme.headingFont}
                                onChange={(v) => handleChange('headingFont', v)}
                                options={fontOptions}
                            />
                            <FormField
                                name="bodyFont"
                                label="Body Font"
                                type="select"
                                value={theme.bodyFont}
                                onChange={(v) => handleChange('bodyFont', v)}
                                options={fontOptions}
                            />
                            <FormField
                                name="borderRadius"
                                label="Border Radius (px)"
                                type="number"
                                value={theme.borderRadius}
                                onChange={(v) => handleChange('borderRadius', v)}
                                min={0}
                                max={24}
                                helperText="0 = square, 24 = very rounded"
                            />
                        </div>
                    </Card>

                    {/* Preview */}
                    <Card className="lg:col-span-2">
                        <CardHeader
                            title="Live Preview"
                            subtitle="See how your theme looks"
                            action={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPreview(!showPreview)}
                                    icon={<Eye size={16} />}
                                >
                                    {showPreview ? 'Hide' : 'Show'}
                                </Button>
                            }
                        />
                        {showPreview && (
                            <div
                                className="mt-4 p-6 rounded-xl border-2 border-dashed border-neutral-200"
                                style={{
                                    backgroundColor: theme.backgroundColor,
                                    borderRadius: `${theme.borderRadius}px`,
                                }}
                            >
                                <h2
                                    className="text-2xl font-bold mb-2"
                                    style={{
                                        color: theme.textColor,
                                        fontFamily: theme.headingFont,
                                    }}
                                >
                                    Sample Heading
                                </h2>
                                <p
                                    className="mb-4"
                                    style={{
                                        color: theme.textColor,
                                        fontFamily: theme.bodyFont,
                                    }}
                                >
                                    This is sample body text to show how your theme looks. You can customize
                                    the colors, fonts, and border radius to match your brand.
                                </p>

                                <div className="flex gap-3 flex-wrap">
                                    <button
                                        className="px-4 py-2 text-white font-medium transition-colors"
                                        style={{
                                            backgroundColor: theme.primaryColor,
                                            borderRadius: `${theme.borderRadius}px`,
                                        }}
                                    >
                                        Primary Button
                                    </button>
                                    <button
                                        className="px-4 py-2 text-white font-medium transition-colors"
                                        style={{
                                            backgroundColor: theme.secondaryColor,
                                            borderRadius: `${theme.borderRadius}px`,
                                        }}
                                    >
                                        Secondary Button
                                    </button>
                                    <button
                                        className="px-4 py-2 text-white font-medium transition-colors"
                                        style={{
                                            backgroundColor: theme.accentColor,
                                            borderRadius: `${theme.borderRadius}px`,
                                        }}
                                    >
                                        Accent Button
                                    </button>
                                </div>

                                <div className="mt-4 flex gap-4">
                                    <div
                                        className="w-16 h-16 flex items-center justify-center text-white font-bold"
                                        style={{
                                            backgroundColor: theme.primaryColor,
                                            borderRadius: `${theme.borderRadius}px`,
                                        }}
                                    >
                                        <Palette size={24} />
                                    </div>
                                    <div
                                        className="w-16 h-16 flex items-center justify-center text-white font-bold"
                                        style={{
                                            backgroundColor: theme.secondaryColor,
                                            borderRadius: `${theme.borderRadius}px`,
                                        }}
                                    >
                                        <Type size={24} />
                                    </div>
                                    <div
                                        className="w-16 h-16 flex items-center justify-center text-white font-bold"
                                        style={{
                                            backgroundColor: theme.accentColor,
                                            borderRadius: `${theme.borderRadius}px`,
                                        }}
                                    >
                                        <Square size={24} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AdminGuard>
    )
}

function ViewOnly() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900">View Only</h2>
                <p className="text-neutral-500 mt-2">You do not have permission to edit the theme.</p>
            </div>
        </div>
    )
}
