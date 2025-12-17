/**
 * types/index.ts
 * 
 * Complete TypeScript type definitions for all Firestore collections.
 * Generated from project_blueprint.json schema.
 * 
 * @module types
 */

import { Timestamp } from 'firebase/firestore'

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Firestore document with ID */
export interface FirestoreDoc {
    id: string
    createdAt?: Timestamp
    updatedAt?: Timestamp
}

/** Pagination options */
export interface PaginationOptions {
    limit?: number
    startAfter?: string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
}

/** Filter options for queries */
export interface FilterOptions {
    field: string
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in'
    value: unknown
}

// ============================================================================
// COURSE TYPES
// ============================================================================

export interface SyllabusItem {
    title: string
    content: string
    duration: string
}

export interface Course extends FirestoreDoc {
    title: string
    slug: string
    description: string // HTML/Rich Text
    shortDescription: string
    category: string
    level: 'Beginner' | 'Intermediate' | 'Advanced'
    price: number
    discountPrice?: number
    duration: string
    instructor: string // ref: trainers/{id}
    thumbnail: string // URL
    isPublished: boolean
    isFeatured: boolean
    position: number
    syllabus: SyllabusItem[]
    skills: string[]
}

export type CourseFormData = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// STUDENT TYPES
// ============================================================================

export interface Student extends FirestoreDoc {
    email: string
    displayName: string
    photoURL?: string
    phoneNumber?: string
    role: 'student'
    enrolledCourses: string[] // courseIds
    completedCourses: string[] // courseIds
    certificates: string[] // certificateIds
    isActive: boolean
    lastLogin?: Timestamp
}

export type StudentFormData = Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type ProjectStatus = 'pending' | 'approved' | 'rejected'

export interface Project extends FirestoreDoc {
    title: string
    description: string
    studentName: string
    studentId: string // ref: students/{id}
    category: string
    tags: string[]
    techStack: string[]
    githubUrl?: string
    liveUrl?: string
    images: string[] // URLs
    status: ProjectStatus
    isFeatured: boolean
    completionDate?: Timestamp
}

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// ALUMNI TYPES
// ============================================================================

export type AlumniStatus = 'active' | 'inactive'

export interface Alumni extends FirestoreDoc {
    name: string
    email: string
    course: string
    company: string
    designation: string
    city: string
    imageUrl?: string
    linkedinUrl?: string
    testimonial: string
    graduationDate?: Timestamp
    skills: string[]
    rating: number
    isApproved: boolean
    isFeatured: boolean
    status: AlumniStatus
}

export type AlumniFormData = Omit<Alumni, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// TRAINER TYPES
// ============================================================================

export interface TrainerSocialLinks {
    linkedin?: string
    twitter?: string
    website?: string
}

export interface Trainer extends FirestoreDoc {
    name: string
    email: string
    expertise: string
    bio: string
    imageUrl?: string
    socialLinks: TrainerSocialLinks
    isActive: boolean
}

export type TrainerFormData = Omit<Trainer, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// TEAM TYPES
// ============================================================================

export interface TeamSocialLinks {
    linkedin?: string
    twitter?: string
}

export interface TeamMember extends FirestoreDoc {
    name: string
    role: string
    bio: string
    imageUrl?: string
    order: number
    featured: boolean
    isActive: boolean
    socialLinks: TeamSocialLinks
}

export type TeamMemberFormData = Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface SettingsSocialLinks {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
}

export interface SiteSettings {
    id: 'site-settings'
    siteName: string
    logoUrl?: string
    faviconUrl?: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    contactEmail: string
    contactPhone: string
    address: string
    socialLinks: SettingsSocialLinks
    metaDescription: string
    metaKeywords: string
    maintenanceMode: boolean
    updatedAt?: Timestamp
}

export type SiteSettingsFormData = Omit<SiteSettings, 'id' | 'updatedAt'>

// ============================================================================
// BANNER TYPES
// ============================================================================

export interface Banner extends FirestoreDoc {
    title: string
    subtitle: string
    imageUrl: string
    linkUrl?: string
    buttonText?: string
    position: number
    isActive: boolean
    startDate?: Timestamp
    endDate?: Timestamp
}

export type BannerFormData = Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// ADMIN TYPES
// ============================================================================

export type AdminRole = 'super-admin' | 'admin' | 'editor' | 'viewer'

export interface Admin extends FirestoreDoc {
    email: string
    displayName: string
    role: AdminRole
    permissions: string[]
    isActive: boolean
    lastLogin?: Timestamp
}

export type AdminFormData = Omit<Admin, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'>

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded'

export interface Transaction extends FirestoreDoc {
    transactionId: string
    studentId: string // ref: students/{id}
    courseId: string // ref: courses/{id}
    amount: number
    currency: string
    status: TransactionStatus
    paymentMethod: string
    processedAt?: Timestamp
    metadata?: Record<string, unknown>
}

export type TransactionFormData = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review extends FirestoreDoc {
    courseId: string // ref: courses/{id}
    studentId: string // ref: students/{id}
    studentName: string
    rating: 1 | 2 | 3 | 4 | 5
    comment: string
    isApproved: boolean
}

export type ReviewFormData = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// ENROLLMENT TYPES
// ============================================================================

export type EnrollmentStatus = 'active' | 'completed' | 'dropped'

export interface Enrollment extends FirestoreDoc {
    studentId: string // ref: students/{id}
    courseId: string // ref: courses/{id}
    status: EnrollmentStatus
    progress: number // 0-100
    enrolledAt?: Timestamp
    completedAt?: Timestamp
}

export type EnrollmentFormData = Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category extends FirestoreDoc {
    name: string
    slug: string
    description: string
    icon: string // URL or icon name
    isActive: boolean
    order: number
}

export type CategoryFormData = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification extends FirestoreDoc {
    userId: string // ref: students/{id} or admins/{id}
    title: string
    message: string
    type: NotificationType
    isRead: boolean
    link?: string
}

export type NotificationFormData = Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// HOMEPAGE TYPES
// ============================================================================

export interface HeroSection {
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    backgroundUrl?: string
}

export interface StatItem {
    label: string
    value: string
    icon: string
}

export interface HomepageConfig {
    id: 'layout-config'
    heroSection: HeroSection
    featuredCoursesTitle: string
    statsSection: StatItem[]
    testimonialsTitle: string
    showPartners: boolean
    updatedAt?: Timestamp
}

export type HomepageConfigFormData = Omit<HomepageConfig, 'id' | 'updatedAt'>

// ============================================================================
// THEME TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeColors {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
}

export interface ThemeConfig {
    id: 'active-theme'
    mode: ThemeMode
    fontFamily: string
    borderRadius: string
    colors: ThemeColors
    updatedAt?: Timestamp
}

export type ThemeConfigFormData = Omit<ThemeConfig, 'id' | 'updatedAt'>

// ============================================================================
// COMPANY INFO TYPES
// ============================================================================

export interface CompanyInfo {
    id: 'details'
    name: string
    registrationNumber?: string
    taxId?: string
    foundedYear?: number
    mission: string
    vision: string
    termsUrl?: string
    privacyUrl?: string
    updatedAt?: Timestamp
}

export type CompanyInfoFormData = Omit<CompanyInfo, 'id' | 'updatedAt'>

// ============================================================================
// COUPON TYPES (NEW - Auto-fix from Phase 1)
// ============================================================================

export type DiscountType = 'percentage' | 'fixed'

export interface Coupon extends FirestoreDoc {
    code: string
    discountType: DiscountType
    discountValue: number
    minPurchase?: number
    maxUses?: number
    usedCount: number
    validFrom?: Timestamp
    validUntil?: Timestamp
    applicableCourses: string[] // courseIds, empty = all courses
    isActive: boolean
}

export type CouponFormData = Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>

// ============================================================================
// AUDIT LOG TYPES (NEW - Auto-fix from Phase 1)
// ============================================================================

export type AuditAction = 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'approve' | 'reject'

export interface AuditLog extends FirestoreDoc {
    adminId: string // ref: admins/{id}
    adminEmail?: string
    action: AuditAction
    collection: string
    documentId: string
    changes?: Record<string, { before: unknown; after: unknown }>
    ipAddress?: string
    userAgent?: string
}

// ============================================================================
// DEMO CLASS TYPES (NEW)
// ============================================================================

export interface DemoClassLink {
    id: 'current'
    currentDemoLink: string
    lastUpdated?: Timestamp
    updatedBy: string
}

export type DemoClassLinkFormData = Omit<DemoClassLink, 'id' | 'lastUpdated'>

export type DemoRegistrationSource = 'homepage' | 'external' | 'direct'

export interface DemoClassRegistration extends FirestoreDoc {
    name: string
    email: string
    phone: string
    courseInterest: string[]
    submittedAt?: Timestamp
    source: DemoRegistrationSource
    status: 'pending' | 'contacted' | 'converted' | 'rejected'
}

export type DemoClassRegistrationFormData = Omit<DemoClassRegistration, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// LEAD FORMS TYPES (NEW)
// ============================================================================

export interface LeadForms {
    id: 'links'
    demoFormLink: string
    schoolFormLink: string
    paymentFormLink: string
    lastUpdated?: Timestamp
}

export type LeadFormsFormData = Omit<LeadForms, 'id' | 'lastUpdated'>

export type LeadFormType = 'demo' | 'school' | 'payment'

export interface LeadSyncResult extends FirestoreDoc {
    name: string
    email: string
    phone: string
    courseInterest: string[]
    formType: LeadFormType
    paymentAmount?: number
    paymentId?: string
    generatedPassword?: string
    syncedAt?: Timestamp
    raw?: Record<string, unknown>
}

export type LeadSyncResultFormData = Omit<LeadSyncResult, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// ENQUIRY TYPES (NEW)
// ============================================================================

export type EnquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed'

export interface Enquiry extends FirestoreDoc {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
    status: EnquiryStatus
    assignedTo?: string
    resolvedAt?: Timestamp
    notes?: string
}

export type EnquiryFormData = Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// DEMO SIGNUP TYPES (Updated)
// ============================================================================

export interface DemoSignup extends FirestoreDoc {
    name: string
    email: string
    phone: string
    courseInterest?: string
    source: string
    status: 'pending' | 'contacted' | 'converted' | 'rejected'
    notes?: string
}

export type DemoSignupFormData = Omit<DemoSignup, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// PER-COURSE DEMO LINKS (NEW)
// ============================================================================

export interface DemoLink extends FirestoreDoc {
    courseId: string
    demoMeetLink: string
    leadClickLink: string
    formSubmitLink: string
    paymentSubmitLink: string
    lastUpdated?: Timestamp
    updatedBy: string
}

export type DemoLinkFormData = Omit<DemoLink, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// LEAD TRACKING (NEW)
// ============================================================================

export type LeadStage = 'clicked' | 'submitted' | 'paid'

export interface LeadTracking extends FirestoreDoc {
    courseId: string
    stage: LeadStage
    name?: string
    email?: string
    phone?: string
    experienceLevel?: string
    paymentAmount?: number
    paymentMode?: string
    paymentConfirmed?: boolean
    timestamp: Timestamp
    source: string
    raw?: Record<string, unknown>
}

export type LeadTrackingFormData = Omit<LeadTracking, 'id' | 'createdAt' | 'updatedAt'>

// ============================================================================
// COLLECTION NAMES (Type-safe)
// ============================================================================

export const COLLECTIONS = {
    COURSES: 'courses',
    STUDENTS: 'students',
    PROJECTS: 'projects',
    ALUMNI: 'alumni',
    TRAINERS: 'trainers',
    TEAM: 'team',
    SETTINGS: 'settings',
    BANNERS: 'banners',
    ADMINS: 'admins',
    TRANSACTIONS: 'transactions',
    REVIEWS: 'reviews',
    ENROLLMENTS: 'enrollments',
    CATEGORIES: 'categories',
    NOTIFICATIONS: 'notifications',
    HOMEPAGE: 'homepage',
    THEME: 'theme',
    COMPANY_INFO: 'company_info',
    COUPONS: 'coupons',
    AUDIT_LOGS: 'audit_logs',
    // Demo & Lead collections
    DEMO_CLASS_LINKS: 'demo_class_links',
    DEMO_CLASS_REGISTRATIONS: 'demo_class_registrations',
    DEMO_LINKS: 'demo_links',
    LEAD_TRACKING: 'lead_tracking',
    LEAD_FORMS: 'lead_forms',
    LEAD_SYNC_RESULTS: 'lead_sync_results',
    ENQUIRIES: 'enquiries',
    DEMO_SIGNUPS: 'demoSignups',
    MESSAGES: 'messages',
    CONTACTS: 'contacts',
} as const

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]

// ============================================================================
// STORAGE PATHS (Type-safe)
// ============================================================================

export const STORAGE_PATHS = {
    COURSES: 'storage/courses',
    PROJECTS: 'storage/projects',
    ALUMNI: 'storage/alumni',
    TRAINERS: 'storage/trainers',
    TEAM: 'storage/team',
    SETTINGS: 'storage/settings',
    BANNERS: 'storage/banners',
    STUDENTS: 'storage/students',
} as const

export type StoragePath = typeof STORAGE_PATHS[keyof typeof STORAGE_PATHS]

