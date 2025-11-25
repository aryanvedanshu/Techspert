import { useState, useCallback } from 'react'
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState
} from 'reactflow'
import 'reactflow/dist/style.css'

const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Trigger: Contact Created' },
        position: { x: 250, y: 25 },
        style: { background: '#10b981', color: 'white', border: 'none', borderRadius: '8px' }
    },
    {
        id: '2',
        data: { label: 'Action: Send Welcome Email' },
        position: { x: 250, y: 125 },
        style: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px' }
    },
]

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true }
]

const WorkflowBuilder = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

    return (
        <div className="h-[calc(100vh-120px)] bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white">New Automation Workflow</h1>
                    <p className="text-sm text-neutral-400">Drag nodes to build your automation logic</p>
                </div>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors">
                    Save Workflow
                </button>
            </div>

            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="bg-neutral-950"
                >
                    <Background color="#333" gap={16} />
                    <Controls className="bg-neutral-800 border-neutral-700 fill-white" />
                    <MiniMap
                        nodeColor={(n) => {
                            if (n.style?.background) return n.style.background;
                            return '#fff';
                        }}
                        maskColor="rgba(0, 0, 0, 0.7)"
                        className="bg-neutral-900 border border-neutral-800"
                    />
                </ReactFlow>
            </div>
        </div>
    )
}

export default WorkflowBuilder
