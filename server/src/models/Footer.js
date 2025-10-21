import mongoose from 'mongoose'

const footerSchema = new mongoose.Schema({
  brand: {
    name: {
      type: String,
      required: true,
      default: 'Techspert'
    },
    description: {
      type: String,
      required: true,
      default: 'Empowering the next generation of developers with cutting-edge technology courses and hands-on projects.'
    },
    logo: {
      type: String,
      default: '/images/logo.png'
    }
  },
  navigation: {
    courses: [{
      name: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    resources: [{
      name: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    company: [{
      name: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 0
      }
    }]
  },
  socialLinks: [{
    name: {
      type: String,
      required: true
    },
    href: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  legal: {
    copyright: {
      type: String,
      default: 'Techspert. All rights reserved.'
    },
    links: [{
      name: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 0
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes
footerSchema.index({ isActive: 1 })

export default mongoose.model('Footer', footerSchema)
