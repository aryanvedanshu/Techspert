import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Eye, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../../config/firebase'
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const AdminPageManagement = () => {
    const [pages, setPages] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPage, setEditingPage] = useState(null)

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        isPublished: true
    })

    useEffect(() => {
        fetchPages()
    }, [])

    const fetchPages = async () => {
        try {
            const q = query(collection(db, 'pages'), orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(q)
            const pagesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPages(pagesData)
        } catch (error) {
            console.error('Error fetching pages:', error)
            toast.error('Failed to fetch pages')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (page = null) => {
        if (page) {
            setEditingPage(page)
            setFormData({
                title: page.title,
                slug: page.slug,
                content: page.content,
                isPublished: page.isPublished
            })
        } else {
            setEditingPage(null)
            setFormData({
                title: '',
                slug: '',
                content: '',
                isPublished: true
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const pageData = {
                ...formData,
                updatedAt: Timestamp.now()
            }

            if (editingPage) {
                await updateDoc(doc(db, 'pages', editingPage.id), pageData)
                toast.success('Page updated successfully')
            } else {
                pageData.createdAt = Timestamp.now()
                await addDoc(collection(db, 'pages'), pageData)
                toast.success('Page created successfully')
            }

            setIsModalOpen(false)
            fetchPages()
        } catch (error) {
            console.error('Error saving page:', error)
            toast.error('Failed to save page')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            try {
                await deleteDoc(doc(db, 'pages', id))
                toast.success('Page deleted successfully')
                fetchPages()
            } catch (error) {
                console.error('Error deleting page:', error)
                toast.error('Failed to delete page')
            }
        }
    }

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Page Management</h1>
                    <p className="text-neutral-600">Create and manage custom pages</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={20} className="mr-2" />
                    Add New Page
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            {/* Pages List */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Updated</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {filteredPages.map((page) => (
                                <tr key={page.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">{page.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-neutral-500">/{page.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                                            }`}>
                                            {page.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                        {page.updatedAt?.toDate().toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => window.open(`/${page.slug}`, '_blank')}
                                                className="p-1 text-neutral-400 hover:text-primary-600 transition-colors"
                                                title="View Page"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(page)}
                                                className="p-1 text-neutral-400 hover:text-primary-600 transition-colors"
                                                title="Edit Page"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(page.id)}
                                                className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                                                title="Delete Page"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPage ? 'Edit Page' : 'Create New Page'}
                maxWidth="4xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Page Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Slug *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Content *
                        </label>
                        <div className="h-96 mb-12">
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(value) => setFormData({ ...formData, content: value })}
                                className="h-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="isPublished" className="text-sm text-neutral-700">
                            Publish this page
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Page'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default AdminPageManagement
