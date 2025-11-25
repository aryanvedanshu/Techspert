import { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Plus, MoreHorizontal, Search, Filter } from 'lucide-react'
import { crmService } from '../../services/crmService'

// Mock Data for Development
const MOCK_STAGES = [
    {
        id: 'stage_1', name: 'New Lead', color: 'blue', items: [
            { id: 'c1', name: 'Alice Johnson', value: '$1,200', title: 'Interested in Full Stack' },
            { id: 'c2', name: 'Bob Smith', value: '$800', title: 'Demo Request' }
        ]
    },
    {
        id: 'stage_2', name: 'Contacted', color: 'yellow', items: [
            { id: 'c3', name: 'Charlie Brown', value: '$2,500', title: 'Corporate Training' }
        ]
    },
    { id: 'stage_3', name: 'Demo Scheduled', color: 'purple', items: [] },
    {
        id: 'stage_4', name: 'Proposal Sent', color: 'orange', items: [
            { id: 'c4', name: 'David Wilson', value: '$5,000', title: 'Custom Bundle' }
        ]
    },
    {
        id: 'stage_5', name: 'Won', color: 'emerald', items: [
            { id: 'c5', name: 'Eve Davis', value: '$1,200', title: 'Enrolled' }
        ]
    }
]

const PipelineCard = ({ item }) => (
    <motion.div
        layoutId={item.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 shadow-sm cursor-grab active:cursor-grabbing group hover:border-primary-500/50 transition-colors"
    >
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-white">{item.name}</h4>
            <button className="text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} />
            </button>
        </div>
        <p className="text-sm text-neutral-400 mb-3">{item.title}</p>
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                {item.value}
            </span>
            <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-300">
                {item.name.charAt(0)}
            </div>
        </div>
    </motion.div>
)

const PipelineStage = ({ stage, onAddDeal }) => (
    <div className="flex-shrink-0 w-80 flex flex-col h-full">
        <div className={`flex items-center justify-between p-3 mb-2 rounded-xl bg-${stage.color}-500/10 border border-${stage.color}-500/20`}>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-${stage.color}-500`} />
                <h3 className={`font-medium text-${stage.color}-500`}>{stage.name}</h3>
                <span className="text-xs text-neutral-500 font-medium bg-neutral-800 px-2 py-0.5 rounded-full">
                    {stage.items.length}
                </span>
            </div>
            <button className={`text-${stage.color}-500 hover:bg-${stage.color}-500/20 p-1 rounded-lg transition-colors`}>
                <MoreHorizontal size={16} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {stage.items.map((item) => (
                <PipelineCard key={item.id} item={item} />
            ))}

            <button
                onClick={() => onAddDeal(stage.id)}
                className="w-full py-3 border border-dashed border-neutral-700 rounded-xl text-neutral-500 hover:text-primary-400 hover:border-primary-500/50 hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
                <Plus size={16} />
                Add Deal
            </button>
        </div>
    </div>
)

const Pipelines = () => {
    const [stages, setStages] = useState(MOCK_STAGES)

    const handleAddDeal = (stageId) => {
        // Logic to open modal and add deal
        console.log('Add deal to stage', stageId)
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Sales Pipeline</h1>
                    <p className="text-neutral-400 text-sm">Manage your deals and track progress</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search deals..."
                            className="bg-neutral-900 border border-neutral-700 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-primary-500 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl border border-neutral-700 transition-colors">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-600/20">
                        <Plus size={18} />
                        <span>New Deal</span>
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
                <div className="flex gap-6 h-full min-w-max px-1">
                    {stages.map((stage) => (
                        <PipelineStage
                            key={stage.id}
                            stage={stage}
                            onAddDeal={handleAddDeal}
                        />
                    ))}

                    {/* Add Stage Button */}
                    <button className="flex-shrink-0 w-80 h-16 border-2 border-dashed border-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-700 hover:bg-neutral-900 transition-all">
                        <span className="flex items-center gap-2 font-medium">
                            <Plus size={20} />
                            Add Stage
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Pipelines
