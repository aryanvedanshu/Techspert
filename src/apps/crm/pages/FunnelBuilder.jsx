import { useState } from 'react'
import {
    Layout, Type, Image, Video, MousePointer,
    Save, Eye, Settings, Plus, Trash2, Move
} from 'lucide-react'
import { motion } from 'framer-motion'

// Mock Components Library
const COMPONENTS = [
    { id: 'hero', label: 'Hero Section', icon: Layout },
    { id: 'text', label: 'Text Block', icon: Type },
    { id: 'image', label: 'Image', icon: Image },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'button', label: 'Button', icon: MousePointer },
]

const FunnelBuilder = () => {
    const [elements, setElements] = useState([
        { id: '1', type: 'hero', content: { title: 'Welcome to TechSpurt', subtitle: 'Master the Future of Tech' } },
        { id: '2', type: 'text', content: { text: 'Join thousands of students learning today.' } }
    ])
    const [selectedElement, setSelectedElement] = useState(null)

    const addElement = (type) => {
        const newElement = {
            id: Date.now().toString(),
            type,
            content: { text: 'New Element' }
        }
        setElements([...elements, newElement])
    }

    return (
        <div className="h-[calc(100vh-80px)] flex bg-neutral-950 overflow-hidden">
            {/* Sidebar - Components */}
            <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
                <div className="p-4 border-b border-neutral-800">
                    <h2 className="font-bold text-white">Components</h2>
                    <p className="text-xs text-neutral-500">Drag to add to page</p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                    {COMPONENTS.map((comp) => (
                        <button
                            key={comp.id}
                            onClick={() => addElement(comp.id)}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-primary-500 hover:bg-neutral-800/80 transition-all group"
                        >
                            <comp.icon size={24} className="text-neutral-400 group-hover:text-primary-500" />
                            <span className="text-xs font-medium text-neutral-300">{comp.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 flex flex-col relative">
                {/* Toolbar */}
                <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        </div>
                        <span className="text-sm font-medium text-neutral-400">/ landing-page-v1</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                            <Eye size={18} />
                        </button>
                        <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                            <Settings size={18} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors">
                            <Save size={16} />
                            Save
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-neutral-950 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className="max-w-4xl mx-auto min-h-[800px] bg-white rounded-none shadow-2xl">
                        {elements.map((el, index) => (
                            <div
                                key={el.id}
                                onClick={() => setSelectedElement(el)}
                                className={`relative group border-2 border-transparent hover:border-primary-500 transition-all ${selectedElement?.id === el.id ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}`}
                            >
                                {/* Element Controls */}
                                <div className="absolute top-0 right-0 -mt-8 hidden group-hover:flex items-center gap-1 bg-primary-500 text-white px-2 py-1 rounded-t-lg text-xs font-medium z-10">
                                    <span>{el.type}</span>
                                    <div className="w-px h-3 bg-white/20 mx-1"></div>
                                    <button className="hover:text-white/80"><Move size={12} /></button>
                                    <button className="hover:text-white/80" onClick={(e) => { e.stopPropagation(); setElements(elements.filter(e => e.id !== el.id)) }}><Trash2 size={12} /></button>
                                </div>

                                {/* Element Content Rendering */}
                                <div className="p-8">
                                    {el.type === 'hero' && (
                                        <div className="text-center py-12">
                                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{el.content.title}</h1>
                                            <p className="text-xl text-gray-600">{el.content.subtitle}</p>
                                        </div>
                                    )}
                                    {el.type === 'text' && (
                                        <p className="text-gray-700 leading-relaxed">{el.content.text}</p>
                                    )}
                                    {el.type === 'button' && (
                                        <div className="text-center">
                                            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Click Me</button>
                                        </div>
                                    )}
                                    {/* Fallback */}
                                    {!['hero', 'text', 'button'].includes(el.type) && (
                                        <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                            {el.type} placeholder
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {elements.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-32">
                                <p>Drag components here to build your page</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Properties Panel */}
            {selectedElement && (
                <div className="w-72 bg-neutral-900 border-l border-neutral-800 flex flex-col">
                    <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                        <h2 className="font-bold text-white">Properties</h2>
                        <button onClick={() => setSelectedElement(null)}><Trash2 size={16} className="text-neutral-500 hover:text-white" /></button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">Type</label>
                            <input type="text" value={selectedElement.type} disabled className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-400 text-sm" />
                        </div>
                        {/* Dynamic fields based on type would go here */}
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">Content</label>
                            <textarea className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm h-32" defaultValue="Edit content here..."></textarea>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FunnelBuilder
