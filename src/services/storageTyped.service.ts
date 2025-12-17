/**
 * storageTyped.service.ts
 * 
 * Type-safe Firebase Storage service for file uploads and downloads.
 * 
 * Features:
 * - Upload with progress tracking
 * - Multiple file upload support
 * - Delete files and folders
 * - Get download URLs
 * - Collection-specific path management
 * 
 * @module services/storageTyped
 */

import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    UploadTaskSnapshot,
} from 'firebase/storage'
import { storage } from '../config/firebase'
import { STORAGE_PATHS, StoragePath } from '../types'
import logger from '../utils/logger'

// ============================================================================
// TYPES
// ============================================================================

export interface UploadProgress {
    bytesTransferred: number
    totalBytes: number
    percentage: number
    state: 'running' | 'paused' | 'success' | 'error' | 'canceled'
}

export interface UploadResult {
    url: string
    fullPath: string
    name: string
}

export type ProgressCallback = (progress: UploadProgress) => void

// ============================================================================
// STORAGE SERVICE
// ============================================================================

class StorageTypedService {
    /**
     * Build a storage path for a collection
     */
    buildPath(storagePath: StoragePath, entityId: string, filename: string): string {
        return `${storagePath}/${entityId}/${filename}`
    }

    /**
     * Generate a unique filename with timestamp
     */
    generateFilename(originalName: string): string {
        const timestamp = Date.now()
        const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
        const ext = sanitized.split('.').pop() || ''
        const base = sanitized.replace(`.${ext}`, '')
        return `${base}_${timestamp}.${ext}`
    }

    /**
     * Upload a single file with progress tracking
     */
    async uploadFile(
        file: File,
        storagePath: StoragePath,
        entityId: string,
        onProgress?: ProgressCallback
    ): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            try {
                const filename = this.generateFilename(file.name)
                const fullPath = this.buildPath(storagePath, entityId, filename)
                const storageRef = ref(storage, fullPath)

                const uploadTask = uploadBytesResumable(storageRef, file)

                uploadTask.on(
                    'state_changed',
                    (snapshot: UploadTaskSnapshot) => {
                        const progress: UploadProgress = {
                            bytesTransferred: snapshot.bytesTransferred,
                            totalBytes: snapshot.totalBytes,
                            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                            state: snapshot.state as UploadProgress['state'],
                        }

                        if (onProgress) {
                            onProgress(progress)
                        }
                    },
                    (error) => {
                        logger.error('Upload error', error)
                        reject(error)
                    },
                    async () => {
                        try {
                            const url = await getDownloadURL(uploadTask.snapshot.ref)
                            resolve({
                                url,
                                fullPath,
                                name: filename,
                            })
                        } catch (error) {
                            reject(error)
                        }
                    }
                )
            } catch (error) {
                logger.error('Upload initialization error', error)
                reject(error)
            }
        })
    }

    /**
     * Upload multiple files with combined progress
     */
    async uploadMultiple(
        files: File[],
        storagePath: StoragePath,
        entityId: string,
        onProgress?: (overallProgress: number) => void
    ): Promise<UploadResult[]> {
        const results: UploadResult[] = []
        const progressMap = new Map<number, number>()

        const updateOverallProgress = () => {
            if (onProgress) {
                const total = Array.from(progressMap.values()).reduce((a, b) => a + b, 0)
                const overall = total / files.length
                onProgress(overall)
            }
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            progressMap.set(i, 0)

            const result = await this.uploadFile(
                file,
                storagePath,
                entityId,
                (progress) => {
                    progressMap.set(i, progress.percentage)
                    updateOverallProgress()
                }
            )

            results.push(result)
        }

        return results
    }

    /**
     * Get download URL for a file
     */
    async getUrl(fullPath: string): Promise<string> {
        try {
            const storageRef = ref(storage, fullPath)
            return await getDownloadURL(storageRef)
        } catch (error) {
            logger.error(`Error getting URL for ${fullPath}`, error)
            throw error
        }
    }

    /**
     * Delete a single file
     */
    async deleteFile(fullPath: string): Promise<void> {
        try {
            const storageRef = ref(storage, fullPath)
            await deleteObject(storageRef)
        } catch (error: unknown) {
            // Ignore 'object-not-found' errors
            if ((error as { code?: string }).code === 'storage/object-not-found') {
                logger.warn(`File not found for deletion: ${fullPath}`)
                return
            }
            logger.error(`Error deleting file ${fullPath}`, error)
            throw error
        }
    }

    /**
     * Delete all files in a folder (entity folder)
     */
    async deleteFolder(storagePath: StoragePath, entityId: string): Promise<void> {
        try {
            const folderPath = `${storagePath}/${entityId}`
            const folderRef = ref(storage, folderPath)
            const listResult = await listAll(folderRef)

            const deletePromises = listResult.items.map((itemRef) =>
                deleteObject(itemRef)
            )

            await Promise.all(deletePromises)
        } catch (error) {
            logger.error(`Error deleting folder ${storagePath}/${entityId}`, error)
            throw error
        }
    }

    /**
     * Extract path from a Firebase Storage URL
     */
    extractPathFromUrl(url: string): string | null {
        try {
            // Firebase Storage URLs contain the path after '/o/' and before '?'
            const match = url.match(/\/o\/(.+?)\?/)
            if (match) {
                return decodeURIComponent(match[1])
            }
            return null
        } catch {
            return null
        }
    }

    /**
     * Delete file by URL (extracts path automatically)
     */
    async deleteByUrl(url: string): Promise<void> {
        const path = this.extractPathFromUrl(url)
        if (path) {
            await this.deleteFile(path)
        }
    }
}

// ============================================================================
// COLLECTION-SPECIFIC UPLOAD HELPERS
// ============================================================================

/**
 * Upload a course thumbnail
 */
export const uploadCourseThumbnail = async (
    file: File,
    courseId: string,
    onProgress?: ProgressCallback
): Promise<UploadResult> => {
    return storageService.uploadFile(file, STORAGE_PATHS.COURSES, courseId, onProgress)
}

/**
 * Upload project images
 */
export const uploadProjectImages = async (
    files: File[],
    projectId: string,
    onProgress?: (progress: number) => void
): Promise<UploadResult[]> => {
    return storageService.uploadMultiple(files, STORAGE_PATHS.PROJECTS, projectId, onProgress)
}

/**
 * Upload alumni photo
 */
export const uploadAlumniPhoto = async (
    file: File,
    alumniId: string,
    onProgress?: ProgressCallback
): Promise<UploadResult> => {
    return storageService.uploadFile(file, STORAGE_PATHS.ALUMNI, alumniId, onProgress)
}

/**
 * Upload trainer photo
 */
export const uploadTrainerPhoto = async (
    file: File,
    trainerId: string,
    onProgress?: ProgressCallback
): Promise<UploadResult> => {
    return storageService.uploadFile(file, STORAGE_PATHS.TRAINERS, trainerId, onProgress)
}

/**
 * Upload team member photo
 */
export const uploadTeamPhoto = async (
    file: File,
    memberId: string,
    onProgress?: ProgressCallback
): Promise<UploadResult> => {
    return storageService.uploadFile(file, STORAGE_PATHS.TEAM, memberId, onProgress)
}

/**
 * Upload banner image
 */
export const uploadBannerImage = async (
    file: File,
    bannerId: string,
    onProgress?: ProgressCallback
): Promise<UploadResult> => {
    return storageService.uploadFile(file, STORAGE_PATHS.BANNERS, bannerId, onProgress)
}

/**
 * Upload site logo or favicon
 */
export const uploadSiteAsset = async (
    file: File,
    assetType: 'logo' | 'favicon',
    onProgress?: ProgressCallback
): Promise<UploadResult> => {
    return storageService.uploadFile(file, STORAGE_PATHS.SETTINGS, assetType, onProgress)
}

/**
 * Upload student avatar
 */
export const uploadStudentAvatar = async (
    file: File,
    studentId: string,
    onProgress?: ProgressCallback
): Promise<UploadResult> => {
    return storageService.uploadFile(file, STORAGE_PATHS.STUDENTS, studentId, onProgress)
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const storageService = new StorageTypedService()

export default storageService
