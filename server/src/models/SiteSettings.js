import mongoose from 'mongoose'

const siteSettingsSchema = new mongoose.Schema({
  // Basic Site Information
  siteName: {
    type: String,
    required: true,
    default: 'Techspert',
    trim: true,
    maxlength: [100, 'Site name cannot exceed 100 characters'],
  },
  siteDescription: {
    type: String,
    required: true,
    default: 'Learn cutting-edge technology skills with expert guidance',
    trim: true,
    maxlength: [500, 'Site description cannot exceed 500 characters'],
  },
  siteTagline: {
    type: String,
    default: 'Empowering the next generation of tech professionals',
    trim: true,
    maxlength: [200, 'Site tagline cannot exceed 200 characters'],
  },

  // Logo and Branding
  logo: {
    light: {
      type: String,
      default: '/images/logo-light.png',
    },
    dark: {
      type: String,
      default: '/images/logo-dark.png',
    },
    favicon: {
      type: String,
      default: '/images/favicon.ico',
    },
  },

  // Color Theme
  theme: {
    primary: {
      type: String,
      default: '#0ea5e9',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)
        },
        message: 'Primary color must be a valid hex color',
      },
    },
    secondary: {
      type: String,
      default: '#14b8a6',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)
        },
        message: 'Secondary color must be a valid hex color',
      },
    },
    accent: {
      type: String,
      default: '#a855f7',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)
        },
        message: 'Accent color must be a valid hex color',
      },
    },
    background: {
      type: String,
      default: '#ffffff',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)
        },
        message: 'Background color must be a valid hex color',
      },
    },
  },

  // Contact Information
  contact: {
    email: {
      type: String,
      required: true,
      default: 'contact@techspert.com',
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: 'Please provide a valid email address',
      },
    },
    supportEmail: {
      type: String,
      default: 'support@techspert.com',
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: 'Please provide a valid support email address',
      },
    },
    phone: {
      type: String,
      default: '+1-555-123-4567',
      trim: true,
    },
    address: {
      type: String,
      default: '123 Tech Street, San Francisco, CA 94105',
      trim: true,
    },
  },

  // Social Media Links
  socialMedia: {
    github: {
      type: String,
      default: 'https://github.com/techspert',
    },
    twitter: {
      type: String,
      default: 'https://twitter.com/techspert',
    },
    linkedin: {
      type: String,
      default: 'https://linkedin.com/company/techspert',
    },
    youtube: {
      type: String,
      default: 'https://youtube.com/techspert',
    },
    instagram: {
      type: String,
      default: 'https://instagram.com/techspert',
    },
    facebook: {
      type: String,
      default: 'https://facebook.com/techspert',
    },
  },

  // Home Page Content
  homePage: {
    hero: {
      title: {
        type: String,
        default: 'Master the Future of Technology',
        trim: true,
        maxlength: [200, 'Hero title cannot exceed 200 characters'],
      },
      subtitle: {
        type: String,
        default: 'Learn cutting-edge skills from industry experts and build your dream career in tech',
        trim: true,
        maxlength: [500, 'Hero subtitle cannot exceed 500 characters'],
      },
      ctaText: {
        type: String,
        default: 'Start Learning Today',
        trim: true,
        maxlength: [100, 'CTA text cannot exceed 100 characters'],
      },
      backgroundImage: {
        type: String,
        default: '/images/hero-bg.jpg',
      },
    },
    features: {
      title: {
        type: String,
        default: 'Why Choose Techspert?',
        trim: true,
        maxlength: [200, 'Features title cannot exceed 200 characters'],
      },
      subtitle: {
        type: String,
        default: 'We provide comprehensive learning experiences designed for real-world success',
        trim: true,
        maxlength: [500, 'Features subtitle cannot exceed 500 characters'],
      },
    },
    stats: {
      title: {
        type: String,
        default: 'Our Impact',
        trim: true,
        maxlength: [200, 'Stats title cannot exceed 200 characters'],
      },
      subtitle: {
        type: String,
        default: 'Join thousands of successful graduates who have transformed their careers',
        trim: true,
        maxlength: [500, 'Stats subtitle cannot exceed 500 characters'],
      },
    },
  },

  // SEO Settings
  seo: {
    metaTitle: {
      type: String,
      default: 'Techspert - Learn Technology Skills Online',
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters'],
    },
    metaDescription: {
      type: String,
      default: 'Master cutting-edge technology skills with expert guidance. Join thousands of successful graduates.',
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
    },
    keywords: {
      type: [String],
      default: ['technology', 'programming', 'courses', 'online learning', 'tech skills'],
    },
    ogImage: {
      type: String,
      default: '/images/og-image.jpg',
    },
  },

  // Analytics
  analytics: {
    googleAnalyticsId: {
      type: String,
      default: '',
    },
    googleTagManagerId: {
      type: String,
      default: '',
    },
    facebookPixelId: {
      type: String,
      default: '',
    },
  },

  // Feature Flags
  features: {
    enableRegistration: {
      type: Boolean,
      default: true,
    },
    enableComments: {
      type: Boolean,
      default: true,
    },
    enableRatings: {
      type: Boolean,
      default: true,
    },
    enableCertificates: {
      type: Boolean,
      default: true,
    },
    enableNewsletter: {
      type: Boolean,
      default: true,
    },
    enableBlog: {
      type: Boolean,
      default: false,
    },
  },

  // Maintenance Mode
  maintenance: {
    enabled: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: 'We are currently performing maintenance. Please check back soon.',
      trim: true,
    },
  },

  // Version tracking
  version: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
})

// Ensure only one settings document exists
siteSettingsSchema.index({}, { unique: true })

// Static method to get current settings
siteSettingsSchema.statics.getCurrent = async function() {
  let settings = await this.findOne()
  
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({})
  }
  
  return settings
}

// Static method to update settings
siteSettingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne()
  
  if (!settings) {
    settings = await this.create(updates)
  } else {
    Object.assign(settings, updates)
    await settings.save()
  }
  
  return settings
}

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema)

export default SiteSettings