import mongoose from 'mongoose'

const pageContentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: [true, 'Page identifier is required'],
    unique: true,
    enum: ['home', 'about', 'contact', 'courses', 'projects', 'alumni', 'certificates'],
  },
  title: {
    type: String,
    required: [true, 'Page title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [500, 'Subtitle cannot exceed 500 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  hero: {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Hero title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [500, 'Hero subtitle cannot exceed 500 characters'],
    },
    ctaText: {
      type: String,
      trim: true,
      maxlength: [100, 'CTA text cannot exceed 100 characters'],
    },
    backgroundImage: {
      type: String,
    },
  },
  sections: {
    features: {
      title: {
        type: String,
        trim: true,
        maxlength: [200, 'Features title cannot exceed 200 characters'],
      },
      subtitle: {
        type: String,
        trim: true,
        maxlength: [500, 'Features subtitle cannot exceed 500 characters'],
      },
    },
    stats: {
      title: {
        type: String,
        trim: true,
        maxlength: [200, 'Stats title cannot exceed 200 characters'],
      },
      subtitle: {
        type: String,
        trim: true,
        maxlength: [500, 'Stats subtitle cannot exceed 500 characters'],
      },
    },
    mission: {
      title: {
        type: String,
        trim: true,
        maxlength: [200, 'Mission title cannot exceed 200 characters'],
      },
      content: {
        type: String,
        trim: true,
        maxlength: [2000, 'Mission content cannot exceed 2000 characters'],
      },
    },
    values: {
      title: {
        type: String,
        trim: true,
        maxlength: [200, 'Values title cannot exceed 200 characters'],
      },
      subtitle: {
        type: String,
        trim: true,
        maxlength: [500, 'Values subtitle cannot exceed 500 characters'],
      },
    },
    team: {
      title: {
        type: String,
        trim: true,
        maxlength: [200, 'Team title cannot exceed 200 characters'],
      },
      subtitle: {
        type: String,
        trim: true,
        maxlength: [500, 'Team subtitle cannot exceed 500 characters'],
      },
    },
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
    },
    keywords: [{
      type: String,
      trim: true,
    }],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
}, {
  timestamps: true,
})

// Indexes for better performance (page already has unique index from schema definition)
pageContentSchema.index({ isActive: 1 })

// Static method to get page content
pageContentSchema.statics.getPageContent = function(page) {
  return this.findOne({ page, isActive: true })
}

// Static method to update page content
pageContentSchema.statics.updatePageContent = function(page, updates, adminId) {
  return this.findOneAndUpdate(
    { page },
    { 
      ...updates, 
      lastUpdated: new Date(),
      updatedBy: adminId 
    },
    { 
      new: true, 
      upsert: true,
      runValidators: true 
    }
  )
}

const PageContent = mongoose.model('PageContent', pageContentSchema)

export default PageContent
