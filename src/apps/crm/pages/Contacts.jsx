import { useState, useEffect } from 'react'
import {
    Search, Filter, MoreHorizontal, Mail, Phone,
    MessageSquare, Plus, Download, Trash2, Edit
} from 'lucide-react'
import { crmService } from '../services/crmService'

// Mock Data
const MOCK_CONTACTS = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 (555) 123-4567', tags: ['Lead', 'Interested'], lastActive: '2 hours ago', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1 (555) 987-6543', tags: ['Customer', 'Enrolled'], lastActive: '1 day ago', status: 'Active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 (555) 456-7890', tags: ['Lead'], lastActive: '5 mins ago', status: 'Inactive' },
    { id: 4, name: 'David Wilson', email: 'david@example.com', phone: '+1 (555) 234-5678', tags: ['Alumni'], lastActive: '1 week ago', status: 'Active' },
    { id: 5, name: 'Eve Davis', email: 'eve@example.com', phone: '+1 (555) 876-5432', tags: ['Lead', 'Demo Booked'], lastActive: '3 days ago', status: 'Active' },
]

const Contacts = () => {
    const [contacts, setContacts] = useState(MOCK_CONTACTS)
    const [selectedContacts, setSelectedContacts] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    const toggleSelectAll = () => {
        if (selectedContacts.length === contacts.length) {
            setSelectedContacts([])
        } else {
            setSelectedContacts(contacts.map(c => c.id))
        }
    }

    const toggleSelect = (id) => {
        if (selectedContacts.includes(id)) {
            setSelectedContacts(selectedContacts.filter(cId => cId !== id))
        } else {
            setSelectedContacts([...selectedContacts, id])
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Contacts</h1>
                    <p className="text-neutral-400 text-sm">Manage your leads, students, and alumni</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl border border-neutral-700 transition-colors">
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-600/20">
                        <Plus size={18} />
                        <span>Add Contact</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-800 transition-colors">
                        <Filter size={18} />
                        <span>More Filters</span>
                    </button>
                    {selectedContacts.length > 0 && (
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-colors">
                            <Trash2 size={18} />
                            <span>Delete ({selectedContacts.length})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-950/50">
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="rounded border-neutral-700 bg-neutral-800 text-primary-500 focus:ring-primary-500/50"
                                        checked={selectedContacts.length === contacts.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Contact Info</th>
                                <th className="p-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Tags</th>
                                <th className="p-4 text-sm font-medium text-neutral-400 uppercase tracking-wider">Last Active</th>
                                <th className="p-4 text-sm font-medium text-neutral-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="group hover:bg-neutral-800/50 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-neutral-700 bg-neutral-800 text-primary-500 focus:ring-primary-500/50"
                                            checked={selectedContacts.includes(contact.id)}
                                            onChange={() => toggleSelect(contact.id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-primary-500 font-bold border border-neutral-700">
                                                {contact.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{contact.name}</p>
                                                <p className="text-xs text-neutral-500">ID: #{contact.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-neutral-300">
                                                <Mail size={14} className="text-neutral-500" />
                                                {contact.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-neutral-300">
                                                <Phone size={14} className="text-neutral-500" />
                                                {contact.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {contact.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-300">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-neutral-400">{contact.lastActive}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors" title="Message">
                                                <MessageSquare size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors" title="Edit">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-red-400 transition-colors" title="More">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-sm text-neutral-400">
                    <p>Showing 1 to 5 of 123 entries</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg border border-neutral-800 hover:bg-neutral-800 hover:text-white transition-colors">Previous</button>
                        <button className="px-3 py-1 rounded-lg border border-neutral-800 hover:bg-neutral-800 hover:text-white transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contacts
