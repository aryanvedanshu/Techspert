/**
 * audit.service.ts
 * 
 * Service for logging admin actions to the audit_logs collection.
 * Provides automatic tracking of all administrative operations.
 * 
 * Features:
 * - Automatic action logging for CRUD operations
 * - Change tracking (before/after diffs)
 * - IP and user agent capture (when available)
 * - Query audit history
 * 
 * @module services/audit
 */

import { addDoc, collection, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { COLLECTIONS, AuditLog, AuditAction, CollectionName } from '../types'
import logger from '../utils/logger'

// ============================================================================
// TYPES
// ============================================================================

export interface AuditLogEntry {
    adminId: string
    adminEmail?: string
    action: AuditAction
    collection: CollectionName
    documentId: string
    changes?: Record<string, { before: unknown; after: unknown }>
    ipAddress?: string
    userAgent?: string
}

// ============================================================================
// AUDIT SERVICE
// ============================================================================

class AuditService {
    private collectionRef = collection(db, COLLECTIONS.AUDIT_LOGS)

    /**
     * Log an admin action
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            const logData = {
                ...entry,
                createdAt: serverTimestamp(),
            }

            await addDoc(this.collectionRef, logData)

            logger.info('Audit log created', {
                action: entry.action,
                collection: entry.collection,
                documentId: entry.documentId,
            })
        } catch (error) {
            // Don't throw - audit logging should not break main operations
            logger.error('Failed to create audit log', error, entry)
        }
    }

    /**
     * Log a create action
     */
    async logCreate(
        adminId: string,
        adminEmail: string,
        collectionName: CollectionName,
        documentId: string,
        data: Record<string, unknown>
    ): Promise<void> {
        await this.log({
            adminId,
            adminEmail,
            action: 'create',
            collection: collectionName,
            documentId,
            changes: this.buildChanges(undefined, data),
        })
    }

    /**
     * Log an update action with before/after diff
     */
    async logUpdate(
        adminId: string,
        adminEmail: string,
        collectionName: CollectionName,
        documentId: string,
        before: Record<string, unknown>,
        after: Record<string, unknown>
    ): Promise<void> {
        await this.log({
            adminId,
            adminEmail,
            action: 'update',
            collection: collectionName,
            documentId,
            changes: this.buildChanges(before, after),
        })
    }

    /**
     * Log a delete action
     */
    async logDelete(
        adminId: string,
        adminEmail: string,
        collectionName: CollectionName,
        documentId: string,
        deletedData?: Record<string, unknown>
    ): Promise<void> {
        await this.log({
            adminId,
            adminEmail,
            action: 'delete',
            collection: collectionName,
            documentId,
            changes: deletedData ? this.buildChanges(deletedData, undefined) : undefined,
        })
    }

    /**
     * Log a publish action
     */
    async logPublish(
        adminId: string,
        adminEmail: string,
        collectionName: CollectionName,
        documentId: string
    ): Promise<void> {
        await this.log({
            adminId,
            adminEmail,
            action: 'publish',
            collection: collectionName,
            documentId,
        })
    }

    /**
     * Log an unpublish action
     */
    async logUnpublish(
        adminId: string,
        adminEmail: string,
        collectionName: CollectionName,
        documentId: string
    ): Promise<void> {
        await this.log({
            adminId,
            adminEmail,
            action: 'unpublish',
            collection: collectionName,
            documentId,
        })
    }

    /**
     * Log an approve action (for projects, alumni, reviews)
     */
    async logApprove(
        adminId: string,
        adminEmail: string,
        collectionName: CollectionName,
        documentId: string
    ): Promise<void> {
        await this.log({
            adminId,
            adminEmail,
            action: 'approve',
            collection: collectionName,
            documentId,
        })
    }

    /**
     * Log a reject action
     */
    async logReject(
        adminId: string,
        adminEmail: string,
        collectionName: CollectionName,
        documentId: string
    ): Promise<void> {
        await this.log({
            adminId,
            adminEmail,
            action: 'reject',
            collection: collectionName,
            documentId,
        })
    }

    /**
     * Build changes object showing before/after for each field
     */
    private buildChanges(
        before: Record<string, unknown> | undefined,
        after: Record<string, unknown> | undefined
    ): Record<string, { before: unknown; after: unknown }> {
        const changes: Record<string, { before: unknown; after: unknown }> = {}

        // Get all unique keys from both objects
        const allKeys = new Set([
            ...Object.keys(before || {}),
            ...Object.keys(after || {}),
        ])

        for (const key of allKeys) {
            // Skip internal fields
            if (['id', 'createdAt', 'updatedAt'].includes(key)) continue

            const beforeVal = before?.[key]
            const afterVal = after?.[key]

            // Only include if values are different
            if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
                changes[key] = { before: beforeVal, after: afterVal }
            }
        }

        return changes
    }

    /**
     * Get audit logs for a specific document
     */
    async getLogsForDocument(
        collectionName: CollectionName,
        documentId: string,
        limitCount: number = 50
    ): Promise<AuditLog[]> {
        try {
            const q = query(
                this.collectionRef,
                where('collection', '==', collectionName),
                where('documentId', '==', documentId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as AuditLog[]
        } catch (error) {
            logger.error('Failed to get audit logs', error)
            return []
        }
    }

    /**
     * Get recent audit logs for admin activity stream
     */
    async getRecentLogs(limitCount: number = 20): Promise<AuditLog[]> {
        try {
            const q = query(
                this.collectionRef,
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as AuditLog[]
        } catch (error) {
            logger.error('Failed to get recent audit logs', error)
            return []
        }
    }

    /**
     * Get audit logs by admin
     */
    async getLogsByAdmin(
        adminId: string,
        limitCount: number = 50
    ): Promise<AuditLog[]> {
        try {
            const q = query(
                this.collectionRef,
                where('adminId', '==', adminId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as AuditLog[]
        } catch (error) {
            logger.error('Failed to get admin audit logs', error)
            return []
        }
    }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const auditService = new AuditService()

export default auditService
