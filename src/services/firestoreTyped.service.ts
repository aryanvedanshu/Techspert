/**
 * firestoreTyped.service.ts
 * 
 * Type-safe Firestore service with generic CRUD operations.
 * Provides collection-specific wrappers that enforce type safety.
 * 
 * Features:
 * - Generic CRUD operations with TypeScript generics
 * - Automatic timestamp management
 * - Pagination support with cursors
 * - Filter and sort capabilities
 * - Batch operations
 * - Transaction support
 * 
 * @module services/firestoreTyped
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    writeBatch,
    runTransaction,
    DocumentReference,
    QueryConstraint,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import {
    FirestoreDoc,
    PaginationOptions,
    FilterOptions,
    COLLECTIONS,
    CollectionName,
    Course,
    Student,
    Project,
    Alumni,
    Trainer,
    TeamMember,
    SiteSettings,
    Banner,
    Admin,
    Transaction,
    Review,
    Enrollment,
    Category,
    Notification,
    HomepageConfig,
    ThemeConfig,
    CompanyInfo,
    Coupon,
    AuditLog,
} from '../types'
import logger from '../utils/logger'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Firestore Timestamp to Date for client use
 */
const convertTimestamp = (timestamp: Timestamp | undefined): Date | undefined => {
    return timestamp?.toDate()
}

/**
 * Prepare data for Firestore by adding timestamps
 */
const prepareData = <T extends Record<string, unknown>>(
    data: T,
    isNew: boolean = false
): T & { updatedAt: ReturnType<typeof serverTimestamp>; createdAt?: ReturnType<typeof serverTimestamp> } => {
    const prepared = { ...data, updatedAt: serverTimestamp() }
    if (isNew) {
        return { ...prepared, createdAt: serverTimestamp() }
    }
    return prepared
}

/**
 * Convert Firestore document to typed object with ID
 */
const docToObject = <T extends FirestoreDoc>(
    docSnap: { id: string; data: () => unknown; exists: () => boolean }
): T | null => {
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...(docSnap.data() as Omit<T, 'id'>) } as T
}

// ============================================================================
// GENERIC FIRESTORE SERVICE
// ============================================================================

/**
 * Generic Firestore service class for type-safe CRUD operations
 */
class FirestoreTypedService<T extends FirestoreDoc> {
    constructor(private collectionName: CollectionName) { }

    /**
     * Get a single document by ID
     */
    async getById(id: string): Promise<T | null> {
        try {
            const docRef = doc(db, this.collectionName, id)
            const docSnap = await getDoc(docRef)
            return docToObject<T>(docSnap)
        } catch (error) {
            logger.error(`Error getting ${this.collectionName}/${id}`, error)
            throw error
        }
    }

    /**
     * Get all documents with optional filtering, sorting, and pagination
     */
    async getAll(options?: {
        filters?: FilterOptions[]
        pagination?: PaginationOptions
    }): Promise<{ data: T[]; lastDoc: string | null }> {
        try {
            const constraints: QueryConstraint[] = []

            // Apply filters
            if (options?.filters) {
                for (const filter of options.filters) {
                    constraints.push(where(filter.field, filter.operator, filter.value))
                }
            }

            // Apply ordering
            if (options?.pagination?.orderBy) {
                constraints.push(
                    orderBy(
                        options.pagination.orderBy,
                        options.pagination.orderDirection || 'asc'
                    )
                )
            }

            // Apply limit
            if (options?.pagination?.limit) {
                constraints.push(limit(options.pagination.limit))
            }

            // Apply cursor for pagination
            if (options?.pagination?.startAfter) {
                const startDocRef = doc(db, this.collectionName, options.pagination.startAfter)
                const startDocSnap = await getDoc(startDocRef)
                if (startDocSnap.exists()) {
                    constraints.push(startAfter(startDocSnap))
                }
            }

            const q = query(collection(db, this.collectionName), ...constraints)
            const querySnapshot = await getDocs(q)

            const data: T[] = []
            let lastDocId: string | null = null

            querySnapshot.forEach((docSnap) => {
                const item = docToObject<T>(docSnap)
                if (item) {
                    data.push(item)
                    lastDocId = docSnap.id
                }
            })

            return { data, lastDoc: lastDocId }
        } catch (error) {
            logger.error(`Error getting all ${this.collectionName}`, error)
            throw error
        }
    }

    /**
     * Create a new document
     */
    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        try {
            const preparedData = prepareData(data as Record<string, unknown>, true)
            const docRef = await addDoc(collection(db, this.collectionName), preparedData)

            // Fetch the created document to return with ID
            const createdDoc = await this.getById(docRef.id)
            if (!createdDoc) throw new Error('Failed to fetch created document')

            return createdDoc
        } catch (error) {
            logger.error(`Error creating ${this.collectionName}`, error)
            throw error
        }
    }

    /**
     * Update an existing document
     */
    async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
        try {
            const docRef = doc(db, this.collectionName, id)
            const preparedData = prepareData(data as Record<string, unknown>, false)
            await updateDoc(docRef, preparedData)

            // Fetch the updated document
            const updatedDoc = await this.getById(id)
            if (!updatedDoc) throw new Error('Document not found after update')

            return updatedDoc
        } catch (error) {
            logger.error(`Error updating ${this.collectionName}/${id}`, error)
            throw error
        }
    }

    /**
     * Delete a document
     */
    async delete(id: string): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, id)
            await deleteDoc(docRef)
        } catch (error) {
            logger.error(`Error deleting ${this.collectionName}/${id}`, error)
            throw error
        }
    }

    /**
     * Set a document with a specific ID (upsert)
     */
    async set(id: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, merge: boolean = true): Promise<T> {
        try {
            const docRef = doc(db, this.collectionName, id)
            const preparedData = prepareData(data as Record<string, unknown>, true)
            await setDoc(docRef, preparedData, { merge })

            const savedDoc = await this.getById(id)
            if (!savedDoc) throw new Error('Document not found after set')

            return savedDoc
        } catch (error) {
            logger.error(`Error setting ${this.collectionName}/${id}`, error)
            throw error
        }
    }

    /**
     * Batch create multiple documents
     */
    async batchCreate(items: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
        try {
            const batch = writeBatch(db)
            const ids: string[] = []

            for (const item of items) {
                const docRef = doc(collection(db, this.collectionName))
                const preparedData = prepareData(item as Record<string, unknown>, true)
                batch.set(docRef, preparedData)
                ids.push(docRef.id)
            }

            await batch.commit()
            return ids
        } catch (error) {
            logger.error(`Error batch creating ${this.collectionName}`, error)
            throw error
        }
    }

    /**
     * Batch update multiple documents
     */
    async batchUpdate(updates: { id: string; data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>> }[]): Promise<void> {
        try {
            const batch = writeBatch(db)

            for (const { id, data } of updates) {
                const docRef = doc(db, this.collectionName, id)
                const preparedData = prepareData(data as Record<string, unknown>, false)
                batch.update(docRef, preparedData)
            }

            await batch.commit()
        } catch (error) {
            logger.error(`Error batch updating ${this.collectionName}`, error)
            throw error
        }
    }

    /**
     * Batch delete multiple documents
     */
    async batchDelete(ids: string[]): Promise<void> {
        try {
            const batch = writeBatch(db)

            for (const id of ids) {
                const docRef = doc(db, this.collectionName, id)
                batch.delete(docRef)
            }

            await batch.commit()
        } catch (error) {
            logger.error(`Error batch deleting ${this.collectionName}`, error)
            throw error
        }
    }

    /**
     * Count documents matching filters
     */
    async count(filters?: FilterOptions[]): Promise<number> {
        try {
            const constraints: QueryConstraint[] = []

            if (filters) {
                for (const filter of filters) {
                    constraints.push(where(filter.field, filter.operator, filter.value))
                }
            }

            const q = query(collection(db, this.collectionName), ...constraints)
            const snapshot = await getDocs(q)
            return snapshot.size
        } catch (error) {
            logger.error(`Error counting ${this.collectionName}`, error)
            throw error
        }
    }
}

// ============================================================================
// COLLECTION-SPECIFIC SERVICE INSTANCES
// ============================================================================

/** Typed service for courses collection */
export const coursesService = new FirestoreTypedService<Course>(COLLECTIONS.COURSES)

/** Typed service for students collection */
export const studentsService = new FirestoreTypedService<Student>(COLLECTIONS.STUDENTS)

/** Typed service for projects collection */
export const projectsService = new FirestoreTypedService<Project>(COLLECTIONS.PROJECTS)

/** Typed service for alumni collection */
export const alumniService = new FirestoreTypedService<Alumni>(COLLECTIONS.ALUMNI)

/** Typed service for trainers collection */
export const trainersService = new FirestoreTypedService<Trainer>(COLLECTIONS.TRAINERS)

/** Typed service for team collection */
export const teamService = new FirestoreTypedService<TeamMember>(COLLECTIONS.TEAM)

/** Typed service for banners collection */
export const bannersService = new FirestoreTypedService<Banner>(COLLECTIONS.BANNERS)

/** Typed service for admins collection */
export const adminsService = new FirestoreTypedService<Admin>(COLLECTIONS.ADMINS)

/** Typed service for transactions collection */
export const transactionsService = new FirestoreTypedService<Transaction>(COLLECTIONS.TRANSACTIONS)

/** Typed service for reviews collection */
export const reviewsService = new FirestoreTypedService<Review>(COLLECTIONS.REVIEWS)

/** Typed service for enrollments collection */
export const enrollmentsService = new FirestoreTypedService<Enrollment>(COLLECTIONS.ENROLLMENTS)

/** Typed service for categories collection */
export const categoriesService = new FirestoreTypedService<Category>(COLLECTIONS.CATEGORIES)

/** Typed service for notifications collection */
export const notificationsService = new FirestoreTypedService<Notification>(COLLECTIONS.NOTIFICATIONS)

/** Typed service for coupons collection */
export const couponsService = new FirestoreTypedService<Coupon>(COLLECTIONS.COUPONS)

/** Typed service for audit_logs collection */
export const auditLogsService = new FirestoreTypedService<AuditLog>(COLLECTIONS.AUDIT_LOGS)

// ============================================================================
// SINGLE-DOCUMENT SERVICES (for settings, homepage, theme, company_info)
// ============================================================================

/**
 * Service for single-document collections (like settings, theme, homepage)
 */
class SingleDocService<T extends { id: string }> {
    constructor(
        private collectionName: CollectionName,
        private docId: string
    ) { }

    async get(): Promise<T | null> {
        try {
            const docRef = doc(db, this.collectionName, this.docId)
            const docSnap = await getDoc(docRef)
            if (!docSnap.exists()) return null
            return { id: docSnap.id, ...docSnap.data() } as T
        } catch (error) {
            logger.error(`Error getting ${this.collectionName}/${this.docId}`, error)
            throw error
        }
    }

    async update(data: Partial<Omit<T, 'id'>>): Promise<T> {
        try {
            const docRef = doc(db, this.collectionName, this.docId)
            const preparedData = prepareData(data as Record<string, unknown>, false)
            await setDoc(docRef, preparedData, { merge: true })

            const updated = await this.get()
            if (!updated) throw new Error('Document not found after update')
            return updated
        } catch (error) {
            logger.error(`Error updating ${this.collectionName}/${this.docId}`, error)
            throw error
        }
    }
}

/** Service for site settings (single document) */
export const siteSettingsService = new SingleDocService<SiteSettings>(
    COLLECTIONS.SETTINGS,
    'site-settings'
)

/** Service for homepage config (single document) */
export const homepageService = new SingleDocService<HomepageConfig>(
    COLLECTIONS.HOMEPAGE,
    'layout-config'
)

/** Service for theme config (single document) */
export const themeService = new SingleDocService<ThemeConfig>(
    COLLECTIONS.THEME,
    'active-theme'
)

/** Service for company info (single document) */
export const companyInfoService = new SingleDocService<CompanyInfo>(
    COLLECTIONS.COMPANY_INFO,
    'details'
)

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export {
    FirestoreTypedService,
    SingleDocService,
    convertTimestamp,
    prepareData,
    docToObject,
}
