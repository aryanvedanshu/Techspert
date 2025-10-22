import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, Save, RefreshCw, Eye, Edit, Globe, Mail, Phone,
  Users, Target, BarChart3, HelpCircle, FileText, Link,
  Image, Type, Palette, Database, CheckCircle, AlertCircle
} from 'lucide-react'
import { api } from '../../services/api'
import { toast } from 'sonner'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'

const AdminContentManagement = () => {
  const [activeTab, setActiveTab] = useState('team')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    team: [],
    features: [],
    statistics: [],
    faqs: [],
    contactInfo: {},
    pageContent: {},
    siteSettings: {}
  })

  const tabs = [
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'features', label: 'Features', icon: Target },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'contactInfo', label: 'Contact Info', icon: Phone },
    { id: 'pageContent', label: 'Page Content', icon: FileText },
    { id: 'siteSettings', label: 'Site Settings', icon: Settings }
  ]

  useEffect(() => {
    fetchAllContent()
  }, [])

  const fetchAllContent = async () => {
    try {
      setLoading(true)
      const [teamRes, featuresRes, statisticsRes, faqsRes, contactRes, pageRes, settingsRes] = await Promise.all([
        api.get('/team'),
        api.get('/features'),
        api.get('/statistics'),
        api.get('/faqs'),
        api.get('/contact-info'),
        api.get('/page-content'),
        api.get('/settings')
      ])

      setFormData({
        team: teamRes.data.data || [],
        features: featuresRes.data.data || [],
        statistics: statisticsRes.data.data || [],
        faqs: faqsRes.data.data || [],
        contactInfo: contactRes.data.data || {},
        pageContent: pageRes.data.data || {},
        siteSettings: settingsRes.data.data || {}
      })
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Failed to fetch content data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Save each content type
      await Promise.all([
        api.put('/team', { team: formData.team }),
        api.put('/features', { features: formData.features }),
        api.put('/statistics', { statistics: formData.statistics }),
        api.put('/faqs', { faqs: formData.faqs }),
        api.put('/contact-info', formData.contactInfo),
        api.put('/page-content', formData.pageContent),
        api.put('/settings', formData.siteSettings)
      ])

      toast.success('All content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const addArrayItem = (section, item = {}) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], item]
    }))
  }

  const updateArrayItem = (section, index, item) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((existingItem, i) => i === index ? item : existingItem)
    }))
  }

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const renderTeamManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Team Members</h3>
        <Button onClick={() => addArrayItem('team', { name: '', position: '', bio: '', imageUrl: '', socialLinks: {} })}>
          Add Team Member
        </Button>
      </div>
      
      <div className="space-y-4">
        {formData.team.map((member, index) => (
          <Card key={index} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
                <input
                  type="text"
                  value={member.name || ''}
                  onChange={(e) => updateArrayItem('team', index, { ...member, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Position</label>
                <input
                  type="text"
                  value={member.position || ''}
                  onChange={(e) => updateArrayItem('team', index, { ...member, position: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
                <textarea
                  rows={3}
                  value={member.bio || ''}
                  onChange={(e) => updateArrayItem('team', index, { ...member, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={member.imageUrl || ''}
                  onChange={(e) => updateArrayItem('team', index, { ...member, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => removeArrayItem('team', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderFeaturesManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Website Features</h3>
        <Button onClick={() => addArrayItem('features', { title: '', description: '', icon: '', isActive: true })}>
          Add Feature
        </Button>
      </div>
      
      <div className="space-y-4">
        {formData.features.map((feature, index) => (
          <Card key={index} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
                <input
                  type="text"
                  value={feature.title || ''}
                  onChange={(e) => updateArrayItem('features', index, { ...feature, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Icon</label>
                <input
                  type="text"
                  value={feature.icon || ''}
                  onChange={(e) => updateArrayItem('features', index, { ...feature, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="lucide-icon-name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={feature.description || ''}
                  onChange={(e) => updateArrayItem('features', index, { ...feature, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`feature-active-${index}`}
                  checked={feature.isActive !== false}
                  onChange={(e) => updateArrayItem('features', index, { ...feature, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor={`feature-active-${index}`} className="ml-2 text-sm text-neutral-700">
                  Active
                </label>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => removeArrayItem('features', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderStatisticsManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Website Statistics</h3>
        <Button onClick={() => addArrayItem('statistics', { label: '', value: '', icon: '', isActive: true })}>
          Add Statistic
        </Button>
      </div>
      
      <div className="space-y-4">
        {formData.statistics.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Label</label>
                <input
                  type="text"
                  value={stat.label || ''}
                  onChange={(e) => updateArrayItem('statistics', index, { ...stat, label: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Value</label>
                <input
                  type="text"
                  value={stat.value || ''}
                  onChange={(e) => updateArrayItem('statistics', index, { ...stat, value: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Icon</label>
                <input
                  type="text"
                  value={stat.icon || ''}
                  onChange={(e) => updateArrayItem('statistics', index, { ...stat, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="lucide-icon-name"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`stat-active-${index}`}
                  checked={stat.isActive !== false}
                  onChange={(e) => updateArrayItem('statistics', index, { ...stat, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor={`stat-active-${index}`} className="ml-2 text-sm text-neutral-700">
                  Active
                </label>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => removeArrayItem('statistics', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderFAQsManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Frequently Asked Questions</h3>
        <Button onClick={() => addArrayItem('faqs', { question: '', answer: '', category: '', isActive: true })}>
          Add FAQ
        </Button>
      </div>
      
      <div className="space-y-4">
        {formData.faqs.map((faq, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Question</label>
                <input
                  type="text"
                  value={faq.question || ''}
                  onChange={(e) => updateArrayItem('faqs', index, { ...faq, question: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Answer</label>
                <textarea
                  rows={4}
                  value={faq.answer || ''}
                  onChange={(e) => updateArrayItem('faqs', index, { ...faq, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={faq.category || ''}
                    onChange={(e) => updateArrayItem('faqs', index, { ...faq, category: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="General, Billing, Technical"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`faq-active-${index}`}
                      checked={faq.isActive !== false}
                      onChange={(e) => updateArrayItem('faqs', index, { ...faq, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor={`faq-active-${index}`} className="ml-2 text-sm text-neutral-700">
                      Active
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => removeArrayItem('faqs', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderContactInfoManagement = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Contact Information</h3>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.contactInfo.email || ''}
              onChange={(e) => updateFormData('contactInfo', { ...formData.contactInfo, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.contactInfo.phone || ''}
              onChange={(e) => updateFormData('contactInfo', { ...formData.contactInfo, phone: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Address</label>
            <textarea
              rows={3}
              value={formData.contactInfo.address || ''}
              onChange={(e) => updateFormData('contactInfo', { ...formData.contactInfo, address: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Social Links (JSON)</label>
            <textarea
              rows={3}
              value={JSON.stringify(formData.contactInfo.socialLinks || {}, null, 2)}
              onChange={(e) => {
                try {
                  const socialLinks = JSON.parse(e.target.value)
                  updateFormData('contactInfo', { ...formData.contactInfo, socialLinks })
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const renderPageContentManagement = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Page Content</h3>
      
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Home Page Content (JSON)</label>
            <textarea
              rows={8}
              value={JSON.stringify(formData.pageContent.home || {}, null, 2)}
              onChange={(e) => {
                try {
                  const homeContent = JSON.parse(e.target.value)
                  updateFormData('pageContent', { ...formData.pageContent, home: homeContent })
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">About Page Content (JSON)</label>
            <textarea
              rows={8}
              value={JSON.stringify(formData.pageContent.about || {}, null, 2)}
              onChange={(e) => {
                try {
                  const aboutContent = JSON.parse(e.target.value)
                  updateFormData('pageContent', { ...formData.pageContent, about: aboutContent })
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const renderSiteSettingsManagement = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Site Settings</h3>
      
      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Site Title</label>
              <input
                type="text"
                value={formData.siteSettings.title || ''}
                onChange={(e) => updateFormData('siteSettings', { ...formData.siteSettings, title: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Site Description</label>
              <input
                type="text"
                value={formData.siteSettings.description || ''}
                onChange={(e) => updateFormData('siteSettings', { ...formData.siteSettings, description: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Site Settings (JSON)</label>
            <textarea
              rows={8}
              value={JSON.stringify(formData.siteSettings || {}, null, 2)}
              onChange={(e) => {
                try {
                  const settings = JSON.parse(e.target.value)
                  updateFormData('siteSettings', settings)
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>
      </Card>
    </div>
  )

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'team': return renderTeamManagement()
      case 'features': return renderFeaturesManagement()
      case 'statistics': return renderStatisticsManagement()
      case 'faqs': return renderFAQsManagement()
      case 'contactInfo': return renderContactInfoManagement()
      case 'pageContent': return renderPageContentManagement()
      case 'siteSettings': return renderSiteSettingsManagement()
      default: return renderTeamManagement()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-neutral-200 rounded-2xl"></div>
          </div>
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
                Content Management
              </h1>
              <p className="text-neutral-600">
                Manage all website content and settings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye size={16} className="mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={fetchAllContent}>
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveTab()}
        </motion.div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Content Preview"
        size="xl"
      >
        <div className="p-6">
          <div className="bg-neutral-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-neutral-900 mb-2">Current Content Summary:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Team Members: {formData.team.length}</div>
              <div>Features: {formData.features.length}</div>
              <div>Statistics: {formData.statistics.length}</div>
              <div>FAQs: {formData.faqs.length}</div>
            </div>
          </div>
          <p className="text-neutral-600">
            This preview shows a summary of your current content. All changes will be applied when you save.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default AdminContentManagement
