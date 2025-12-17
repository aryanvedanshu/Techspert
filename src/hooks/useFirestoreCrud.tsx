/**
 * useFirestoreCrud.tsx
 * 
 * Generic CRUD hook factory for Firestore collections.
 * Creates type-safe hooks for any collection with full CRUD operations.
 * 
 * Features:
 * - List with pagination, filtering, sorting
 * - Create with validation
 * - Update with audit logging
 * - Delete with confirmation
 * - Loading and error states
 * - Optimistic updates
 * 
 * @module hooks/useFirestoreCrud
 */

import { useState, useCallback, useEffect } from 'react'
import {
    FirestoreTypedService,
    coursesService,
    projectsService,
    alumniService,
    trainersService,
    teamService,
    bannersService,
    categoriesService,
    couponsService,
    enrollmentsService,
    reviewsService,
    transactionsService,
    notificationsService,
    studentsService,
    adminsService,
} from '../services/firestoreTyped.service'
import { auditService } from '../services/audit.service'
import { useAdminAuthContext } from '../contexts/AdminAuthContext'
import { FirestoreDoc, FilterOptions, PaginationOptions, CollectionName } from '../types'

// ============================================================================
// TYPES
// ============================================================================

export interface CrudState<T> {
    data: T[]
    loading: boolean
    error: string | null
    totalCount: number
    lastDoc: string | null
}

export interface CrudHookReturn<T extends FirestoreDoc> {
    // State
    items: T[]
    loading: boolean
    error: string | null
    totalCount: number

    // Single item
    currentItem: T | null
    itemLoading: boolean

    // Actions
    fetchAll: (options?: { filters?: FilterOptions[]; pagination?: PaginationOptions }) => Promise<void>
    fetchOne: (id: string) => Promise<T | null>
    create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>
    update: (id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<T>
    remove: (id: string) => Promise<void>

    // Pagination
    hasMore: boolean
    loadMore: () => Promise<void>

    // Utilities
    refresh: () => Promise<void>
    clearError: () => void
    setCurrentItem: (item: T | null) => void
}

// ============================================================================
// GENERIC CRUD HOOK FACTORY
// ============================================================================

export function createCrudHook<T extends FirestoreDoc>(
    service: FirestoreTypedService<T>,
    collectionName: CollectionName
) {
    return function useCrud(defaultOptions?: {
        autoFetch?: boolean
        defaultFilters?: FilterOptions[]
        defaultPagination?: PaginationOptions
    }): CrudHookReturn<T> {
        const { user } = useAdminAuthContext()

        // State
        const [state, setState] = useState<CrudState<T>>({
            data: [],
            loading: false,
            error: null,
            totalCount: 0,
            lastDoc: null,
        })

        const [currentItem, setCurrentItem] = useState<T | null>(null)
        const [itemLoading, setItemLoading] = useState(false)
        const [lastOptions, setLastOptions] = useState<{
            filters?: FilterOptions[]
            pagination?: PaginationOptions
        }>({})

        // Fetch all items
        const fetchAll = useCallback(async (options?: {
            filters?: FilterOptions[]
            pagination?: PaginationOptions
        }) => {
            setState((prev) => ({ ...prev, loading: true, error: null }))
            setLastOptions(options || {})

            try {
                const result = await service.getAll(options)
                const count = await service.count(options?.filters)

                setState({
                    data: result.data,
                    loading: false,
                    error: null,
                    totalCount: count,
                    lastDoc: result.lastDoc,
                })
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch data',
                }))
            }
        }, [])

        // Fetch single item
        const fetchOne = useCallback(async (id: string): Promise<T | null> => {
            setItemLoading(true)
            try {
                const item = await service.getById(id)
                setCurrentItem(item)
                setItemLoading(false)
                return item
            } catch (error) {
                setItemLoading(false)
                throw error
            }
        }, [])

        // Create item
        const create = useCallback(async (
            data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
        ): Promise<T> => {
            setState((prev) => ({ ...prev, loading: true, error: null }))

            try {
                const created = await service.create(data)

                // Log audit
                if (user) {
                    await auditService.logCreate(
                        user.uid,
                        user.email || '',
                        collectionName,
                        created.id,
                        data as Record<string, unknown>
                    )
                }

                // Update state optimistically
                setState((prev) => ({
                    ...prev,
                    data: [created, ...prev.data],
                    totalCount: prev.totalCount + 1,
                    loading: false,
                }))

                return created
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to create',
                }))
                throw error
            }
        }, [user])

        // Update item
        const update = useCallback(async (
            id: string,
            data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
        ): Promise<T> => {
            setState((prev) => ({ ...prev, loading: true, error: null }))

            try {
                // Get current data for audit
                const before = await service.getById(id)

                const updated = await service.update(id, data)

                // Log audit
                if (user && before) {
                    await auditService.logUpdate(
                        user.uid,
                        user.email || '',
                        collectionName,
                        id,
                        before as Record<string, unknown>,
                        updated as Record<string, unknown>
                    )
                }

                // Update state
                setState((prev) => ({
                    ...prev,
                    data: prev.data.map((item) => (item.id === id ? updated : item)),
                    loading: false,
                }))

                if (currentItem?.id === id) {
                    setCurrentItem(updated)
                }

                return updated
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update',
                }))
                throw error
            }
        }, [user, currentItem])

        // Delete item
        const remove = useCallback(async (id: string): Promise<void> => {
            setState((prev) => ({ ...prev, loading: true, error: null }))

            try {
                // Get data for audit before delete
                const deleted = await service.getById(id)

                await service.delete(id)

                // Log audit
                if (user) {
                    await auditService.logDelete(
                        user.uid,
                        user.email || '',
                        collectionName,
                        id,
                        deleted as Record<string, unknown>
                    )
                }

                // Update state
                setState((prev) => ({
                    ...prev,
                    data: prev.data.filter((item) => item.id !== id),
                    totalCount: prev.totalCount - 1,
                    loading: false,
                }))

                if (currentItem?.id === id) {
                    setCurrentItem(null)
                }
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete',
                }))
                throw error
            }
        }, [user, currentItem])

        // Load more for pagination
        const loadMore = useCallback(async () => {
            if (!state.lastDoc || state.loading) return

            setState((prev) => ({ ...prev, loading: true }))

            try {
                const result = await service.getAll({
                    ...lastOptions,
                    pagination: {
                        ...lastOptions.pagination,
                        startAfter: state.lastDoc || undefined,
                    },
                })

                setState((prev) => ({
                    ...prev,
                    data: [...prev.data, ...result.data],
                    lastDoc: result.lastDoc,
                    loading: false,
                }))
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to load more',
                }))
            }
        }, [state.lastDoc, state.loading, lastOptions])

        // Refresh
        const refresh = useCallback(async () => {
            await fetchAll(lastOptions)
        }, [fetchAll, lastOptions])

        // Clear error
        const clearError = useCallback(() => {
            setState((prev) => ({ ...prev, error: null }))
        }, [])

        // Auto-fetch on mount
        useEffect(() => {
            if (defaultOptions?.autoFetch !== false) {
                fetchAll({
                    filters: defaultOptions?.defaultFilters,
                    pagination: defaultOptions?.defaultPagination,
                })
            }
        }, [])

        return {
            items: state.data,
            loading: state.loading,
            error: state.error,
            totalCount: state.totalCount,
            currentItem,
            itemLoading,
            fetchAll,
            fetchOne,
            create,
            update,
            remove,
            hasMore: state.lastDoc !== null && state.data.length < state.totalCount,
            loadMore,
            refresh,
            clearError,
            setCurrentItem,
        }
    }
}

// ============================================================================
// PRE-BUILT HOOKS FOR EACH COLLECTION
// ============================================================================

import {
    Course,
    Project,
    Alumni,
    Trainer,
    TeamMember,
    Banner,
    Category,
    Coupon,
    Enrollment,
    Review,
    Transaction,
    Notification,
    Student,
    Admin,
    COLLECTIONS,
} from '../types'

// Courses
export const useCourses = createCrudHook<Course>(
    coursesService as unknown as FirestoreTypedService<Course>,
    COLLECTIONS.COURSES
)

// Projects
export const useProjects = createCrudHook<Project>(
    projectsService as unknown as FirestoreTypedService<Project>,
    COLLECTIONS.PROJECTS
)

// Alumni
export const useAlumni = createCrudHook<Alumni>(
    alumniService as unknown as FirestoreTypedService<Alumni>,
    COLLECTIONS.ALUMNI
)

// Trainers
export const useTrainers = createCrudHook<Trainer>(
    trainersService as unknown as FirestoreTypedService<Trainer>,
    COLLECTIONS.TRAINERS
)

// Team
export const useTeam = createCrudHook<TeamMember>(
    teamService as unknown as FirestoreTypedService<TeamMember>,
    COLLECTIONS.TEAM
)

// Banners
export const useBanners = createCrudHook<Banner>(
    bannersService as unknown as FirestoreTypedService<Banner>,
    COLLECTIONS.BANNERS
)

// Categories
export const useCategories = createCrudHook<Category>(
    categoriesService as unknown as FirestoreTypedService<Category>,
    COLLECTIONS.CATEGORIES
)

// Coupons
export const useCoupons = createCrudHook<Coupon>(
    couponsService as unknown as FirestoreTypedService<Coupon>,
    COLLECTIONS.COUPONS
)

// Enrollments
export const useEnrollments = createCrudHook<Enrollment>(
    enrollmentsService as unknown as FirestoreTypedService<Enrollment>,
    COLLECTIONS.ENROLLMENTS
)

// Reviews
export const useReviews = createCrudHook<Review>(
    reviewsService as unknown as FirestoreTypedService<Review>,
    COLLECTIONS.REVIEWS
)

// Transactions
export const useTransactions = createCrudHook<Transaction>(
    transactionsService as unknown as FirestoreTypedService<Transaction>,
    COLLECTIONS.TRANSACTIONS
)

// Notifications
export const useNotifications = createCrudHook<Notification>(
    notificationsService as unknown as FirestoreTypedService<Notification>,
    COLLECTIONS.NOTIFICATIONS
)

// Students
export const useStudents = createCrudHook<Student>(
    studentsService as unknown as FirestoreTypedService<Student>,
    COLLECTIONS.STUDENTS
)

// Admins
export const useAdmins = createCrudHook<Admin>(
    adminsService as unknown as FirestoreTypedService<Admin>,
    COLLECTIONS.ADMINS
)
