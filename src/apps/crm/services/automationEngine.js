import { db } from '../../../config/firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'

/**
 * Automation Engine Core Logic
 * This service handles the execution of automation workflows.
 * In a production environment, this would largely run on Cloud Functions.
 */

export const automationEngine = {
    /**
     * Trigger a workflow based on an event
     * @param {string} eventType - e.g., 'contact.created', 'form.submitted'
     * @param {object} data - Context data (contactId, formId, etc.)
     */
    async trigger(eventType, data) {
        console.log(`[Automation] Triggered: ${eventType}`, data)

        // 1. Find active workflows with this trigger
        const q = query(
            collection(db, 'crmWorkflows'),
            where('isActive', '==', true),
            where('trigger.type', '==', eventType)
        )

        const snapshot = await getDocs(q)

        if (snapshot.empty) {
            console.log('[Automation] No matching workflows found.')
            return
        }

        // 2. Execute each matching workflow
        snapshot.forEach(async (docSnap) => {
            const workflow = { id: docSnap.id, ...docSnap.data() }
            await this.executeWorkflow(workflow, data)
        })
    },

    /**
     * Execute a specific workflow instance
     */
    async executeWorkflow(workflow, context) {
        console.log(`[Automation] Executing workflow: ${workflow.name}`, context)

        // Start from the first node connected to the trigger
        // This is a simplified traversal logic
        const startNode = workflow.nodes.find(n => n.type === 'trigger')
        if (!startNode) return

        let currentNode = this.getNextNode(workflow, startNode.id)

        while (currentNode) {
            await this.executeNode(currentNode, context)

            // If it's a wait node, stop execution and queue it
            if (currentNode.type === 'wait') {
                await this.queueExecution(workflow.id, currentNode.id, context)
                break
            }

            currentNode = this.getNextNode(workflow, currentNode.id)
        }
    },

    /**
     * Execute a single node's logic
     */
    async executeNode(node, context) {
        console.log(`[Automation] Executing node: ${node.type}`, node.data)

        switch (node.type) {
            case 'action_email':
                // Call Email Service
                console.log('Sending email to', context.email)
                break
            case 'action_tag':
                // Add Tag to Contact
                console.log('Adding tag', node.data.tag, 'to contact', context.contactId)
                break
            case 'action_pipeline':
                // Move pipeline stage
                console.log('Moving contact', context.contactId, 'to stage', node.data.stageId)
                break
            default:
                break
        }
    },

    /**
     * Find the next node in the graph
     */
    getNextNode(workflow, currentNodeId) {
        const edge = workflow.edges.find(e => e.source === currentNodeId)
        if (!edge) return null
        return workflow.nodes.find(n => n.id === edge.target)
    },

    /**
     * Queue execution for later (Cloud Function would pick this up)
     */
    async queueExecution(workflowId, nodeId, context) {
        await addDoc(collection(db, 'automationQueue'), {
            workflowId,
            nodeId,
            context,
            status: 'pending',
            scheduledFor: serverTimestamp() // + delay logic
        })
        console.log('[Automation] Queued for later execution')
    }
}
