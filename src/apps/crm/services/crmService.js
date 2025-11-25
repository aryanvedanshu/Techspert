import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc,
    deleteDoc, query, where, orderBy, limit, serverTimestamp,
    writeBatch
} from 'firebase/firestore'
import { db } from '../../../config/firebase'

const COLLECTIONS = {
    CONTACTS: 'crmContacts',
    PIPELINES: 'crmPipelines',
    ACTIVITY: 'crmActivity',
    WORKFLOWS: 'crmWorkflows',
    FUNNELS: 'crmFunnels',
    PAGES: 'crmPages',
    CONVERSATIONS: 'crmConversations',
    MESSAGES: 'crmMessages'
}

export const crmService = {
    // --- Contacts ---
    contacts: {
        async getAll(filters = {}) {
            let q = collection(db, COLLECTIONS.CONTACTS)
            // Apply filters logic here
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        },

        async create(data) {
            return addDoc(collection(db, COLLECTIONS.CONTACTS), {
                ...data,
                createdAt: serverTimestamp(),
                lastActivity: serverTimestamp()
            })
        },

        async update(id, data) {
            return updateDoc(doc(db, COLLECTIONS.CONTACTS, id), {
                ...data,
                updatedAt: serverTimestamp()
            })
        },

        async addActivity(contactId, type, content, metadata = {}) {
            return addDoc(collection(db, COLLECTIONS.ACTIVITY), {
                contactId,
                type,
                content,
                metadata,
                createdAt: serverTimestamp()
            })
        }
    },

    // --- Pipelines ---
    pipelines: {
        async getAll() {
            const q = query(collection(db, COLLECTIONS.PIPELINES), orderBy('order', 'asc'))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        },

        async updateStage(contactId, pipelineId, stageId) {
            return updateDoc(doc(db, COLLECTIONS.CONTACTS, contactId), {
                pipelineId,
                pipelineStageId: stageId,
                lastActivity: serverTimestamp()
            })
        }
    },

    // --- Automations ---
    automations: {
        async getWorkflows() {
            const snapshot = await getDocs(collection(db, COLLECTIONS.WORKFLOWS))
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        },

        async saveWorkflow(id, data) {
            if (id) {
                return updateDoc(doc(db, COLLECTIONS.WORKFLOWS, id), {
                    ...data,
                    updatedAt: serverTimestamp()
                })
            } else {
                return addDoc(collection(db, COLLECTIONS.WORKFLOWS), {
                    ...data,
                    createdAt: serverTimestamp(),
                    isActive: false
                })
            }
        }
    },

    // --- Funnels ---
    funnels: {
        async getPages(funnelId) {
            const q = query(
                collection(db, COLLECTIONS.PAGES),
                where('funnelId', '==', funnelId),
                orderBy('createdAt', 'desc')
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        },

        async savePageContent(pageId, content) {
            return updateDoc(doc(db, COLLECTIONS.PAGES, pageId), {
                content,
                updatedAt: serverTimestamp()
            })
        }
    }
}
