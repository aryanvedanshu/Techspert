import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, Palette, Mail, Globe, Shield, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'

const AdminSettings = () => {
  const { isAuthenticated } = useAuth()
  const [settings, setSettings] = useState({
    siteName: 'Techspert',
    siteDescription: 'Learn cutting-edge technology skills',
    siteTagline: 'Empowering the next generation of tech professionals',
    theme: {
      primary: '#0ea5e9',
      secondary: '#14b8a6',
      accent: '#a855f7',
      background: '#ffffff',
    },
    contact: {
      email: 'contact@techspert.com',
      supportEmail: 'support@techspert.com',
      phone: '+1-555-123-4567',
      address: '123 Tech Street, San Francisco, CA 94105',
    },
    homePage: {
      hero: {
        title: 'Master the Future of Technology',
        subtitle: 'Learn cutting-edge skills from industry experts',
        ctaText: 'Start Learning Today',
      },
    },
    features: {
      enableRegistration: true,
      enableComments: true,
      enableRatings: true,
      enableCertificates: true,
      enableNewsletter: true,
      enableBlog: false,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings')
        setSettings(response.data.data)
      } catch (error) {
        console.error('Error fetching settings:', error)
        // Set default settings if fetch fails
        setSettings({
          siteName: 'Techspert',
          siteDescription: 'Learn cutting-edge technology skills',
          siteTagline: 'Empowering the next generation of tech professionals',
          theme: {
            primary: '#0ea5e9',
            secondary: '#14b8a6',
            accent: '#a855f7',
            background: '#ffffff',
          },
          contact: {
            email: 'contact@techspert.com',
            supportEmail: 'support@techspert.com',
            phone: '+1-555-123-4567',
            address: '123 Tech Street, San Francisco, CA 94105',
          },
          homePage: {
            hero: {
              title: 'Master the Future of Technology',
              subtitle: 'Learn cutting-edge skills from industry experts',
              ctaText: 'Start Learning Today',
            },
          },
          features: {
            enableRegistration: true,
            enableComments: true,
            enableRatings: true,
            enableCertificates: true,
            enableNewsletter: true,
            enableBlog: false,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchSettings()
    }
  }, [isAuthenticated])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (section, field, value) => {
    // Handle top-level fields (when section is empty or null)
    if (!section || section === '') {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }))
      return
    }
    
    // Handle nested fields with dot notation (e.g., 'homePage.hero')
    if (section.includes('.')) {
      const parts = section.split('.')
      setSettings(prev => {
        const newSettings = { ...prev }
        let current = newSettings
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = { ...current[parts[i]] }
          current = current[parts[i]]
        }
        current[parts[parts.length - 1]] = {
          ...current[parts[parts.length - 1]],
          [field]: value
        }
        return newSettings
      })
      return
    }
    
    // Handle regular nested fields
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'homepage', label: 'Homepage', icon: Globe },
    { id: 'features', label: 'Features', icon: Shield },
  ]

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">
                Site Settings
              </h1>
              <p className="text-neutral-600">
                Manage your website configuration and content
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-heading font-semibold text-neutral-900">
                      General Settings
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={settings?.siteName || ''}
                          onChange={(e) => handleInputChange('', 'siteName', e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Site Tagline
                        </label>
                        <input
                          type="text"
                          value={settings?.siteTagline || ''}
                          onChange={(e) => handleInputChange('', 'siteTagline', e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={settings?.siteDescription || ''}
                        onChange={(e) => handleInputChange('', 'siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'theme' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-heading font-semibold text-neutral-900">
                      Theme & Branding
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings?.theme?.primary || '#0ea5e9'}
                            onChange={(e) => handleInputChange('theme', 'primary', e.target.value)}
                            className="w-12 h-12 border border-neutral-200 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings?.theme?.primary || '#0ea5e9'}
                            onChange={(e) => handleInputChange('theme', 'primary', e.target.value)}
                            className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings?.theme?.secondary || '#14b8a6'}
                            onChange={(e) => handleInputChange('theme', 'secondary', e.target.value)}
                            className="w-12 h-12 border border-neutral-200 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings?.theme?.secondary || '#14b8a6'}
                            onChange={(e) => handleInputChange('theme', 'secondary', e.target.value)}
                            className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-heading font-semibold text-neutral-900">
                      Contact Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={settings?.contact?.email || ''}
                          onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={settings?.contact?.supportEmail || ''}
                          onChange={(e) => handleInputChange('contact', 'supportEmail', e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={settings?.contact?.phone || ''}
                          onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={settings?.contact?.address || ''}
                          onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'homepage' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-heading font-semibold text-neutral-900">
                      Homepage Content
                    </h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Hero Title
                      </label>
                      <input
                        type="text"
                        value={settings?.homePage?.hero?.title || ''}
                        onChange={(e) => handleInputChange('homePage.hero', 'title', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Hero Subtitle
                      </label>
                      <textarea
                        value={settings?.homePage?.hero?.subtitle || ''}
                        onChange={(e) => handleInputChange('homePage.hero', 'subtitle', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={settings?.homePage?.hero?.ctaText || ''}
                        onChange={(e) => handleInputChange('homePage.hero', 'ctaText', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-300 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-heading font-semibold text-neutral-900">
                      Feature Flags
                    </h2>
                    
                    <div className="space-y-4">
                      {Object.entries(settings?.features || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                          <div>
                            <h3 className="font-medium text-neutral-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <p className="text-sm text-neutral-600">
                              Enable or disable this feature
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleInputChange('features', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
