/**
 * SiteSettings.tsx
 * 
 * Admin page for managing site-wide settings.
 * 
 * Features:
 * - Site name and tagline
 * - Logo and favicon upload
 * - SEO settings
 * - Contact information
 * - Social media links
 * 
 * @module routes/Admin/Settings/SiteSettings
 */

import React, { useState, useEffect } from 'react'
import { Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { FormField, FileUpload, Button, Card, CardHeader } from '../../../../components'
import { siteSettingsService, companyInfoService } from '../../../../services/firestoreTyped.service'
import { uploadSiteAsset } from '../../../../services/storageTyped.service'
import { useToast } from '../../../../components/ui/Toast'
import { SiteSettings as SiteSettingsType, CompanyInfo } from '../../../../types'
import { AdminGuard } from '../../../../contexts/AdminAuthContext'

// ============================================================================
// COMPONENT
// ============================================================================

export default function SiteSettings() {
    const { success, error: toastError } = useToast()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Site settings state
    const [settings, setSettings] = useState<Partial<SiteSettingsType>>({
        siteName: '',
        tagline: '',
        logo: '',
        favicon: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: [],
    })

    // Company info state
    const [companyInfo, setCompanyInfo] = useState<Partial<CompanyInfo>>({
        name: '',
        email: '',
        phone: '',
        address: '',
        socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: '',
        },
    })

    // Fetch settings on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [siteData, companyData] = await Promise.all([
                    siteSettingsService.get(),
                    companyInfoService.get(),
                ])

                if (siteData) {
                    setSettings(siteData)
                }
                if (companyData) {
                    setCompanyInfo(companyData)
                }
            } catch (err) {
                toastError('Error', 'Failed to load settings')
            }
            setLoading(false)
        }

        fetchData()
    }, [])

    // Handle settings change
    const handleSettingsChange = (field: keyof SiteSettingsType, value: unknown) => {
        setSettings((prev) => ({ ...prev, [field]: value }))
    }

    // Handle company info change
    const handleCompanyChange = (field: keyof CompanyInfo, value: unknown) => {
        setCompanyInfo((prev) => ({ ...prev, [field]: value }))
    }

    // Handle social link change
    const handleSocialChange = (platform: string, value: string) => {
        setCompanyInfo((prev) => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value,
            },
        }))
    }

    // Handle logo upload
    const handleLogoUpload = async (file: File, onProgress: (p: number) => void) => {
        const result = await uploadSiteAsset(file, 'logo', (p) => onProgress(p.percentage))
        return result.url
    }

    // Handle favicon upload
    const handleFaviconUpload = async (file: File, onProgress: (p: number) => void) => {
        const result = await uploadSiteAsset(file, 'favicon', (p) => onProgress(p.percentage))
        return result.url
    }

    // Save all settings
    const handleSave = async () => {
        setSaving(true)
        try {
            await Promise.all([
                siteSettingsService.update(settings),
                companyInfoService.update(companyInfo),
            ])
            success('Settings Saved', 'Your changes have been saved successfully')
        } catch (err) {
            toastError('Error', 'Failed to save settings')
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <AdminGuard permission="settings.edit" fallback={<ViewOnly />}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Site Settings</h1>
                        <p className="text-neutral-500 mt-1">Configure your website's global settings</p>
                    </div>
                    <Button onClick={handleSave} loading={saving} icon={<Save size={18} />}>
                        Save Changes
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader title="General" subtitle="Basic site information" />
                        <div className="space-y-4 mt-4">
                            <FormField
                                name="siteName"
                                label="Site Name"
                                value={settings.siteName}
                                onChange={(v) => handleSettingsChange('siteName', v)}
                                placeholder="Techspert"
                            />
                            <FormField
                                name="tagline"
                                label="Tagline"
                                value={settings.tagline}
                                onChange={(v) => handleSettingsChange('tagline', v)}
                                placeholder="Learn from the best"
                            />
                        </div>
                    </Card>

                    {/* Branding */}
                    <Card>
                        <CardHeader title="Branding" subtitle="Logo and favicon" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-sm font-medium text-neutral-700 mb-2">Logo</p>
                                <FileUpload
                                    value={settings.logo}
                                    onChange={(url) => handleSettingsChange('logo', url)}
                                    onUpload={handleLogoUpload}
                                    accept="image/*"
                                    maxSize={2}
                                    previewSize="md"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-700 mb-2">Favicon</p>
                                <FileUpload
                                    value={settings.favicon}
                                    onChange={(url) => handleSettingsChange('favicon', url)}
                                    onUpload={handleFaviconUpload}
                                    accept="image/x-icon,image/png"
                                    maxSize={1}
                                    previewSize="sm"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                        <CardHeader title="SEO" subtitle="Search engine optimization" />
                        <div className="space-y-4 mt-4">
                            <FormField
                                name="seoTitle"
                                label="Meta Title"
                                value={settings.seoTitle}
                                onChange={(v) => handleSettingsChange('seoTitle', v)}
                                placeholder="Techspert - Professional Training Institute"
                                helperText="Recommended: 50-60 characters"
                            />
                            <FormField
                                name="seoDescription"
                                label="Meta Description"
                                type="textarea"
                                value={settings.seoDescription}
                                onChange={(v) => handleSettingsChange('seoDescription', v)}
                                rows={3}
                                placeholder="Learn cutting-edge technology skills..."
                                helperText="Recommended: 150-160 characters"
                            />
                            <FormField
                                name="seoKeywords"
                                label="Keywords"
                                type="tags"
                                value={settings.seoKeywords}
                                onChange={(v) => handleSettingsChange('seoKeywords', v)}
                                placeholder="Press Enter to add"
                            />
                        </div>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader title="Contact Information" subtitle="Company contact details" />
                        <div className="space-y-4 mt-4">
                            <FormField
                                name="companyName"
                                label="Company Name"
                                value={companyInfo.name}
                                onChange={(v) => handleCompanyChange('name', v)}
                                placeholder="Techspert Pvt. Ltd."
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={companyInfo.email}
                                    onChange={(v) => handleCompanyChange('email', v)}
                                    placeholder="info@techspert.com"
                                />
                                <FormField
                                    name="phone"
                                    label="Phone"
                                    type="phone"
                                    value={companyInfo.phone}
                                    onChange={(v) => handleCompanyChange('phone', v)}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <FormField
                                name="address"
                                label="Address"
                                type="textarea"
                                value={companyInfo.address}
                                onChange={(v) => handleCompanyChange('address', v)}
                                rows={2}
                                placeholder="123 Tech Street, Bangalore"
                            />
                        </div>
                    </Card>

                    {/* Social Links */}
                    <Card className="lg:col-span-2">
                        <CardHeader title="Social Media" subtitle="Connect your social profiles" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                    <Facebook size={20} />
                                </div>
                                <input
                                    type="url"
                                    value={companyInfo.socialLinks?.facebook || ''}
                                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                    placeholder="Facebook URL"
                                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                                    <Twitter size={20} />
                                </div>
                                <input
                                    type="url"
                                    value={companyInfo.socialLinks?.twitter || ''}
                                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                    placeholder="Twitter URL"
                                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                                    <Instagram size={20} />
                                </div>
                                <input
                                    type="url"
                                    value={companyInfo.socialLinks?.instagram || ''}
                                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                    placeholder="Instagram URL"
                                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                                    <Linkedin size={20} />
                                </div>
                                <input
                                    type="url"
                                    value={companyInfo.socialLinks?.linkedin || ''}
                                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                    placeholder="LinkedIn URL"
                                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                                    <Youtube size={20} />
                                </div>
                                <input
                                    type="url"
                                    value={companyInfo.socialLinks?.youtube || ''}
                                    onChange={(e) => handleSocialChange('youtube', e.target.value)}
                                    placeholder="YouTube URL"
                                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminGuard>
    )
}

// View-only fallback for users without edit permission
function ViewOnly() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900">View Only</h2>
                <p className="text-neutral-500 mt-2">You do not have permission to edit settings.</p>
            </div>
        </div>
    )
}
